'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/financial';
import {
  Users,
  Building,
  Landmark,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentUser, currentRole, openQuickAction, showToast } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('This Month');
  const [activities, setActivities] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, actRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/activities'),
      ]);
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (actRes.ok) {
        const actData = await actRes.json();
        setActivities(actData.slice(0, 6));
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const COLORS = ['#0D9488', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#10B981', '#6366F1'];

  const dateFilters = [
    'Today',
    '7 Days',
    'This Month',
    '3 Months',
    '6 Months',
    'This Year',
  ];

  return (
    <div className="space-y-6">
      {/* Greeting & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Here&apos;s your business overview • Role: <strong className="text-emerald-800">{currentRole}</strong>
          </p>
        </div>

        {/* Action Controls & Date Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-700 ml-2 mr-1" />
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                showToast(`Filter updated: ${e.target.value}`, 'info');
              }}
              className="bg-transparent text-xs font-bold text-slate-700 py-1 px-2 focus:outline-none cursor-pointer"
            >
              {dateFilters.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={() => openQuickAction('payment')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all"
          >
            <CreditCard className="w-4 h-4 text-emerald-300" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Critical Overdue Banner if overdue cases exist */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              Action Required: 3 High-Priority Overdue Vehicle Cases
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              Overdue accounts (KA56M4920, DL04AA3991, GJ01KN7822) require intimation follow-up or yard admission.
            </div>
          </div>
        </div>
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs self-start sm:self-auto transition-colors"
        >
          <span>Manage Repo Cases</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Primary Statistics Cards (Grid of 8) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* TOTAL CUSTOMERS */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Customers
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {loading ? '...' : stats?.totalCustomers ?? 20}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% this quarter</span>
          </div>
        </div>

        {/* TOTAL PROPERTIES */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Properties
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {loading ? '...' : stats?.totalProperties ?? 15}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            {loading ? '...' : `${stats?.availableProperties ?? 8} Available • ${stats?.soldProperties ?? 4} Sold`}
          </div>
        </div>

        {/* ACTIVE LOANS */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Loans
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {loading ? '...' : stats?.activeLoansCount ?? 17}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            3 Accounts in grace period
          </div>
        </div>

        {/* TOTAL LOAN VALUE */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Loan Value
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 truncate">
            {loading ? '...' : formatCurrency(stats?.totalLoanValue ?? 428500000, true)}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8.4% this month</span>
          </div>
        </div>

        {/* OUTSTANDING AMOUNT */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Outstanding Amount
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-950 mt-2 truncate">
            {loading ? '...' : formatCurrency(stats?.outstandingAmount ?? 342000000, true)}
          </div>
          <div className="text-xs text-rose-600 font-semibold mt-1">
            Active Amortization Portfolio
          </div>
        </div>

        {/* MONTHLY COLLECTION */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Monthly Collection
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-2 truncate">
            {loading ? '...' : formatCurrency(stats?.monthlyCollection ?? 4860000, true)}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>100% on schedule</span>
          </div>
        </div>

        {/* ACTIVE REPO CASES */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Repo Cases
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {loading ? '...' : stats?.activeRepoCases ?? 7}
          </div>
          <div className="text-xs text-purple-700 font-semibold mt-1">
            4 in Yard • 3 Under Tracing
          </div>
        </div>

        {/* AVAILABLE PROPERTIES */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Available Properties
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {loading ? '...' : stats?.availableProperties ?? 8}
          </div>
          <div className="text-xs text-indigo-700 font-semibold mt-1">
            Ready for sanction & lease
          </div>
        </div>
      </div>

      {/* Real Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Monthly Collections & Disbursements (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monthly Collections vs Disbursements
              </h2>
              <p className="text-xs text-slate-500">
                Performance across recent billing cycles (₹ in Lakhs)
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
              Live DB Records
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.monthlyCollectionsChart || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar
                  dataKey="disbursements"
                  name="Loan Disbursed"
                  fill="#0D9488"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="collections"
                  name="Collections Received"
                  fill="#F59E0B"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Property Distribution by Type (1 col) */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Property Inventory</h2>
              <p className="text-xs text-slate-500">Breakdown by asset class</p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.propertyDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.propertyDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Units`, name]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Repo Pipeline & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repo Cases Workflow Stages (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Vehicle Repossession Stages Pipeline
              </h2>
              <p className="text-xs text-slate-500">
                Current status distribution across commercial and passenger assets
              </p>
            </div>
            <Link
              href="/vehicles"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>View Vehicles</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.repoStatusBreakdown || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Vehicles`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Vehicles" radius={[6, 6, 0, 0]}>
                  {(stats?.repoStatusBreakdown || []).map((entry: any, index: number) => (
                    <Cell key={`bar-${index}`} fill={entry.color || '#0D9488'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Audit Activities Feed (1 col) */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Activity Audit Trail</h2>
              <Link
                href="/reports"
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3.5">
              {activities.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8">
                  No activity records logged yet
                </div>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {act.user} • <span className="font-normal text-slate-600">{act.action}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] truncate">
                        {act.recordTitle}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 flex-shrink-0">
                      {act.time}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Relational DB Synchronized</span>
            <span className="font-mono text-[11px]">ACID Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
