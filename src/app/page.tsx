'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/financial';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Truck,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  Clock,
  ChevronRight,
  MapPin,
  UserCheck,
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

  const focusVehicles = [
    { reg: 'KA56M4920', risk: 'Critical', location: 'Attibele Yard', status: 'Awaiting intimation' },
    { reg: 'DL04AA3991', risk: 'High', location: 'Delhi Holding Yard', status: 'Field follow-up' },
    { reg: 'GJ01KN7822', risk: 'Medium', location: 'Ahmedabad Yard', status: 'Yard admission review' },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      <div className="rounded-[28px] border border-emerald-500/15 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_20%),linear-gradient(135deg,#07141b_0%,#0b1d29_22%,#101f2d_60%,#0d1723_100%)] p-5 sm:p-6 shadow-[0_18px_60px_rgba(7,20,27,0.8)]">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-emerald-300/85">
              Fleet Control Room
            </p>
            <h1 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-white">
              {getGreeting()}, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Live repo operations, yard occupancy, escalation tracking, and vehicle recovery flow across the active portfolio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 shadow-inner shadow-black/20">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  showToast(`Filter updated: ${e.target.value}`, 'info');
                }}
                className="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer"
              >
                {dateFilters.map((f) => (
                  <option key={f} value={f} className="text-slate-900">
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 p-2.5 text-emerald-300 hover:bg-slate-800 transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => openQuickAction('vehicle')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5"
            >
              <Truck className="w-4 h-4" />
              Register Vehicle
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Fleet size</div>
            <div className="mt-3 text-2xl font-black text-white">{loading ? '...' : stats?.totalVehicles ?? 15}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Active cases</div>
            <div className="mt-3 text-2xl font-black text-white">{loading ? '...' : stats?.activeRepoCases ?? 7}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">In yard</div>
            <div className="mt-3 text-2xl font-black text-white">{loading ? '...' : stats?.vehiclesInYard ?? 4}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Recovered</div>
            <div className="mt-3 text-2xl font-black text-white">{loading ? '...' : stats?.vehiclesRecovered ?? 3}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-[linear-gradient(90deg,rgba(120,53,15,0.22),rgba(251,191,36,0.12),rgba(254,226,226,0.08))] p-4 sm:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-400 p-2.5 text-slate-950 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">High priority repo alerts</div>
              <div className="text-xs text-slate-300 mt-0.5">
                KA56M4920, DL04AA3991, and GJ01KN7822 need escalation or immediate yard follow-up.
              </div>
            </div>
          </div>

          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-slate-950 shadow-sm hover:bg-amber-300"
          >
            Manage cases
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Link href="/vehicles" className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.38)] hover:-translate-y-0.5 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Total vehicles</span>
            <div className="rounded-xl bg-sky-500/10 p-2 text-sky-300"><Truck className="w-4 h-4" /></div>
          </div>
          <div className="mt-4 text-3xl font-black text-white">{loading ? '...' : stats?.totalVehicles ?? 15}</div>
          <div className="mt-1 text-xs text-slate-400">Registered repo portfolio</div>
        </Link>

        <Link href="/vehicles" className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.38)] hover:-translate-y-0.5 hover:border-violet-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Vehicles located</span>
            <div className="rounded-xl bg-violet-500/10 p-2 text-violet-300"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="mt-4 text-3xl font-black text-white">{loading ? '...' : stats?.vehiclesLocated ?? 2}</div>
          <div className="mt-1 text-xs text-violet-300">Traced and awaiting intake</div>
        </Link>

        <Link href="/vehicles" className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.38)] hover:-translate-y-0.5 hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">In safe yard</span>
            <div className="rounded-xl bg-rose-500/10 p-2 text-rose-300"><ShieldCheck className="w-4 h-4" /></div>
          </div>
          <div className="mt-4 text-3xl font-black text-white">{loading ? '...' : stats?.vehiclesInYard ?? 4}</div>
          <div className="mt-1 text-xs text-rose-300">Secure custody tracked</div>
        </Link>

        <Link href="/vehicles" className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.38)] hover:-translate-y-0.5 hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">High priority</span>
            <div className="rounded-xl bg-red-500/10 p-2 text-red-300"><AlertTriangle className="w-4 h-4" /></div>
          </div>
          <div className="mt-4 text-3xl font-black text-white">{loading ? '...' : stats?.highPriorityOverdue ?? 3}</div>
          <div className="mt-1 text-xs text-red-300">Cases with &gt;90 days delay</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6 shadow-[0_10px_24px_rgba(15,23,42,0.38)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Repo pipeline overview</h2>
              <p className="text-xs text-slate-400">Vehicle stages across the recovery cycle</p>
            </div>
            <Link href="/vehicles" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300">
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.repoStatusBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: '#cbd5e1' }} angle={-18} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#cbd5e1' }} allowDecimals={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} vehicles`, 'Count']}
                  contentStyle={{ backgroundColor: '#020817', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)', color: '#fff' }}
                />
                <Bar dataKey="count" name="Vehicles" radius={[8, 8, 0, 0]}>
                  {(stats?.repoStatusBreakdown || []).map((entry: any, index: number) => (
                    <Cell key={`bar-${index}`} fill={entry.color || '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6 shadow-[0_10px_24px_rgba(15,23,42,0.38)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Priority watchlist</h2>
              <p className="text-xs text-slate-400">Vehicle numbers requiring attention</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {focusVehicles.map((v) => (
              <div key={v.reg} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="font-black text-white">{v.reg}</div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    v.risk === 'Critical' ? 'bg-red-500/15 text-red-300' :
                    v.risk === 'High' ? 'bg-amber-500/15 text-amber-300' :
                    'bg-emerald-500/15 text-emerald-300'
                  }`}>
                    {v.risk}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-300">{v.location}</div>
                <div className="mt-2 text-[11px] font-semibold text-slate-400">{v.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6 shadow-[0_10px_24px_rgba(15,23,42,0.38)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Fleet mix</h2>
              <p className="text-xs text-slate-400">Vehicle class allocation</p>
            </div>
          </div>

          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.vehicleTypeDistribution || []} cx="50%" cy="50%" innerRadius={55} outerRadius={86} paddingAngle={4} dataKey="value">
                  {(stats?.vehicleTypeDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} vehicles`, 'Count']}
                  contentStyle={{ backgroundColor: '#020817', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.2)', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6 shadow-[0_10px_24px_rgba(15,23,42,0.38)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Recent activity</h2>
              <p className="text-xs text-slate-400">Operational updates from the field</p>
            </div>
            <Link href="/reports" className="text-xs font-bold text-emerald-300">View reports</Link>
          </div>

          <div className="mt-5 space-y-3">
            {activities.length === 0 ? (
              <div className="text-xs text-slate-400 py-8 text-center">No activity records yet</div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white">{act.user}</div>
                      <div className="mt-0.5 text-xs text-slate-300">{act.action}</div>
                      <div className="mt-1 truncate text-[11px] text-slate-400">{act.recordTitle}</div>
                      <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">{act.time}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
