import fs from 'fs';
import path from 'path';
import {
  Customer,
  Property,
  Loan,
  LoanEMIScheduleItem,
  Payment,
  Vehicle,
  RepoStatusHistoryItem,
  Agent,
  DocumentRecord,
  NotificationItem,
  ActivityLog,
  BusinessSettings,
  User,
  RepoStatus,
} from '@/types';
import {
  initialUsers,
  initialCustomers,
  initialProperties,
  initialLoans,
  initialPayments,
  initialVehicles,
  initialRepoStatusHistory,
  initialAgents,
  initialDocuments,
  initialNotifications,
  initialActivityLogs,
  initialBusinessSettings,
} from './seedData';
import { calculateEMI, generateEMISchedule } from '@/lib/financial';

interface DatabaseSchema {
  users: User[];
  customers: Customer[];
  properties: Property[];
  loans: Loan[];
  emiSchedules: Record<string, LoanEMIScheduleItem[]>;
  payments: Payment[];
  vehicles: Vehicle[];
  repoStatusHistory: RepoStatusHistoryItem[];
  agents: Agent[];
  documents: DocumentRecord[];
  notifications: NotificationItem[];
  activityLogs: ActivityLog[];
  settings: BusinessSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'ssp_database.json');

// In-memory cache
let dbCache: DatabaseSchema | null = null;

export function getDatabase(): DatabaseSchema {
  return ensureDbInitialized();
}

function ensureDbInitialized(): DatabaseSchema {
  if (dbCache) return dbCache;

  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.error('Error creating data directory', e);
    }
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      dbCache = JSON.parse(content);
      return dbCache!;
    } catch (err) {
      console.error('Failed to read db file, re-initializing', err);
    }
  }

  // Build initial schedules for initial loans
  const initialSchedules: Record<string, LoanEMIScheduleItem[]> = {};
  initialLoans.forEach((l) => {
    // calculate how many EMIs are paid based on paidAmount
    const paidCount = l.emiAmount > 0 ? Math.floor(l.paidAmount / l.emiAmount) : 0;
    initialSchedules[l.loanId] = generateEMISchedule(
      l.loanId,
      l.principalAmount,
      l.interestRate,
      l.tenureMonths,
      l.startDate,
      paidCount
    );
  });

  const freshDb: DatabaseSchema = {
    users: initialUsers,
    customers: initialCustomers,
    properties: initialProperties,
    loans: initialLoans,
    emiSchedules: initialSchedules,
    payments: initialPayments,
    vehicles: initialVehicles,
    repoStatusHistory: initialRepoStatusHistory,
    agents: initialAgents,
    documents: initialDocuments,
    notifications: initialNotifications,
    activityLogs: initialActivityLogs,
    settings: initialBusinessSettings,
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(freshDb, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing initial db file', e);
  }

  dbCache = freshDb;
  return dbCache;
}

function saveDb(): void {
  if (!dbCache) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempPath = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(dbCache, null, 2), 'utf8');
    fs.renameSync(tempPath, DB_FILE);
  } catch (err) {
    console.error('Failed to persist database file', err);
  }
}

// ----------------------------------------------------
// DATABASE API REPOSITORY
// ----------------------------------------------------

export const db = {
  // RESET / RE-SEED
  resetToSampleData: () => {
    dbCache = null;
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    return ensureDbInitialized();
  },

  // USERS & AUTH
  getUsers: () => {
    const data = ensureDbInitialized();
    return data.users;
  },
  getUserByEmail: (email: string) => {
    const data = ensureDbInitialized();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  getUserById: (id: string) => {
    const data = ensureDbInitialized();
    return data.users.find((u) => u.id === id);
  },

  // CUSTOMERS
  getCustomers: (options?: { search?: string; agentId?: string }) => {
    const data = ensureDbInitialized();
    let list = [...data.customers];

    if (options?.agentId) {
      list = list.filter((c) => c.assignedAgentId === options.agentId);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.customerId.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.pan.toLowerCase().includes(q)
      );
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getCustomerById: (id: string) => {
    const data = ensureDbInitialized();
    const customer = data.customers.find((c) => c.id === id || c.customerId === id);
    if (!customer) return null;

    // Relational joins
    const loans = data.loans.filter((l) => l.customerId === customer.customerId);
    const properties = data.properties.filter((p) => p.customerId === customer.customerId);
    const vehicles = data.vehicles.filter((v) => v.customerId === customer.customerId);
    const payments = data.payments.filter((p) => p.customerId === customer.customerId);
    const documents = data.documents.filter((d) => d.entityId === customer.customerId);

    return {
      ...customer,
      loans,
      properties,
      vehicles,
      payments,
      documents,
    };
  },

  createCustomer: (customerData: Omit<Customer, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>) => {
    const data = ensureDbInitialized();
    const count = data.customers.length + 1;
    const customerId = `CUST-${1000 + count}`;
    const newCustomer: Customer = {
      ...customerData,
      id: `CUST-${count}`,
      customerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.customers.unshift(newCustomer);

    // Activity Log
    db.logActivity({
      user: 'Admin',
      userRole: 'ADMIN',
      action: 'Created Customer',
      module: 'Customers',
      recordId: customerId,
      recordTitle: newCustomer.name,
      newValue: `Phone: ${newCustomer.phone}, PAN: ${newCustomer.pan}`,
    });

    // Notification
    db.addNotification({
      title: 'New Customer Created',
      message: `Customer ${newCustomer.name} (${customerId}) was added successfully.`,
      type: 'NEW_CUSTOMER',
      linkUrl: `/customers`,
    });

    saveDb();
    return newCustomer;
  },

  updateCustomer: (id: string, updates: Partial<Customer>) => {
    const data = ensureDbInitialized();
    const index = data.customers.findIndex((c) => c.id === id || c.customerId === id);
    if (index === -1) return null;

    data.customers[index] = {
      ...data.customers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveDb();
    return data.customers[index];
  },

  deleteCustomer: (id: string) => {
    const data = ensureDbInitialized();
    const index = data.customers.findIndex((c) => c.id === id || c.customerId === id);
    if (index === -1) return false;
    const removed = data.customers.splice(index, 1)[0];

    db.logActivity({
      user: 'Admin',
      userRole: 'ADMIN',
      action: 'Deleted Customer',
      module: 'Customers',
      recordId: removed.customerId,
      recordTitle: removed.name,
      oldValue: removed.email,
    });

    saveDb();
    return true;
  },

  // PROPERTIES
  getProperties: (options?: {
    status?: string;
    propertyType?: string;
    city?: string;
    search?: string;
  }) => {
    const data = ensureDbInitialized();
    let list = [...data.properties];

    if (options?.status && options.status !== 'All') {
      list = list.filter((p) => p.status.toLowerCase() === options.status?.toLowerCase());
    }

    if (options?.propertyType && options.propertyType !== 'All') {
      list = list.filter((p) => p.propertyType === options.propertyType);
    }

    if (options?.city && options.city !== 'All') {
      list = list.filter((p) => p.city.toLowerCase() === options.city?.toLowerCase());
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.propertyId.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q)
      );
    }

    return list.map((p) => ({
      ...p,
      images: p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60']
    })).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getPropertyById: (id: string) => {
    const data = ensureDbInitialized();
    const property = data.properties.find((p) => p.id === id || p.propertyId === id);
    if (!property) return undefined;

    const documents = data.documents.filter((d) => d.entityId === property.propertyId);
    return {
      ...property,
      documentRecords: documents,
      images: property.images && property.images.length > 0 ? property.images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60']
    };
  },

  createProperty: (propertyData: Omit<Property, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>) => {
    const data = ensureDbInitialized();
    const count = data.properties.length + 1;
    const propertyId = `PROP-${2000 + count}`;
    const newProperty: Property = {
      ...propertyData,
      images: propertyData.images && propertyData.images.length > 0 ? propertyData.images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60'],
      id: `PROP-${count}`,
      propertyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.properties.unshift(newProperty);

    db.logActivity({
      user: 'Admin',
      userRole: 'ADMIN',
      action: 'Created Property',
      module: 'Properties',
      recordId: propertyId,
      recordTitle: newProperty.title,
      newValue: `Price: ₹${newProperty.price}, Type: ${newProperty.propertyType}`,
    });

    db.addNotification({
      title: 'New Property Listed',
      message: `${newProperty.title} was listed in ${newProperty.city} for ₹${newProperty.price}.`,
      type: 'NEW_PROPERTY',
      linkUrl: `/properties`,
    });

    saveDb();
    return newProperty;
  },

  updateProperty: (id: string, updates: Partial<Property>) => {
    const data = ensureDbInitialized();
    const index = data.properties.findIndex((p) => p.id === id || p.propertyId === id);
    if (index === -1) return null;

    data.properties[index] = {
      ...data.properties[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveDb();
    return data.properties[index];
  },

  deleteProperty: (id: string) => {
    const data = ensureDbInitialized();
    const index = data.properties.findIndex((p) => p.id === id || p.propertyId === id);
    if (index === -1) return false;
    const removed = data.properties.splice(index, 1)[0];

    db.logActivity({
      user: 'Admin',
      userRole: 'ADMIN',
      action: 'Deleted Property',
      module: 'Properties',
      recordId: removed.propertyId,
      recordTitle: removed.title,
    });

    saveDb();
    return true;
  },

  // LOANS & EMI
  getLoans: (options?: {
    status?: string;
    loanType?: string;
    customerId?: string;
    agentId?: string;
    search?: string;
  }) => {
    const data = ensureDbInitialized();
    let list = [...data.loans];

    if (options?.status && options.status !== 'All') {
      list = list.filter((l) => l.status.toLowerCase() === options.status?.toLowerCase());
    }

    if (options?.loanType && options.loanType !== 'All') {
      list = list.filter((l) => l.loanType === options.loanType);
    }

    if (options?.customerId) {
      list = list.filter((l) => l.customerId === options.customerId);
    }

    if (options?.agentId) {
      list = list.filter((l) => l.assignedAgentId === options.agentId);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.loanId.toLowerCase().includes(q) ||
          l.customerName.toLowerCase().includes(q) ||
          l.loanType.toLowerCase().includes(q)
      );
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getLoanById: (id: string) => {
    const data = ensureDbInitialized();
    const loan = data.loans.find((l) => l.id === id || l.loanId === id);
    if (!loan) return null;

    const schedule = data.emiSchedules[loan.loanId] || [];
    const payments = data.payments.filter((p) => p.loanId === loan.loanId);
    const documents = data.documents.filter((d) => d.entityId === loan.loanId);

    return {
      ...loan,
      schedule,
      payments,
      documents,
    };
  },

  getEMISchedule: (loanId: string): LoanEMIScheduleItem[] => {
    const data = ensureDbInitialized();
    return data.emiSchedules[loanId] || [];
  },

  createLoan: (
    loanInput: Omit<
      Loan,
      'id' | 'loanId' | 'emiAmount' | 'paidAmount' | 'outstandingAmount' | 'createdAt' | 'updatedAt'
    >
  ) => {
    const data = ensureDbInitialized();
    const count = data.loans.length + 1;
    const loanId = `LN-${3000 + count}`;

    const { monthlyEMI } = calculateEMI(
      loanInput.principalAmount,
      loanInput.interestRate,
      loanInput.tenureMonths
    );

    const newLoan: Loan = {
      ...loanInput,
      id: `LN-${count}`,
      loanId,
      emiAmount: monthlyEMI,
      paidAmount: 0,
      outstandingAmount: loanInput.principalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.loans.unshift(newLoan);

    // Generate complete EMI schedule
    data.emiSchedules[loanId] = generateEMISchedule(
      loanId,
      newLoan.principalAmount,
      newLoan.interestRate,
      newLoan.tenureMonths,
      newLoan.startDate,
      0
    );

    db.logActivity({
      user: 'Admin',
      userRole: 'ADMIN',
      action: 'Created Loan',
      module: 'Loans',
      recordId: loanId,
      recordTitle: `${newLoan.loanType} for ${newLoan.customerName}`,
      newValue: `Principal: ₹${newLoan.principalAmount}, EMI: ₹${monthlyEMI}`,
    });

    db.addNotification({
      title: 'New Loan Sanctioned',
      message: `Loan ${loanId} for ${newLoan.customerName} of ₹${newLoan.principalAmount} was approved.`,
      type: 'NEW_LOAN',
      linkUrl: `/loans`,
    });

    saveDb();
    return newLoan;
  },

  updateLoan: (id: string, updates: Partial<Loan>) => {
    const data = ensureDbInitialized();
    const index = data.loans.findIndex((l) => l.id === id || l.loanId === id);
    if (index === -1) return null;

    data.loans[index] = {
      ...data.loans[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveDb();
    return data.loans[index];
  },

  deleteLoan: (id: string) => {
    const data = ensureDbInitialized();
    const index = data.loans.findIndex((l) => l.id === id || l.loanId === id);
    if (index === -1) return false;
    const removed = data.loans.splice(index, 1)[0];
    delete data.emiSchedules[removed.loanId];

    db.logActivity({
      user: 'Admin',
      userRole: 'ADMIN',
      action: 'Deleted Loan',
      module: 'Loans',
      recordId: removed.loanId,
      recordTitle: `${removed.loanType} - ${removed.customerName}`,
    });

    saveDb();
    return true;
  },

  // PAYMENTS & RECEIPT ENGINE
  getPayments: (options?: { loanId?: string; customerId?: string; search?: string }) => {
    const data = ensureDbInitialized();
    let list = [...data.payments];

    if (options?.loanId) {
      list = list.filter((p) => p.loanId === options.loanId);
    }

    if (options?.customerId) {
      list = list.filter((p) => p.customerId === options.customerId);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.receiptNumber.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.loanId.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q)
      );
    }

    return list.sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
  },

  getPaymentById: (id: string) => {
    const data = ensureDbInitialized();
    return data.payments.find(
      (p) => p.id === id || p.paymentId === id || p.receiptNumber === id
    );
  },

  recordPayment: (paymentInput: {
    loanId: string;
    customerId: string;
    customerName: string;
    amount: number;
    paymentDate: string;
    paymentMethod: Payment['paymentMethod'];
    transactionId: string;
    collectedBy: string;
    notes?: string;
  }) => {
    const data = ensureDbInitialized();
    const count = data.payments.length + 1;
    const paymentId = `PAY-${4000 + count}`;
    const year = new Date().getFullYear();
    const receiptNumber = `SSP-REC-${year}-${String(count).padStart(3, '0')}`;

    const newPayment: Payment = {
      ...paymentInput,
      id: `PAY-${count}`,
      paymentId,
      receiptNumber,
      status: 'Success',
      createdAt: new Date().toISOString(),
    };

    data.payments.unshift(newPayment);

    // Automatically update the loan balance & EMI schedule
    const loanIndex = data.loans.findIndex((l) => l.loanId === paymentInput.loanId);
    if (loanIndex !== -1) {
      const currentLoan = data.loans[loanIndex];
      const newPaid = currentLoan.paidAmount + paymentInput.amount;
      const newOutstanding = Math.max(0, currentLoan.outstandingAmount - paymentInput.amount);
      const isCompleted = newOutstanding <= 0;

      // Update schedule item
      const schedule = data.emiSchedules[paymentInput.loanId];
      if (schedule && schedule.length > 0) {
        // Find next unpaid EMI
        const pendingEmi = schedule.find((s) => s.status === 'Pending' || s.status === 'Overdue');
        if (pendingEmi) {
          pendingEmi.status = 'Paid';
          pendingEmi.paidAmount = paymentInput.amount;
          pendingEmi.paidDate = paymentInput.paymentDate;
        }
      }

      data.loans[loanIndex] = {
        ...currentLoan,
        paidAmount: newPaid,
        outstandingAmount: newOutstanding,
        status: isCompleted ? 'Completed' : currentLoan.status === 'Overdue' ? 'Active' : currentLoan.status,
        updatedAt: new Date().toISOString(),
      };
    }

    // Activity Log
    db.logActivity({
      user: paymentInput.collectedBy || 'Admin',
      userRole: 'ADMIN',
      action: 'Recorded Payment',
      module: 'Payments',
      recordId: receiptNumber,
      recordTitle: `₹${paymentInput.amount} for ${paymentInput.customerName} (${paymentInput.loanId})`,
      newValue: `Method: ${paymentInput.paymentMethod}, Tx: ${paymentInput.transactionId}`,
    });

    // Notification
    db.addNotification({
      title: 'Payment Received',
      message: `Received ₹${paymentInput.amount.toLocaleString('en-IN')} from ${paymentInput.customerName} for ${paymentInput.loanId}. Receipt #${receiptNumber}`,
      type: 'PAYMENT_RECEIVED',
      linkUrl: `/payments`,
    });

    saveDb();
    return newPayment;
  },

  // VEHICLES & REPO MANAGEMENT
  getVehicles: (options?: {
    repoStatus?: string;
    vehicleType?: string;
    search?: string;
    agentId?: string;
  }) => {
    const data = ensureDbInitialized();
    let list = [...data.vehicles];

    if (options?.repoStatus && options.repoStatus !== 'All') {
      list = list.filter(
        (v) => v.repoStatus.toLowerCase() === options.repoStatus?.toLowerCase()
      );
    }

    if (options?.vehicleType && options.vehicleType !== 'All') {
      list = list.filter((v) => v.vehicleType === options.vehicleType);
    }

    if (options?.agentId) {
      list = list.filter((v) => v.assignedAgentId === options.agentId);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (v) =>
          v.regNumber.toLowerCase().includes(q) ||
          v.chassisNumber.toLowerCase().includes(q) ||
          v.engineNumber.toLowerCase().includes(q) ||
          v.ownerName.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          (v.loanId && v.loanId.toLowerCase().includes(q))
      );
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getVehicleById: (id: string) => {
    const data = ensureDbInitialized();
    const vehicle = data.vehicles.find((v) => v.id === id || v.vehicleId === id || v.regNumber === id);
    if (!vehicle) return null;

    const history = data.repoStatusHistory.filter((h) => h.vehicleId === vehicle.vehicleId);
    const documents = data.documents.filter((d) => d.entityId === vehicle.vehicleId);

    return {
      ...vehicle,
      history,
      documents,
    };
  },

  createVehicle: (vehicleData: Omit<Vehicle, 'id' | 'vehicleId' | 'createdAt' | 'updatedAt'>) => {
    const data = ensureDbInitialized();
    const count = data.vehicles.length + 1;
    const vehicleId = `VEH-${5000 + count}`;
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `VEH-${count}`,
      vehicleId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.vehicles.unshift(newVehicle);

    // Initial repo history entry
    const historyItem: RepoStatusHistoryItem = {
      id: `RSH-${data.repoStatusHistory.length + 1}`,
      vehicleId,
      regNumber: newVehicle.regNumber,
      user: 'Admin',
      role: 'ADMIN',
      oldStatus: 'Pending',
      newStatus: newVehicle.repoStatus,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: `Vehicle entered into system with status ${newVehicle.repoStatus}`,
      location: newVehicle.location,
    };
    data.repoStatusHistory.unshift(historyItem);

    db.logActivity({
      user: 'Admin',
      userRole: 'ADMIN',
      action: 'Created Vehicle Record',
      module: 'Vehicles',
      recordId: vehicleId,
      recordTitle: `${newVehicle.regNumber} (${newVehicle.make} ${newVehicle.model})`,
      newValue: `Repo Status: ${newVehicle.repoStatus}`,
    });

    saveDb();
    return newVehicle;
  },

  updateVehicle: (id: string, updates: Partial<Vehicle>) => {
    const data = ensureDbInitialized();
    const index = data.vehicles.findIndex((v) => v.id === id || v.vehicleId === id);
    if (index === -1) return null;

    data.vehicles[index] = {
      ...data.vehicles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveDb();
    return data.vehicles[index];
  },

  deleteVehicle: (id: string) => {
    const data = ensureDbInitialized();
    const index = data.vehicles.findIndex((v) => v.id === id || v.vehicleId === id);
    if (index === -1) return false;
    const removed = data.vehicles.splice(index, 1)[0];

    db.logActivity({
      user: 'Admin',
      userRole: 'ADMIN',
      action: 'Deleted Vehicle',
      module: 'Vehicles',
      recordId: removed.vehicleId,
      recordTitle: removed.regNumber,
    });

    saveDb();
    return true;
  },

  updateRepoStatus: (
    vehicleId: string,
    newStatus: RepoStatus,
    user: string = 'Rahul Sharma',
    role: string = 'AGENT',
    notes: string = '',
    location?: string
  ) => {
    const data = ensureDbInitialized();
    const vehicle = data.vehicles.find((v) => v.id === vehicleId || v.vehicleId === vehicleId);
    if (!vehicle) return null;

    const oldStatus = vehicle.repoStatus;
    vehicle.repoStatus = newStatus;
    vehicle.updatedAt = new Date().toISOString();
    if (location) vehicle.location = location;

    const historyItem: RepoStatusHistoryItem = {
      id: `RSH-${data.repoStatusHistory.length + 1}`,
      vehicleId: vehicle.vehicleId,
      regNumber: vehicle.regNumber,
      user,
      role,
      oldStatus,
      newStatus,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: notes || `Status transitioned from ${oldStatus} to ${newStatus}`,
      location: location || vehicle.location,
    };
    data.repoStatusHistory.unshift(historyItem);

    // Activity Log
    db.logActivity({
      user,
      userRole: role as any,
      action: 'Changed Repo Status',
      module: 'Repo',
      recordId: vehicle.vehicleId,
      recordTitle: `${vehicle.regNumber} (${vehicle.make} ${vehicle.model})`,
      oldValue: oldStatus,
      newValue: newStatus,
    });

    // Notification
    db.addNotification({
      title: 'Repo Status Updated',
      message: `${user} changed ${vehicle.regNumber} status from "${oldStatus}" to "${newStatus}".`,
      type: 'REPO_STATUS',
      linkUrl: `/vehicles`,
    });

    saveDb();
    return { vehicle, historyItem };
  },

  getRepoStatusHistory: (vehicleId?: string) => {
    const data = ensureDbInitialized();
    if (vehicleId) {
      return data.repoStatusHistory.filter((h) => h.vehicleId === vehicleId);
    }
    return data.repoStatusHistory;
  },

  // AGENTS
  getAgents: (options?: { search?: string }) => {
    const data = ensureDbInitialized();
    let list = [...data.agents];
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.agentId.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.phone.includes(q)
      );
    }
    return list;
  },

  getAgentById: (id: string) => {
    const data = ensureDbInitialized();
    const agent = data.agents.find((a) => a.id === id || a.agentId === id);
    if (!agent) return null;

    const assignedLoans = data.loans.filter((l) => l.assignedAgentId === agent.agentId);
    const assignedVehicles = data.vehicles.filter((v) => v.assignedAgentId === agent.agentId);
    const assignedCustomers = data.customers.filter((c) => c.assignedAgentId === agent.agentId);

    return {
      ...agent,
      assignedLoans,
      assignedVehicles,
      assignedCustomers,
    };
  },

  createAgent: (agentData: Omit<Agent, 'id' | 'agentId'>) => {
    const data = ensureDbInitialized();
    const count = data.agents.length + 1;
    const agentId = `AGT-${7000 + count}`;
    const newAgent: Agent = {
      ...agentData,
      id: `AGT-${count}`,
      agentId,
    };
    data.agents.unshift(newAgent);

    db.logActivity({
      user: 'Admin',
      userRole: 'ADMIN',
      action: 'Created Agent',
      module: 'Agents',
      recordId: agentId,
      recordTitle: newAgent.name,
      newValue: `City: ${newAgent.city}, Phone: ${newAgent.phone}`,
    });

    saveDb();
    return newAgent;
  },

  updateAgent: (id: string, updates: Partial<Agent>) => {
    const data = ensureDbInitialized();
    const index = data.agents.findIndex((a) => a.id === id || a.agentId === id);
    if (index === -1) return null;
    data.agents[index] = { ...data.agents[index], ...updates };
    saveDb();
    return data.agents[index];
  },

  deleteAgent: (id: string) => {
    const data = ensureDbInitialized();
    const index = data.agents.findIndex((a) => a.id === id || a.agentId === id);
    if (index === -1) return false;
    data.agents.splice(index, 1);
    saveDb();
    return true;
  },

  // DOCUMENTS
  getDocuments: (options?: { category?: string; entityType?: string; entityId?: string; search?: string }) => {
    const data = ensureDbInitialized();
    let list = [...data.documents];

    if (options?.category && options.category !== 'All') {
      list = list.filter((d) => d.category === options.category);
    }

    if (options?.entityType && options.entityType !== 'All') {
      list = list.filter((d) => d.entityType === options.entityType);
    }

    if (options?.entityId) {
      list = list.filter((d) => d.entityId === options.entityId);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.documentId.toLowerCase().includes(q) ||
          (d.entityName && d.entityName.toLowerCase().includes(q))
      );
    }

    return list.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  },

  createDocument: (docData: Omit<DocumentRecord, 'id' | 'documentId' | 'uploadedAt'>) => {
    const data = ensureDbInitialized();
    const count = data.documents.length + 1;
    const documentId = `DOC-${8000 + count}`;
    const newDoc: DocumentRecord = {
      ...docData,
      id: `DOC-${count}`,
      documentId,
      uploadedAt: new Date().toISOString(),
    };
    data.documents.unshift(newDoc);

    db.logActivity({
      user: docData.uploadedBy || 'Admin',
      userRole: 'ADMIN',
      action: 'Uploaded Document',
      module: 'Documents',
      recordId: documentId,
      recordTitle: newDoc.name,
      newValue: `Category: ${newDoc.category}, Size: ${newDoc.fileSize}`,
    });

    db.addNotification({
      title: 'Document Uploaded',
      message: `${newDoc.name} was added to ${newDoc.category}.`,
      type: 'DOCUMENT_UPLOADED',
      linkUrl: `/documents`,
    });

    saveDb();
    return newDoc;
  },

  deleteDocument: (id: string) => {
    const data = ensureDbInitialized();
    const index = data.documents.findIndex((d) => d.id === id || d.documentId === id);
    if (index === -1) return false;
    const removed = data.documents.splice(index, 1)[0];

    db.logActivity({
      user: 'Admin',
      userRole: 'ADMIN',
      action: 'Deleted Document',
      module: 'Documents',
      recordId: removed.documentId,
      recordTitle: removed.name,
    });

    saveDb();
    return true;
  },

  // NOTIFICATIONS
  getNotifications: () => {
    const data = ensureDbInitialized();
    return [...data.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const data = ensureDbInitialized();
    const newItem: NotificationItem = {
      ...item,
      id: `NOTIF-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    data.notifications.unshift(newItem);
    saveDb();
    return newItem;
  },

  markNotificationRead: (id: string) => {
    const data = ensureDbInitialized();
    const notif = data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      saveDb();
    }
    return notif;
  },

  markAllNotificationsRead: () => {
    const data = ensureDbInitialized();
    data.notifications.forEach((n) => {
      n.isRead = true;
    });
    saveDb();
    return true;
  },

  // ACTIVITY LOGS
  getActivityLogs: (limit: number = 50) => {
    const data = ensureDbInitialized();
    return [...data.activityLogs]
      .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime())
      .slice(0, limit);
  },

  logActivity: (log: Omit<ActivityLog, 'id' | 'date' | 'time'>) => {
    const data = ensureDbInitialized();
    const now = new Date();
    const newLog: ActivityLog = {
      ...log,
      id: `ACT-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    data.activityLogs.unshift(newLog);
    saveDb();
    return newLog;
  },

  // SETTINGS
  getSettings: () => {
    const data = ensureDbInitialized();
    return data.settings;
  },

  updateSettings: (updates: Partial<BusinessSettings>) => {
    const data = ensureDbInitialized();
    data.settings = { ...data.settings, ...updates };
    saveDb();
    return data.settings;
  },

  // AGGREGATE DASHBOARD METRICS
  getDashboardStats: () => {
    const data = ensureDbInitialized();

    const totalCustomers = data.customers.length;
    const totalProperties = data.properties.length;
    const availableProperties = data.properties.filter((p) => p.status === 'Available').length;
    const soldProperties = data.properties.filter((p) => p.status === 'Sold').length;

    const activeLoans = data.loans.filter((l) => l.status === 'Active' || l.status === 'Overdue');
    const totalLoanValue = data.loans.reduce((sum, l) => sum + l.principalAmount, 0);
    const outstandingAmount = data.loans.reduce((sum, l) => sum + l.outstandingAmount, 0);
    const totalCollected = data.loans.reduce((sum, l) => sum + l.paidAmount, 0);

    // Monthly Collection (August + September payments)
    const currentMonthPayments = data.payments.filter((p) => p.status === 'Success');
    const monthlyCollection = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

    const activeRepoCases = data.vehicles.filter(
      (v) =>
        v.repoStatus === 'Assigned' ||
        v.repoStatus === 'Agent Visit' ||
        v.repoStatus === 'Vehicle Located' ||
        v.repoStatus === 'In Yard' ||
        v.repoStatus === 'Verification'
    ).length;

    // Monthly Collections Chart Data
    const monthlyCollectionsChart = [
      { month: 'Apr 2024', collections: 1850000, disbursements: 4500000 },
      { month: 'May 2024', collections: 2420000, disbursements: 6200000 },
      { month: 'Jun 2024', collections: 3100000, disbursements: 5800000 },
      { month: 'Jul 2024', collections: 3890000, disbursements: 7400000 },
      { month: 'Aug 2024', collections: 4650000, disbursements: 8900000 },
      { month: 'Sep 2024', collections: monthlyCollection > 0 ? monthlyCollection : 5120000, disbursements: 9500000 },
    ];

    // Repo Status Breakdown
    const repoStatusBreakdown = [
      { status: 'Pending', count: data.vehicles.filter((v) => v.repoStatus === 'Pending').length, color: '#EAB308' },
      { status: 'Assigned', count: data.vehicles.filter((v) => v.repoStatus === 'Assigned').length, color: '#3B82F6' },
      { status: 'Agent Visit', count: data.vehicles.filter((v) => v.repoStatus === 'Agent Visit').length, color: '#8B5CF6' },
      { status: 'Vehicle Located', count: data.vehicles.filter((v) => v.repoStatus === 'Vehicle Located').length, color: '#EC4899' },
      { status: 'In Yard', count: data.vehicles.filter((v) => v.repoStatus === 'In Yard').length, color: '#EF4444' },
      { status: 'Verification', count: data.vehicles.filter((v) => v.repoStatus === 'Verification').length, color: '#F97316' },
      { status: 'On Hold', count: data.vehicles.filter((v) => v.repoStatus === 'On Hold').length, color: '#6B7280' },
      { status: 'Released', count: data.vehicles.filter((v) => v.repoStatus === 'Released').length, color: '#10B981' },
      { status: 'Completed', count: data.vehicles.filter((v) => v.repoStatus === 'Completed').length, color: '#059669' },
    ];

    // Property Types breakdown
    const propertyTypeCounts = data.properties.reduce((acc, p) => {
      acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const propertyDistribution = Object.entries(propertyTypeCounts).map(([type, count]) => ({
      name: type,
      value: count,
    }));

    // Loan Types breakdown
    const loanTypeCounts = data.loans.reduce((acc, l) => {
      acc[l.loanType] = (acc[l.loanType] || 0) + l.principalAmount;
      return acc;
    }, {} as Record<string, number>);

    const loanDistribution = Object.entries(loanTypeCounts).map(([name, amount]) => ({
      name,
      amount,
    }));

    return {
      totalCustomers,
      totalProperties,
      availableProperties,
      soldProperties,
      activeLoansCount: activeLoans.length,
      totalLoanValue,
      outstandingAmount,
      totalCollected,
      monthlyCollection,
      activeRepoCases,
      monthlyCollectionsChart,
      repoStatusBreakdown,
      propertyDistribution,
      loanDistribution,
    };
  },

  // GLOBAL DYNAMIC SEARCH
  globalSearch: (query: string) => {
    if (!query || query.trim().length < 2) return { customers: [], properties: [], loans: [], vehicles: [], documents: [] };
    const q = query.trim().toLowerCase();
    const data = ensureDbInitialized();

    const customers = data.customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.customerId.toLowerCase().includes(q))
      .slice(0, 5);

    const properties = data.properties
      .filter((p) => p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.propertyId.toLowerCase().includes(q))
      .slice(0, 5);

    const loans = data.loans
      .filter((l) => l.loanId.toLowerCase().includes(q) || l.customerName.toLowerCase().includes(q) || l.loanType.toLowerCase().includes(q))
      .slice(0, 5);

    const vehicles = data.vehicles
      .filter(
        (v) =>
          v.regNumber.toLowerCase().includes(q) ||
          v.chassisNumber.toLowerCase().includes(q) ||
          v.make.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.ownerName.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const documents = data.documents
      .filter((d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
      .slice(0, 5);

    return { customers, properties, loans, vehicles, documents };
  },
};
