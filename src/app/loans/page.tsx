'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loan, LoanEMIScheduleItem } from '@/types';
import { useApp } from '@/context/AppContext';
import { calculateEMI, formatCurrency } from '@/lib/financial';
import {
  Landmark,
  Plus,
  Search,
  Download,
  Calculator,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import * as XLSX from 'xlsx';

export default function LoansPage() {
  const { openQuickAction, showToast } = useApp();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'loans' | 'calculator'>('loans');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // EMI Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(2500000);
  const [calcRate, setCalcRate] = useState<number>(8.5);
  const [calcTenure, setCalcTenure] = useState<number>(120);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/loans');
      if (res.ok) {
        const data = await res.json();
        setLoans(data);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load loans', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const statuses = ['All', 'Active', 'Overdue', 'Completed', 'Pending'];
  const loanTypes = [
    'All',
    'Home Loan',
    'Property Loan',
    'Vehicle Loan',
    'Business Loan',
    'Personal Loan',
    'Mortgage Loan',
  ];

  const filteredLoans = loans.filter((l) => {
    if (statusFilter !== 'All' && l.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (typeFilter !== 'All' && l.loanType !== typeFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        l.loanId.toLowerCase().includes(q) ||
        l.customerName.toLowerCase().includes(q) ||
        l.loanType.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenLoanDetail = async (loanId: string) => {
    try {
      const res = await fetch(`/api/loans/${loanId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedLoan(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredLoans.map((l) => ({
        'Loan ID': l.loanId,
        Customer: l.customerName,
        'Loan Type': l.loanType,
        'Principal Amount': l.principalAmount,
        'Interest Rate (%)': l.interestRate,
        Tenure: `${l.tenureMonths} Months`,
        'Monthly EMI': l.emiAmount,
        'Paid Amount': l.paidAmount,
        'Outstanding Balance': l.outstandingAmount,
        Status: l.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Loans');
    XLSX.writeFile(wb, `SSP_Loans_${Date.now()}.csv`);
    showToast('Exported Loans to CSV');
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredLoans.map((l) => ({
        'Loan ID': l.loanId,
        Customer: l.customerName,
        'Loan Type': l.loanType,
        'Principal Amount': l.principalAmount,
        'Interest Rate (%)': l.interestRate,
        Tenure: `${l.tenureMonths} Months`,
        'Monthly EMI': l.emiAmount,
        'Paid Amount': l.paidAmount,
        'Outstanding Balance': l.outstandingAmount,
        Status: l.status,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Loans');
    XLSX.writeFile(wb, `SSP_Loans_${Date.now()}.xlsx`);
    showToast('Exported Loans to Excel');
  };

  // EMI Calculator Results
  const calculated = calculateEMI(calcAmount, calcRate, calcTenure);
  const pieData = [
    { name: 'Principal Amount', value: calcAmount, color: '#0D9488' },
    { name: 'Total Interest', value: calculated.totalInterest, color: '#F59E0B' },
  ];

  // Aggregate Header stats
  const totalLoanVal = loans.reduce((s, l) => s + l.principalAmount, 0);
  const totalOutstanding = loans.reduce((s, l) => s + l.outstandingAmount, 0);
  const activeCount = loans.filter((l) => l.status === 'Active').length;
  const overdueCount = loans.filter((l) => l.status === 'Overdue').length;
  const completedCount = loans.filter((l) => l.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Landmark className="w-7 h-7 text-emerald-700" />
            <span>Loan & EMI Management</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Asset financing, automated amortization schedules, and repayment monitoring
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
            <button
              onClick={() => setActiveTab('loans')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'loans'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Accounts</span>
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'calculator'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>EMI Calculator</span>
            </button>
          </div>

          <button
            onClick={() => openQuickAction('loan')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Sanction Loan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Loans</span>
          <div className="text-xl font-black text-slate-900 mt-1">{loans.length}</div>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Active</span>
          <div className="text-xl font-black text-emerald-900 mt-1">{activeCount}</div>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Overdue</span>
          <div className="text-xl font-black text-rose-900 mt-1">{overdueCount}</div>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completed</span>
          <div className="text-xl font-black text-slate-900 mt-1">{completedCount}</div>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Disbursed</span>
          <div className="text-lg font-black text-slate-900 mt-1 truncate">{formatCurrency(totalLoanVal, true)}</div>
        </div>
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Outstanding</span>
          <div className="text-lg font-black text-amber-900 mt-1 truncate">{formatCurrency(totalOutstanding, true)}</div>
        </div>
      </div>

      {/* TAB 1: LOAN ACCOUNTS */}
      {activeTab === 'loans' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search loan ID (LN-3001), customer, or loan type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                {loanTypes.map((t) => (
                  <option key={t} value={t}>
                    Type: {t}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExportExcel}
                className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                title="Export Excel"
              >
                <Download className="w-4 h-4 text-emerald-700" />
              </button>

              <button
                onClick={handleExportCSV}
                className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600"
                title="Export CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              </button>
            </div>
          </div>

          {/* Loans Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Loan ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Principal</th>
                    <th className="p-3.5">Rate & Tenure</th>
                    <th className="p-3.5">Monthly EMI</th>
                    <th className="p-3.5">Outstanding</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                        Loading loan accounts...
                      </td>
                    </tr>
                  ) : filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                        No loans found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map((l) => (
                      <tr
                        key={l.id}
                        onClick={() => handleOpenLoanDetail(l.loanId)}
                        className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                      >
                      <td className="p-3.5 font-black text-emerald-900 font-mono">
                        {l.loanId}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        <div>{l.customerName}</div>
                        <div className="text-[10px] font-normal text-slate-400">{l.customerId}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{l.loanType}</td>
                      <td className="p-3.5 font-black text-slate-900">
                        {formatCurrency(l.principalAmount)}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div>{l.interestRate}% p.a.</div>
                        <div className="text-[10px] text-slate-400">{l.tenureMonths} Months</div>
                      </td>
                      <td className="p-3.5 font-bold text-emerald-950">
                        {formatCurrency(l.emiAmount)}
                      </td>
                      <td className="p-3.5 font-black text-rose-900">
                        {formatCurrency(l.outstandingAmount)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            l.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l.status === 'Overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : l.status === 'Completed'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenLoanDetail(l.loanId)}
                          className="px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-lg"
                        >
                          Schedule
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE EMI CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders & Inputs (2 cols) */}
          <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Commercial EMI Amortization Calculator</h2>
              <p className="text-xs text-slate-500">
                Formula: EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1). Values update instantly.
              </p>
            </div>

            {/* Loan Amount Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Loan Amount (₹)
                </label>
                <div className="text-base font-black text-emerald-950 font-mono">
                  {formatCurrency(calcAmount)}
                </div>
              </div>
              <input
                type="range"
                min={100000}
                max={50000000}
                step={50000}
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>₹1 Lakh</span>
                <span>₹2.5 Cr</span>
                <span>₹5 Cr</span>
              </div>
            </div>

            {/* Interest Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Annual Interest Rate (%)
                </label>
                <div className="text-base font-black text-emerald-950 font-mono">
                  {calcRate}% p.a.
                </div>
              </div>
              <input
                type="range"
                min={5}
                max={20}
                step={0.1}
                value={calcRate}
                onChange={(e) => setCalcRate(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5%</span>
                <span>12%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Loan Tenure Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tenure (Months)
                </label>
                <div className="text-base font-black text-emerald-950 font-mono">
                  {calcTenure} Months ({(calcTenure / 12).toFixed(1)} Years)
                </div>
              </div>
              <input
                type="range"
                min={12}
                max={360}
                step={6}
                value={calcTenure}
                onChange={(e) => setCalcTenure(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 Year</span>
                <span>15 Years</span>
                <span>30 Years</span>
              </div>
            </div>

            {/* Key Computed Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Monthly EMI
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-1">
                  {formatCurrency(calculated.monthlyEMI)}
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Total Interest
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                  {formatCurrency(calculated.totalInterest)}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Total Payable
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {formatCurrency(calculated.totalPayable)}
                </div>
              </div>
            </div>
          </div>

          {/* Principal vs Interest Pie Chart (1 col) */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Principal vs Interest Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution of overall outflow</p>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatCurrency(Number(val)), '']}
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

            <button
              onClick={() => openQuickAction('loan')}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Sanction Loan With These Terms
            </button>
          </div>
        </div>
      )}

      {/* LOAN DETAIL & EMI SCHEDULE MODAL */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900">
                  {selectedLoan.loanId}
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedLoan.customerName} • {selectedLoan.loanType}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Customer ID: {selectedLoan.customerId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Financial Progress Bar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Principal Sanctioned:</span>{' '}
                    <strong className="text-slate-900">{formatCurrency(selectedLoan.principalAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Outstanding:</span>{' '}
                    <strong className="text-rose-900">{formatCurrency(selectedLoan.outstandingAmount)}</strong>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-700"
                    style={{
                      width: `${Math.min(
                        100,
                        (selectedLoan.paidAmount / (selectedLoan.principalAmount || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Paid: {formatCurrency(selectedLoan.paidAmount)}</span>
                  <span>Monthly EMI: {formatCurrency(selectedLoan.emiAmount)}</span>
                  <span>Next Due: {selectedLoan.nextDueDate}</span>
                </div>
              </div>

              {/* EMI Amortization Schedule Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    Month-by-Month Amortization Schedule ({selectedLoan.schedule?.length || 0} Installments)
                  </h4>
                  <button
                    onClick={() => {
                      setSelectedLoan(null);
                      openQuickAction('payment');
                    }}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    + Record Payment
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3">Principal</th>
                        <th className="p-3">Interest</th>
                        <th className="p-3">EMI Amount</th>
                        <th className="p-3">Paid</th>
                        <th className="p-3">Balance</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedLoan.schedule || []).map((s: LoanEMIScheduleItem) => (
                        <tr
                          key={s.id}
                          className={`transition-colors ${
                            s.status === 'Overdue'
                              ? 'bg-rose-50/80 font-semibold'
                              : s.status === 'Paid'
                              ? 'bg-emerald-50/30'
                              : ''
                          }`}
                        >
                          <td className="p-3 font-mono font-bold text-slate-500">{s.emiNumber}</td>
                          <td className="p-3 text-slate-700">{s.dueDate}</td>
                          <td className="p-3 font-medium text-slate-700">{formatCurrency(s.principal)}</td>
                          <td className="p-3 font-medium text-slate-700">{formatCurrency(s.interest)}</td>
                          <td className="p-3 font-bold text-slate-900">{formatCurrency(s.emiAmount)}</td>
                          <td className="p-3 font-bold text-emerald-900">{formatCurrency(s.paidAmount)}</td>
                          <td className="p-3 font-mono text-slate-600">{formatCurrency(s.balance)}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.status === 'Overdue'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLoan(null)}
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
