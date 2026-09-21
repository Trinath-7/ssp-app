'use client';

import React, { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatCurrency, createWhatsAppLink } from '@/lib/financial';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Landmark,
  Building,
  Truck,
  CreditCard,
  FileText,
  Trash2,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function CustomersPage() {
  const { openQuickAction, showToast } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenCustomer = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCustomer(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.customerId.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.pan.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredCustomers.map((c) => ({
        'Customer ID': c.customerId,
        Name: c.name,
        Phone: c.phone,
        Email: c.email,
        City: c.city,
        State: c.state,
        PAN: c.pan,
        'Aadhaar Status': c.aadhaarStatus,
        Occupation: c.occupation,
        'Annual Income': c.annualIncome,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    XLSX.writeFile(wb, `SSP_Customers_${Date.now()}.csv`);
    showToast('Exported Customers to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-700" />
            <span>Customer Directory & KYC</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Borrower portfolios, identity verification, linked assets, and direct communications ({customers.length} records)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => openQuickAction('customer')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, PAN, ID, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">City & State</th>
                <th className="p-3.5">PAN & KYC</th>
                <th className="p-3.5">Occupation & Income</th>
                <th className="p-3.5">Assigned Agent</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => handleOpenCustomer(c.customerId)}
                  className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                >
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[10px] font-mono text-emerald-800">{c.customerId}</div>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <div className="font-semibold">{c.phone}</div>
                    <div className="text-[10px] text-slate-400">{c.email}</div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div>{c.city}</div>
                    <div className="text-[10px] text-slate-400">{c.state}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-slate-800">{c.pan}</div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 mt-0.5">
                      {c.aadhaarStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <div className="font-medium">{c.occupation}</div>
                    <div className="text-[10px] text-emerald-800 font-bold">
                      {formatCurrency(c.annualIncome, true)}/yr
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">
                    {c.assignedAgentName || 'Unassigned'}
                  </td>
                  <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`tel:${c.phone}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-800 hover:bg-emerald-50"
                        title="Direct Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={createWhatsAppLink(
                          c.phone,
                          `Hello ${c.name}, this is SSP Properties & Loans regarding your account (${c.customerId}).`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                        title="WhatsApp Customer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleOpenCustomer(c.customerId)}
                        className="px-2 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-lg ml-1"
                      >
                        360° Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER 360° PROFILE MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {selectedCustomer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono text-emerald-800 font-bold">{selectedCustomer.customerId}</span>
                    <span>•</span>
                    <span>PAN: {selectedCustomer.pan}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-700">{selectedCustomer.aadhaarStatus}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Strip */}
            <div className="px-6 py-2.5 bg-emerald-900 text-white flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-3">
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-800 hover:bg-emerald-700 rounded-lg"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ({selectedCustomer.phone})</span>
                </a>
                <a
                  href={createWhatsAppLink(
                    selectedCustomer.phone,
                    `Hello ${selectedCustomer.name}, this is SSP Properties & Loans contacting you regarding your portfolio.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Message</span>
                </a>
              </div>
              <div className="text-[11px] text-emerald-200 font-medium">
                Annual Income: {formatCurrency(selectedCustomer.annualIncome)}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Address</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedCustomer.address}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">City & State</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedCustomer.city}, {selectedCustomer.state}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Occupation</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedCustomer.occupation}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Agent</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedCustomer.assignedAgentName || 'Rahul Sharma'}</div>
                </div>
              </div>

              {/* Linked Loans */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-700" />
                  <span>Linked Active Loans ({selectedCustomer.loans?.length || 0})</span>
                </h4>
                {(selectedCustomer.loans || []).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400">No active loans linked to customer.</div>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.loans.map((l: any) => (
                      <div key={l.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900 font-mono">{l.loanId} — {l.loanType}</div>
                          <div className="text-slate-500 text-[11px]">EMI: {formatCurrency(l.emiAmount)} • Due: {l.nextDueDate}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-rose-900">{formatCurrency(l.outstandingAmount)}</div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">{l.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Properties */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span>Linked Properties ({selectedCustomer.properties?.length || 0})</span>
                </h4>
                {(selectedCustomer.properties || []).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400">No properties registered under this customer.</div>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.properties.map((p: any) => (
                      <div key={p.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{p.title}</div>
                          <div className="text-slate-500 text-[11px]">{p.propertyType} • {p.city} • {p.area} {p.areaUnit}</div>
                        </div>
                        <div className="text-right font-black text-emerald-950">
                          {formatCurrency(p.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Vehicles */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>Linked Vehicles & Assets ({selectedCustomer.vehicles?.length || 0})</span>
                </h4>
                {(selectedCustomer.vehicles || []).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-400">No vehicles or repo records linked.</div>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.vehicles.map((v: any) => (
                      <div key={v.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-slate-900">{v.regNumber} ({v.make} {v.model})</div>
                          <div className="text-slate-500 text-[11px]">Location: {v.location}</div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">{v.repoStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
