import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getDatabase } from './index';

export interface DatabaseConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  provider: 'supabase' | 'local';
  url?: string;
  error?: string;
  latencyMs?: number;
  tableCounts?: Record<string, number>;
}

export async function testSupabaseConnection(
  url?: string,
  key?: string
): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const start = Date.now();
  try {
    const client = getSupabaseClient(url, key);
    if (!client) {
      return { success: false, message: 'Missing Supabase URL or Key', latencyMs: 0 };
    }

    // Try selecting from customers or checking database
    const { data, error } = await client.from('customers').select('id', { count: 'exact', head: true });
    const latencyMs = Date.now() - start;

    if (error) {
      // If table doesn't exist yet, connection might still be valid
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase! (Tables need to be created: copy schema.sql and run in Supabase SQL Editor)',
          latencyMs,
        };
      }
      return {
        success: false,
        message: `Supabase Error: ${error.message || error.code || 'Failed to query'}`,
        latencyMs,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase!',
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error connecting to Supabase',
      latencyMs: Date.now() - start,
    };
  }
}

export async function getSupabaseStatus(): Promise<DatabaseConnectionStatus> {
  const isConf = isSupabaseConfigured();
  if (!isConf) {
    return {
      isConfigured: false,
      isConnected: false,
      provider: 'local',
      url: undefined,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      isConfigured: false,
      isConnected: false,
      provider: 'local',
    };
  }

  const start = Date.now();
  try {
    const tables = ['customers', 'properties', 'loans', 'payments', 'vehicles', 'agents', 'documents'];
    const counts: Record<string, number> = {};

    let connected = true;
    for (const table of tables) {
      const { count, error } = await client.from(table).select('id', { count: 'exact', head: true });
      if (error) {
        connected = false;
        break;
      }
      counts[table] = count || 0;
    }

    const latencyMs = Date.now() - start;

    return {
      isConfigured: true,
      isConnected: connected,
      provider: connected ? 'supabase' : 'local',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      latencyMs,
      tableCounts: connected ? counts : undefined,
    };
  } catch (e: any) {
    return {
      isConfigured: true,
      isConnected: false,
      provider: 'local',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      error: e?.message,
    };
  }
}

export async function syncDataToSupabase(
  url?: string,
  key?: string
): Promise<{ success: boolean; message: string; results: Record<string, number> }> {
  const client = getSupabaseClient(url, key);
  if (!client) {
    throw new Error('Supabase client could not be initialized. Please check credentials.');
  }

  const db = getDatabase();
  const results: Record<string, number> = {};

  // 1. Users
  if (db.users && db.users.length > 0) {
    const records = db.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      avatar: u.avatar || null,
      status: u.status,
    }));
    const { error } = await client.from('users').upsert(records, { onConflict: 'id' });
    if (error) throw new Error(`Error syncing users: ${error.message}`);
    results['users'] = records.length;
  }

  // 2. Agents
  if (db.agents && db.agents.length > 0) {
    const records = db.agents.map((a) => ({
      id: a.id,
      agent_id: a.agentId,
      name: a.name,
      phone: a.phone,
      email: a.email || null,
      address: a.address || null,
      city: a.city || null,
      joining_date: a.joiningDate || null,
      status: a.status,
      assigned_cases_count: a.assignedCasesCount || 0,
      completed_cases_count: a.completedCasesCount || 0,
      rating: a.rating || 5.0,
    }));
    const { error } = await client.from('agents').upsert(records, { onConflict: 'id' });
    if (error) throw new Error(`Error syncing agents: ${error.message}`);
    results['agents'] = records.length;
  }

  // 3. Customers
  if (db.customers && db.customers.length > 0) {
    const records = db.customers.map((c) => ({
      id: c.id,
      customer_id: c.customerId,
      name: c.name,
      phone: c.phone,
      alt_phone: c.altPhone || null,
      email: c.email || null,
      dob: c.dob || null,
      address: c.address,
      city: c.city,
      state: c.state,
      pincode: c.pincode,
      pan: c.pan,
      aadhaar_status: c.aadhaarStatus,
      occupation: c.occupation,
      annual_income: c.annualIncome,
      assigned_agent_id: c.assignedAgentId || null,
      notes: c.notes || null,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));
    const { error } = await client.from('customers').upsert(records, { onConflict: 'id' });
    if (error) throw new Error(`Error syncing customers: ${error.message}`);
    results['customers'] = records.length;
  }

  // 4. Properties
  if (db.properties && db.properties.length > 0) {
    const records = db.properties.map((p) => ({
      id: p.id,
      property_id: p.propertyId,
      title: p.title,
      property_type: p.propertyType,
      location: p.location,
      address: p.address,
      city: p.city,
      state: p.state,
      pincode: p.pincode,
      area: p.area,
      area_unit: p.areaUnit,
      bedrooms: p.bedrooms || null,
      bathrooms: p.bathrooms || null,
      parking: p.parking || null,
      price: p.price,
      owner_name: p.ownerName,
      owner_phone: p.ownerPhone,
      status: p.status,
      description: p.description,
      images: p.images || [],
      documents: p.documents || [],
      featured: p.featured ?? false,
      customer_id: p.customerId || null,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }));
    const { error } = await client.from('properties').upsert(records, { onConflict: 'id' });
    if (error) throw new Error(`Error syncing properties: ${error.message}`);
    results['properties'] = records.length;
  }

  // 5. Loans
  if (db.loans && db.loans.length > 0) {
    const records = db.loans.map((l) => ({
      id: l.id,
      loan_id: l.loanId,
      customer_id: l.customerId,
      customer_name: l.customerName,
      loan_type: l.loanType,
      principal_amount: l.principalAmount,
      interest_rate: l.interestRate,
      tenure_months: l.tenureMonths,
      start_date: l.startDate,
      end_date: l.endDate,
      emi_amount: l.emiAmount,
      paid_amount: l.paidAmount,
      outstanding_amount: l.outstandingAmount,
      next_due_date: l.nextDueDate,
      status: l.status,
      assigned_agent_id: l.assignedAgentId || null,
      notes: l.notes || null,
      created_at: l.createdAt,
      updated_at: l.updatedAt,
    }));
    const { error } = await client.from('loans').upsert(records, { onConflict: 'id' });
    if (error) throw new Error(`Error syncing loans: ${error.message}`);
    results['loans'] = records.length;
  }

  // 6. Payments
  if (db.payments && db.payments.length > 0) {
    const records = db.payments.map((p) => ({
      id: p.id,
      payment_id: p.paymentId,
      receipt_number: p.receiptNumber,
      loan_id: p.loanId,
      customer_id: p.customerId,
      customer_name: p.customerName,
      amount: p.amount,
      payment_date: p.paymentDate,
      payment_method: p.paymentMethod,
      transaction_id: p.transactionId,
      collected_by: p.collectedBy,
      status: p.status,
      notes: p.notes || null,
      created_at: p.createdAt,
    }));
    const { error } = await client.from('payments').upsert(records, { onConflict: 'id' });
    if (error) throw new Error(`Error syncing payments: ${error.message}`);
    results['payments'] = records.length;
  }

  // 7. Vehicles
  if (db.vehicles && db.vehicles.length > 0) {
    const records = db.vehicles.map((v) => ({
      id: v.id,
      vehicle_id: v.vehicleId,
      reg_number: v.regNumber,
      chassis_number: v.chassisNumber || null,
      engine_number: v.engineNumber || null,
      make: v.make,
      model: v.model,
      vehicle_type: v.vehicleType,
      manufacturing_year: v.manufacturingYear,
      color: v.color || null,
      owner_name: v.ownerName,
      owner_phone: v.ownerPhone,
      customer_id: v.customerId || null,
      loan_id: v.loanId || null,
      finance_company: v.financeCompany || null,
      assigned_agent_id: v.assignedAgentId || null,
      location: v.location,
      yard_location: v.yardLocation || null,
      repo_status: v.repoStatus,
      overdue_amount: v.overdueAmount,
      overdue_days: v.overdueDays,
      upload_date: v.uploadDate,
      confirmer_name: v.confirmerName || null,
      confirmer_phone: v.confirmerPhone || null,
      agency_name: v.agencyName || null,
      notes: v.notes || null,
    }));
    const { error } = await client.from('vehicles').upsert(records, { onConflict: 'id' });
    if (error) throw new Error(`Error syncing vehicles: ${error.message}`);
    results['vehicles'] = records.length;
  }

  // 8. Documents
  if (db.documents && db.documents.length > 0) {
    const records = db.documents.map((d) => ({
      id: d.id,
      document_id: d.documentId,
      name: d.name,
      category: d.category,
      file_type: d.fileType,
      file_size: d.fileSize,
      file_url: d.fileUrl,
      entity_type: d.entityType,
      entity_id: d.entityId || null,
      entity_name: d.entityName || null,
      uploaded_by: d.uploadedBy,
      uploaded_at: d.uploadedAt,
    }));
    const { error } = await client.from('documents').upsert(records, { onConflict: 'id' });
    if (error) throw new Error(`Error syncing documents: ${error.message}`);
    results['documents'] = records.length;
  }

  // 9. Notifications
  if (db.notifications && db.notifications.length > 0) {
    const records = db.notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.linkUrl || null,
      is_read: n.isRead,
      created_at: n.createdAt,
    }));
    const { error } = await client.from('notifications').upsert(records, { onConflict: 'id' });
    if (error) throw new Error(`Error syncing notifications: ${error.message}`);
    results['notifications'] = records.length;
  }

  // 10. Activity Logs
  if (db.activityLogs && db.activityLogs.length > 0) {
    const records = db.activityLogs.map((l) => ({
      id: l.id,
      user_id: l.id,
      user_name: l.user,
      user_role: l.userRole,
      action: l.action,
      module: l.module,
      description: `${l.action} on ${l.recordTitle || l.recordId || ''}`,
      created_at: `${l.date}T${l.time || '00:00:00'}Z`,
    }));
    const { error } = await client.from('activity_logs').upsert(records, { onConflict: 'id' });
    if (error) throw new Error(`Error syncing activity_logs: ${error.message}`);
    results['activity_logs'] = records.length;
  }

  // 11. Business Settings
  if (db.settings) {
    const s = db.settings;
    const { error } = await client.from('business_settings').upsert(
      [
        {
          id: 'primary',
          company_name: s.companyName,
          email: s.email,
          phone: s.phone,
          address: s.address,
          city: s.city,
          state: s.state,
          pincode: s.pincode,
          website: s.website || null,
          tax_id: s.taxId || null,
          receipt_prefix: s.receiptPrefix,
          currency_symbol: s.currencySymbol,
          enable_whatsapp_intimation: s.enableWhatsAppIntimation,
          enable_sms_reminders: s.enableSmsReminders,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'id' }
    );
    if (!error) {
      results['business_settings'] = 1;
    }
  }

  return {
    success: true,
    message: `Successfully synchronized ${Object.values(results).reduce((a, b) => a + b, 0)} records across ${Object.keys(results).length} tables!`,
    results,
  };
}

