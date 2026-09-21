'use client';

import React, { useState, useEffect } from 'react';
import { BusinessSettings } from '@/types';
import { useApp } from '@/context/AppContext';
import { SSPLogo } from '@/components/common/SSPLogo';
import {
  Settings,
  Building,
  Shield,
  Bell,
  Database,
  RotateCcw,
  CheckCircle2,
  Lock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  Download,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Server,
  Zap,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const { showToast, currentRole, setCurrentRole } = useApp();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Database Connection State
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loadingDbStatus, setLoadingDbStatus] = useState(false);
  const [supabaseForm, setSupabaseForm] = useState({
    url: '',
    anonKey: '',
    serviceRoleKey: '',
  });
  const [showKeys, setShowKeys] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [savingDbConfig, setSavingDbConfig] = useState(false);
  const [syncingDb, setSyncingDb] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const fetchDbStatus = async () => {
    setLoadingDbStatus(true);
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDbStatus(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchDbStatus();
  }, []);

  const handleTestConnection = async () => {
    if (!supabaseForm.url || !supabaseForm.anonKey) {
      showToast('Please enter both Supabase Project URL and API Key', 'error');
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supabaseForm),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        showToast(`Connected to Supabase successfully (${data.latencyMs}ms)!`);
      } else {
        showToast(data.message || 'Connection failed', 'error');
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e?.message || 'Network error' });
      showToast('Connection test failed', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveDbConfig = async () => {
    if (!supabaseForm.url || !supabaseForm.anonKey) {
      showToast('Please enter Supabase Project URL and API Key', 'error');
      return;
    }
    setSavingDbConfig(true);
    try {
      const res = await fetch('/api/database/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supabaseForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Supabase credentials saved successfully to .env.local!');
        fetchDbStatus();
      } else {
        showToast(data.message || 'Failed to save configuration', 'error');
      }
    } catch (e) {
      showToast('Error saving configuration', 'error');
    } finally {
      setSavingDbConfig(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncingDb(true);
    try {
      const res = await fetch('/api/database/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supabaseForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Records synchronized to Supabase successfully!');
        fetchDbStatus();
      } else {
        showToast(data.message || 'Failed to synchronize records. Please verify tables exist.', 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Sync error', 'error');
    } finally {
      setSyncingDb(false);
    }
  };

  const handleCopySchema = async () => {
    try {
      const res = await fetch('/api/database/backup?format=sql');
      const sqlText = await res.text();
      await navigator.clipboard.writeText(sqlText);
      setCopiedSchema(true);
      showToast('Full schema.sql copied to clipboard! Paste it in your Supabase SQL Editor.');
      setTimeout(() => setCopiedSchema(false), 3500);
    } catch (e) {
      showToast('Failed to copy schema to clipboard', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast('Business details and settings saved successfully!');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDatabase = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        showToast('Database reset to fresh sample records! 20 customers, 15 properties, 20 loans restored.');
        setShowResetConfirm(false);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const permissions = [
    { module: 'Main Dashboard & KPI Charts', admin: true, manager: true, agent: true, staff: true },
    { module: 'Customer Management (360° Profile)', admin: true, manager: true, agent: 'Assigned', staff: 'Read-only' },
    { module: 'Property Listings & Title Deeds', admin: true, manager: true, agent: 'Assigned', staff: 'Read-only' },
    { module: 'Loan Sanctioning & EMI Schedule', admin: true, manager: true, agent: 'View assigned', staff: false },
    { module: 'Payment Collection & Receipts', admin: true, manager: true, agent: true, staff: true },
    { module: 'Vehicle Repo & RTO Search', admin: true, manager: true, agent: 'Assigned cases', staff: false },
    { module: 'Repo Workflow Status Transitions', admin: true, manager: true, agent: 'Field visits & Yard', staff: false },
    { module: 'Document Upload & Downloads', admin: true, manager: true, agent: true, staff: true },
    { module: 'Executive Reports & Excel Export', admin: true, manager: true, agent: false, staff: false },
    { module: 'Business Settings & DB Backup', admin: true, manager: false, agent: false, staff: false },
  ];

  if (loading || !settings) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent mr-2"></div>
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-emerald-700" />
          <span>Business Profile & Platform Settings</span>
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-0.5">
          Manage corporate branding, contact channels, role-based access rules, and database persistence
        </p>
      </div>

      {/* Business Details Form */}
      <form onSubmit={handleSave} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <SSPLogo size="md" />
            <div>
              <h2 className="font-bold text-base text-slate-900">Commercial Business Profile</h2>
              <span className="text-xs text-slate-500">Appears on receipts, statements, and brochures</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Company Name</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
              required
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Support Phone</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Official Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 uppercase mb-1">Head Office Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">City & State</label>
            <input
              type="text"
              value={`${settings.city}, ${settings.state}`}
              onChange={(e) => {
                const parts = e.target.value.split(',');
                setSettings({
                  ...settings,
                  city: parts[0]?.trim() || settings.city,
                  state: parts[1]?.trim() || settings.state,
                });
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">GSTIN / Tax ID</label>
            <input
              type="text"
              value={settings.taxId}
              onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Receipt Prefix</label>
            <input
              type="text"
              value={settings.receiptPrefix}
              onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Currency Symbol</label>
            <input
              type="text"
              value={settings.currencySymbol}
              onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
            />
          </div>
        </div>

        {/* System & Notification Toggles */}
        <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            Notification & Communication Automation
          </h3>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="font-bold text-slate-900">Enable Automated WhatsApp Intimations</span>
              <p className="text-slate-500 text-[11px]">Auto-generate pre-filled WhatsApp links for EMI due notices</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableWhatsAppIntimation}
              onChange={(e) =>
                setSettings({ ...settings, enableWhatsAppIntimation: e.target.checked })
              }
              className="w-4 h-4 accent-emerald-700"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="font-bold text-slate-900">SMS Reminders Dispatch</span>
              <p className="text-slate-500 text-[11px]">Trigger SMS alerts to registered borrower numbers</p>
            </div>
            <input
              type="checkbox"
              checked={settings.enableSmsReminders}
              onChange={(e) =>
                setSettings({ ...settings, enableSmsReminders: e.target.checked })
              }
              className="w-4 h-4 accent-emerald-700"
            />
          </div>
        </div>
      </form>

      {/* Role-Based Permissions Matrix */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-700" />
          <h2 className="font-bold text-base text-slate-900">Role-Based Access Control (RBAC) Matrix</h2>
        </div>
        <p className="text-xs text-slate-500">
          Enforced across all backend API endpoints and frontend controls.
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Module / Capability</th>
                <th className="p-3">ADMIN</th>
                <th className="p-3">MANAGER</th>
                <th className="p-3">AGENT</th>
                <th className="p-3">STAFF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-semibold text-slate-900">{p.module}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Full Access
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.manager === true ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {p.manager === true ? 'Allowed' : 'Restricted'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.agent === true ? 'bg-emerald-100 text-emerald-800' : p.agent === false ? 'bg-rose-50 text-rose-700' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {p.agent === true ? 'Allowed' : p.agent === false ? 'No' : String(p.agent)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.staff === true ? 'bg-emerald-100 text-emerald-800' : p.staff === false ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.staff === true ? 'Allowed' : p.staff === false ? 'No' : String(p.staff)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database Management & Supabase Cloud Connection */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span>Database Engine & Cloud Sync</span>
                  {dbStatus?.isSupabaseConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Supabase Cloud Active ({dbStatus.latencyMs || 0}ms)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      <Server className="w-3 h-3 text-slate-500" />
                      Local Relational JSON Engine
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seamlessly connect your remote Supabase / PostgreSQL database or run on the built-in local ACID relational engine.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDbStatus}
              disabled={loadingDbStatus}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Refresh Database Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDbStatus ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <a
              href="/api/database/backup?format=json"
              download
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Download JSON Database Backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup JSON</span>
            </a>
          </div>
        </div>

        {/* Database Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center">
          {[
            { label: 'Customers', count: dbStatus?.tableCounts?.customers ?? dbStatus?.localStats?.customers ?? 20 },
            { label: 'Properties', count: dbStatus?.tableCounts?.properties ?? dbStatus?.localStats?.properties ?? 15 },
            { label: 'Loans', count: dbStatus?.tableCounts?.loans ?? dbStatus?.localStats?.loans ?? 20 },
            { label: 'Payments', count: dbStatus?.tableCounts?.payments ?? dbStatus?.localStats?.payments ?? 30 },
            { label: 'Vehicles', count: dbStatus?.tableCounts?.vehicles ?? dbStatus?.localStats?.vehicles ?? 15 },
            { label: 'Agents', count: dbStatus?.tableCounts?.agents ?? dbStatus?.localStats?.agents ?? 8 },
            { label: 'Documents', count: dbStatus?.tableCounts?.documents ?? dbStatus?.localStats?.documents ?? 20 },
          ].map((stat, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="text-base font-black text-slate-900">{stat.count}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Supabase Connection Setup Box */}
        <div className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200/80 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
                S
              </div>
              <h3 className="font-bold text-sm text-slate-900">Connect Your Supabase Project</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleCopySchema}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-bold shadow-xs transition-colors"
              >
                {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedSchema ? 'Copied schema.sql!' : 'Copy SQL Schema'}</span>
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-bold shadow-xs transition-colors"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://your-project-ref.supabase.co"
                value={supabaseForm.url}
                onChange={(e) => setSupabaseForm({ ...supabaseForm, url: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Anon / Public API Key
                </label>
                <button
                  type="button"
                  onClick={() => setShowKeys(!showKeys)}
                  className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  {showKeys ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showKeys ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showKeys ? 'text' : 'password'}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseForm.anonKey}
                onChange={(e) => setSupabaseForm({ ...supabaseForm, anonKey: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Service Role Key <span className="text-slate-400 normal-case font-normal">(Optional for Admin DDL)</span>
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Optional)"
                value={supabaseForm.serviceRoleKey}
                onChange={(e) => setSupabaseForm({ ...supabaseForm, serviceRoleKey: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>
          </div>

          {/* Test Result Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <div className="flex-1">
                <span className="font-semibold">{testResult.message}</span>
                {testResult.latencyMs !== undefined && testResult.latencyMs > 0 && (
                  <span className="ml-2 font-mono text-[10px] px-1.5 py-0.5 bg-white/70 rounded">
                    {testResult.latencyMs}ms
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : 'text-amber-400'}`} />
              <span>{testingConnection ? 'Testing Connection...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveDbConfig}
              disabled={savingDbConfig}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingDbConfig ? 'Saving...' : 'Save Configuration'}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToSupabase}
              disabled={syncingDb}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingDb ? 'animate-spin' : ''}`} />
              <span>{syncingDb ? 'Syncing to Supabase...' : 'Sync Schema & Demo Records'}</span>
            </button>
          </div>
        </div>

        {/* 3-Step Supabase Setup Guide */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Quick 3-Step Setup Instructions</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] inline-flex items-center justify-center mr-1.5">
                1
              </span>
              <span className="font-bold text-slate-900">Run Schema SQL</span>
              <p className="text-slate-500 text-[11px] mt-1">
                Click <b>Copy SQL Schema</b> above. In your Supabase Dashboard, open <b>SQL Editor</b>, paste, and click <b>Run</b> to create the 13 tables.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] inline-flex items-center justify-center mr-1.5">
                2
              </span>
              <span className="font-bold text-slate-900">Copy API Keys</span>
              <p className="text-slate-500 text-[11px] mt-1">
                In Supabase, navigate to <b>Project Settings &gt; API</b>. Copy your <b>Project URL</b> and <b>anon/public key</b>, then paste them above.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px] inline-flex items-center justify-center mr-1.5">
                3
              </span>
              <span className="font-bold text-slate-900">Test &amp; Sync</span>
              <p className="text-slate-500 text-[11px] mt-1">
                Click <b>Test Connection</b> to confirm connectivity, then click <b>Sync Schema &amp; Demo Records</b> to populate initial records.
              </p>
            </div>
          </div>
        </div>

        {/* Local Persistence & Reset Options */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-900">Reset Built-in Local Engine Sample Data</span>
            <p className="text-slate-600 mt-0.5">
              Restores 20 customers, 15 properties, 20 loans, 30 payment receipts, 15 vehicles, 8 agents, and 20 documents in <code>data/ssp_database.json</code>.
            </p>
          </div>
          {showResetConfirm ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetDatabase}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-xs shadow-xs self-start sm:self-auto shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
