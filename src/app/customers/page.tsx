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
  Truck,
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
            <span>Borrower Directory & KYC</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Borrower portfolios, identity verification, linked vehicles & repo cases ({customers.length} records)
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
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Borrower</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">PAN / KYC</th>
                <th className="py-3 px-4">Occupation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading borrowers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No borrowers found matching &quot;{search}&quot;
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="font-mono text-[11px] text-emerald-800 font-semibold">{c.customerId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-900 font-medium">{c.phone}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[150px]">{c.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{c.city}</div>
                      <div className="text-slate-400 text-[11px]">{c.state}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800">{c.pan}</div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {c.aadhaarStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium">{c.occupation}</div>
                      <div className="text-slate-400 text-[11px]">
                        Income: {formatCurrency(c.annualIncome)}/yr
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
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
                            `Hello ${c.name}, this is SSP Vehicle Repo & Recovery regarding your account (${c.customerId}).`
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
                ))
              )}
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
                    `Hello ${selectedCustomer.name}, this is SSP Vehicle Repo & Recovery contacting you regarding your vehicle account (${selectedCustomer.customerId}).`
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

              {/* Linked Vehicles & Repo Cases */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-700" />
                    <span>Linked Vehicles & Repo Cases ({selectedCustomer.vehicles?.length || 0})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">Active repossession & yard records</span>
                </h4>
                {(selectedCustomer.vehicles || []).length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center border border-dashed border-slate-200 text-xs text-slate-400">
                    No vehicles or repossession records linked to this borrower account.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.vehicles.map((v: any) => (
                      <div key={v.id} className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-900">{v.regNumber}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {v.vehicleType}
                            </span>
                          </div>
                          <div className="text-slate-600 font-medium text-xs mt-1">
                            {v.make} {v.model} ({v.year || 2022}) • Color: {v.color || 'Standard'}
                          </div>
                          <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                            Chassis: {v.chassisNumber} • Engine: {v.engineNumber || 'N/A'}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-1">
                            📍 Current Location: <span className="font-medium text-slate-700">{v.location}</span>
                          </div>
                        </div>
                        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            v.repoStatus === 'In Yard' ? 'bg-rose-100 text-rose-800' :
                            v.repoStatus === 'Vehicle Located' ? 'bg-purple-100 text-purple-800' :
                            v.repoStatus === 'Released' || v.repoStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {v.repoStatus}
                          </span>
                          <span className="text-[11px] font-semibold text-rose-600">
                            {v.overdueDays ? `${v.overdueDays}d Overdue` : 'Assigned Case'}
                          </span>
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
