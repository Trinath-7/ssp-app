'use client';

import React, { useState, useEffect } from 'react';
import { Payment } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/financial';
import { ReceiptModal } from '@/components/modals/ReceiptModal';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function PaymentsPage() {
  const { openQuickAction, showToast } = useApp();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const paymentMethods = ['All', 'Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Other'];

  const filteredPayments = payments.filter((p) => {
    if (methodFilter !== 'All' && p.paymentMethod !== methodFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.receiptNumber.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.loanId.toLowerCase().includes(q) ||
        p.transactionId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredPayments.map((p) => ({
        'Receipt Number': p.receiptNumber,
        Customer: p.customerName,
        'Loan ID': p.loanId,
        Amount: p.amount,
        Date: p.paymentDate,
        Method: p.paymentMethod,
        'Transaction ID': p.transactionId,
        'Collected By': p.collectedBy,
        Status: p.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `SSP_Payments_${Date.now()}.csv`);
    showToast('Exported Payments to CSV');
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredPayments.map((p) => ({
        'Receipt Number': p.receiptNumber,
        Customer: p.customerName,
        'Loan ID': p.loanId,
        Amount: p.amount,
        Date: p.paymentDate,
        Method: p.paymentMethod,
        'Transaction ID': p.transactionId,
        'Collected By': p.collectedBy,
        Status: p.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `SSP_Payments_${Date.now()}.xlsx`);
    showToast('Exported Payments to Excel');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-emerald-700" />
            <span>Payment Tracking & Receipts</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Real-time collection log, automated balance clearance, and computer-generated receipts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => openQuickAction('payment')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Payments Recorded</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{payments.length} Transactions</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Gross Collections</span>
          <div className="text-2xl font-black text-emerald-950 mt-1">{formatCurrency(totalCollected)}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Success Rate</span>
          <div className="text-2xl font-black text-slate-900 mt-1">100% Cleared</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by receipt number (SSP-REC-...), customer, loan ID, or transaction hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            {paymentMethods.map((m) => (
              <option key={m} value={m}>
                Method: {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Receipt #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Loan ID</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment Date</th>
                <th className="p-3.5">Method & Reference</th>
                <th className="p-3.5">Collected By</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">
                    {p.receiptNumber}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    <div>{p.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{p.customerId}</div>
                  </td>
                  <td className="p-3.5 font-mono text-emerald-800 font-bold">{p.loanId}</td>
                  <td className="p-3.5 font-black text-emerald-950 text-sm">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">{p.paymentDate}</td>
                  <td className="p-3.5 text-slate-700">
                    <div className="font-semibold">{p.paymentMethod}</div>
                    <div className="text-[10px] font-mono text-slate-400">{p.transactionId}</div>
                  </td>
                  <td className="p-3.5 text-slate-600">{p.collectedBy}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{p.status}</span>
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setActiveReceipt(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <ReceiptModal payment={activeReceipt} onClose={() => setActiveReceipt(null)} />
    </div>
  );
}
