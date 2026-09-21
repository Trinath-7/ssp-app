'use client';

import React, { useState, useEffect } from 'react';
import { Agent } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  UserCheck,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Landmark,
  Building,
  Truck,
  X,
} from 'lucide-react';

export default function AgentsPage() {
  const { showToast } = useApp();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Bangalore',
    rating: 4.8,
  });

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load agents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleOpenAgent = async (id: string) => {
    try {
      const res = await fetch(`/api/agents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAgent(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.phone) {
      showToast('Name and phone are required', 'warning');
      return;
    }
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        showToast('Field Agent appointed successfully!');
        setShowAddModal(false);
        fetchAgents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAgents = agents.filter((a) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        a.agentId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAssigned = agents.reduce((s, a) => s + (a.assignedCasesCount || 0), 0);
  const totalCompleted = agents.reduce((s, a) => s + (a.completedCasesCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-emerald-700" />
            <span>Agent & Field Operations</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Field agents, repo case assignments, collection officers, and performance ratings
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Appoint Agent</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Officers</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{agents.length} Agents</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Active Field Force</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">
            {agents.filter((a) => a.status === 'Active').length} Active
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Assigned Repo Cases</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{totalAssigned} Cases</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Resolved Recoveries</span>
          <div className="text-2xl font-black text-purple-900 mt-1">{totalCompleted} Cases</div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by agent name, phone, city, or agent ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Agents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAgents.map((a) => (
          <div
            key={a.id}
            onClick={() => handleOpenAgent(a.agentId)}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all p-5 flex flex-col justify-between cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-black text-base flex items-center justify-center shadow-xs">
                  {a.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-amber-900 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{a.rating}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono font-bold text-emerald-800">{a.agentId}</div>
                <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-800 transition-colors mt-0.5">
                  {a.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{a.city}</span>
                </div>
              </div>

              {/* Case Counts */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Active</div>
                  <div className="font-black text-slate-900 mt-0.5">{a.assignedCasesCount} Cases</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Completed</div>
                  <div className="font-black text-emerald-900 mt-0.5">{a.completedCasesCount} Resolved</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
              <a
                href={`tel:${a.phone}`}
                className="flex items-center gap-1 text-slate-600 hover:text-emerald-800 font-semibold"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{a.phone}</span>
              </a>
              <button
                onClick={() => handleOpenAgent(a.agentId)}
                className="font-bold text-emerald-800 hover:text-emerald-950"
              >
                Portfolio →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AGENT PORTFOLIO MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {selectedAgent.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedAgent.name}</h3>
                  <div className="text-xs text-slate-500 font-mono">
                    ID: {selectedAgent.agentId} • {selectedAgent.city} • Rating: {selectedAgent.rating} ★
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Assigned Loans</span>
                  <div className="text-xl font-black text-emerald-950 mt-1">{selectedAgent.assignedLoans?.length || 0}</div>
                </div>
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-blue-800">Assigned Vehicles</span>
                  <div className="text-xl font-black text-blue-950 mt-1">{selectedAgent.assignedVehicles?.length || 0}</div>
                </div>
                <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200">
                  <span className="text-[10px] uppercase font-bold text-purple-800">Borrower Accounts</span>
                  <div className="text-xl font-black text-purple-950 mt-1">{selectedAgent.assignedCustomers?.length || 0}</div>
                </div>
              </div>

              {/* Assigned Vehicles / Repo cases */}
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Assigned Vehicles & Repo Cases ({selectedAgent.assignedVehicles?.length || 0})
                </h4>
                {(selectedAgent.assignedVehicles || []).length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400">No vehicles assigned currently.</div>
                ) : (
                  <div className="space-y-2">
                    {selectedAgent.assignedVehicles.map((v: any) => (
                      <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-slate-900">{v.regNumber}</span>
                          <span className="text-slate-500 ml-2">({v.make} {v.model})</span>
                          <div className="text-[10px] text-slate-400">Location: {v.location}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {v.repoStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPOINT AGENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Appoint New Field Agent</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Agent Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    placeholder="9845012345"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Operating City</label>
                  <input
                    type="text"
                    value={addForm.city}
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="agent@sspproperties.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900"
                >
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
