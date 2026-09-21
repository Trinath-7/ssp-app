'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Check, Landmark, CreditCard, Building, Truck, Users, FileText, Calculator } from 'lucide-react';
import { calculateEMI, formatCurrency, validateIndianMobile, validatePAN, validateVehicleReg } from '@/lib/financial';
import confetti from 'canvas-confetti';

interface QuickActionModalProps {
  onSuccess?: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ onSuccess }) => {
  const { isQuickActionOpen, activeQuickAction, closeQuickAction, showToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);

  // Loan Form State
  const [loanForm, setLoanForm] = useState({
    customerId: '',
    customerName: '',
    loanType: 'Home Loan',
    principalAmount: 2500000,
    interestRate: 8.5,
    tenureMonths: 120,
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState(() => ({
    loanId: '',
    customerId: '',
    customerName: '',
    amount: 50000,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer' as any,
    transactionId: `TXN-${Date.now().toString().slice(-6)}`,
    collectedBy: 'Rahul Sharma',
    notes: '',
  }));

  // Property Form State
  const [propForm, setPropForm] = useState({
    title: '',
    propertyType: 'Apartment' as any,
    location: '',
    address: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    area: 1500,
    areaUnit: 'sq ft' as any,
    bedrooms: 3,
    bathrooms: 2,
    parking: '1 Slot',
    price: 9500000,
    ownerName: '',
    ownerPhone: '',
    status: 'Available' as any,
    description: '',
  });

  // Vehicle Form State
  const [vehForm, setVehForm] = useState({
    regNumber: '',
    chassisNumber: '',
    engineNumber: '',
    make: 'Tata Motors',
    model: 'Signa 4825.T',
    vehicleType: 'Commercial Truck' as any,
    manufacturingYear: 2023,
    color: 'White',
    ownerName: '',
    ownerPhone: '',
    financeCompany: 'SSP Properties & Loans',
    location: 'Bangalore',
    repoStatus: 'Pending' as any,
    overdueAmount: 85000,
    overdueDays: 30,
    notes: '',
  });

  // Customer Form State
  const [custForm, setCustForm] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '1990-01-01',
    address: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    pan: '',
    aadhaarStatus: 'Verified' as any,
    occupation: 'Professional',
    annualIncome: 1800000,
    notes: '',
  });

  // Document Form State
  const [docForm, setDocForm] = useState({
    name: '',
    category: 'KYC' as any,
    fileType: 'pdf' as any,
    fileSize: '1.5 MB',
    entityType: 'Customer' as any,
    entityId: '',
    entityName: '',
  });

  // Fetch customers and loans for dropdowns
  useEffect(() => {
    if (isQuickActionOpen) {
      fetch('/api/customers')
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) {
            setCustomers(d);
            if (d.length > 0) {
              setLoanForm((prev) => ({
                ...prev,
                customerId: d[0].customerId,
                customerName: d[0].name,
              }));
              setDocForm((prev) => ({
                ...prev,
                entityId: d[0].customerId,
                entityName: d[0].name,
              }));
            }
          }
        })
        .catch(console.error);

      fetch('/api/loans')
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) {
            setLoans(d);
            if (d.length > 0) {
              setPaymentForm((prev) => ({
                ...prev,
                loanId: d[0].loanId,
                customerId: d[0].customerId,
                customerName: d[0].customerName,
                amount: d[0].emiAmount || 50000,
              }));
            }
          }
        })
        .catch(console.error);
    }
  }, [isQuickActionOpen]);

  if (!isQuickActionOpen || !activeQuickAction) return null;

  // Handle Loan Submit
  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanForm),
      });
      if (res.ok) {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
        showToast('Loan sanctioned & EMI amortization generated successfully!');
        closeQuickAction();
        onSuccess?.();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to create loan', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Payment Submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      });
      if (res.ok) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        showToast(`Payment of ₹${paymentForm.amount.toLocaleString()} recorded! Receipt issued.`);
        closeQuickAction();
        onSuccess?.();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to record payment', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Property Submit
  const handlePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propForm.title || !propForm.location) {
      showToast('Please fill all required fields', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...propForm,
          images: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80',
          ],
        }),
      });
      if (res.ok) {
        showToast('Property listed successfully in database!');
        closeQuickAction();
        onSuccess?.();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to list property', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Vehicle Submit
  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehForm.regNumber || !vehForm.ownerName) {
      showToast('Registration Number and Owner are required', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...vehForm,
          regNumber: vehForm.regNumber.toUpperCase().trim(),
          uploadDate: new Date().toISOString().split('T')[0],
          images: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80'],
        }),
      });
      if (res.ok) {
        showToast('Vehicle registered in database with repo tracking!');
        closeQuickAction();
        onSuccess?.();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to register vehicle', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Submit
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name || !custForm.phone) {
      showToast('Customer Name and Mobile are required', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custForm),
      });
      if (res.ok) {
        showToast('Customer onboarded & verified successfully!');
        closeQuickAction();
        onSuccess?.();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add customer', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Document Submit
  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.name) {
      showToast('Document name is required', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docForm),
      });
      if (res.ok) {
        showToast('Document uploaded and indexed successfully!');
        closeQuickAction();
        onSuccess?.();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to upload document', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculated = calculateEMI(
    loanForm.principalAmount,
    loanForm.interestRate,
    loanForm.tenureMonths
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            {activeQuickAction === 'loan' && <Landmark className="w-5 h-5 text-emerald-700" />}
            {activeQuickAction === 'payment' && <CreditCard className="w-5 h-5 text-emerald-700" />}
            {activeQuickAction === 'property' && <Building className="w-5 h-5 text-emerald-700" />}
            {activeQuickAction === 'vehicle' && <Truck className="w-5 h-5 text-emerald-700" />}
            {activeQuickAction === 'customer' && <Users className="w-5 h-5 text-emerald-700" />}
            {activeQuickAction === 'document' && <FileText className="w-5 h-5 text-emerald-700" />}
            <span className="font-bold text-base text-slate-900 capitalize">
              {activeQuickAction === 'loan' && 'Sanction New Loan'}
              {activeQuickAction === 'payment' && 'Record Loan Payment'}
              {activeQuickAction === 'property' && 'Add Property Listing'}
              {activeQuickAction === 'vehicle' && 'Register Vehicle / Repo'}
              {activeQuickAction === 'customer' && 'Onboard New Customer'}
              {activeQuickAction === 'document' && 'Upload Document'}
            </span>
          </div>
          <button
            onClick={closeQuickAction}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* LOAN FORM */}
          {activeQuickAction === 'loan' && (
            <form onSubmit={handleLoanSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Customer
                </label>
                <select
                  value={loanForm.customerId}
                  onChange={(e) => {
                    const c = customers.find((cust) => cust.customerId === e.target.value);
                    setLoanForm((prev) => ({
                      ...prev,
                      customerId: e.target.value,
                      customerName: c?.name || '',
                    }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.customerId} value={c.customerId}>
                      {c.name} ({c.customerId}) - Ph: {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Loan Type
                  </label>
                  <select
                    value={loanForm.loanType}
                    onChange={(e) => setLoanForm({ ...loanForm, loanType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Home Loan</option>
                    <option>Property Loan</option>
                    <option>Vehicle Loan</option>
                    <option>Business Loan</option>
                    <option>Personal Loan</option>
                    <option>Mortgage Loan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Principal Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={loanForm.principalAmount}
                    onChange={(e) =>
                      setLoanForm({ ...loanForm, principalAmount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Annual Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={loanForm.interestRate}
                    onChange={(e) =>
                      setLoanForm({ ...loanForm, interestRate: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tenure (Months)
                  </label>
                  <input
                    type="number"
                    value={loanForm.tenureMonths}
                    onChange={(e) =>
                      setLoanForm({ ...loanForm, tenureMonths: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Instant EMI Calculation Card */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    Computed Monthly EMI
                  </div>
                  <div className="text-xl font-black text-emerald-950">
                    {formatCurrency(calculated.monthlyEMI)}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Total Payable: {formatCurrency(calculated.totalPayable)}
                  </div>
                </div>
                <div className="text-right text-xs text-emerald-800 font-semibold">
                  <div>Interest: {formatCurrency(calculated.totalInterest)}</div>
                  <div className="text-[10px] text-emerald-600 font-normal mt-0.5">
                    Amortization auto-generated
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Sanction / Start Date
                </label>
                <input
                  type="date"
                  value={loanForm.startDate}
                  onChange={(e) => setLoanForm({ ...loanForm, startDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Sanction Loan & Generate EMI Schedule'}
              </button>
            </form>
          )}

          {/* PAYMENT FORM */}
          {activeQuickAction === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Loan Account
                </label>
                <select
                  value={paymentForm.loanId}
                  onChange={(e) => {
                    const l = loans.find((item) => item.loanId === e.target.value);
                    setPaymentForm((prev) => ({
                      ...prev,
                      loanId: e.target.value,
                      customerId: l?.customerId || '',
                      customerName: l?.customerName || '',
                      amount: l?.emiAmount || 50000,
                    }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {loans.map((l) => (
                    <option key={l.loanId} value={l.loanId}>
                      {l.loanId} - {l.customerName} ({l.loanType}) - Due: {formatCurrency(l.emiAmount)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Amount Received (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  >
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>Cash</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Transaction ID / Reference
                  </label>
                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, transactionId: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Collected By
                  </label>
                  <input
                    type="text"
                    value={paymentForm.collectedBy}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, collectedBy: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Recording...' : 'Record Payment & Issue Receipt'}
              </button>
            </form>
          )}

          {/* PROPERTY FORM */}
          {activeQuickAction === 'property' && (
            <form onSubmit={handlePropertySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Property Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSP Emerald Residency 3BHK"
                  value={propForm.title}
                  onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Property Type
                  </label>
                  <select
                    value={propForm.propertyType}
                    onChange={(e) => setPropForm({ ...propForm, propertyType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  >
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>House</option>
                    <option>Plot</option>
                    <option>Land</option>
                    <option>Commercial</option>
                    <option>Office</option>
                    <option>Shop</option>
                    <option>Warehouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={propForm.price}
                    onChange={(e) => setPropForm({ ...propForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Location / Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar 100ft Road"
                    value={propForm.location}
                    onChange={(e) => setPropForm({ ...propForm, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={propForm.city}
                    onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={propForm.ownerName}
                    onChange={(e) => setPropForm({ ...propForm, ownerName: e.target.value })}
                    placeholder="Owner legal name"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Owner Contact Mobile
                  </label>
                  <input
                    type="tel"
                    value={propForm.ownerPhone}
                    onChange={(e) => setPropForm({ ...propForm, ownerPhone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : 'Save Property Listing'}
              </button>
            </form>
          )}

          {/* VEHICLE FORM */}
          {activeQuickAction === 'vehicle' && (
            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Registration No (e.g. KA56M4920)
                  </label>
                  <input
                    type="text"
                    placeholder="KA56M4920"
                    value={vehForm.regNumber}
                    onChange={(e) => setVehForm({ ...vehForm, regNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-wider text-slate-900 uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehForm.vehicleType}
                    onChange={(e) => setVehForm({ ...vehForm, vehicleType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  >
                    <option>Commercial Truck</option>
                    <option>SUV</option>
                    <option>Sedan</option>
                    <option>Hatchback</option>
                    <option>Two Wheeler</option>
                    <option>Auto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    value={vehForm.make}
                    onChange={(e) => setVehForm({ ...vehForm, make: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={vehForm.model}
                    onChange={(e) => setVehForm({ ...vehForm, model: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Registered Owner
                  </label>
                  <input
                    type="text"
                    value={vehForm.ownerName}
                    onChange={(e) => setVehForm({ ...vehForm, ownerName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Current Repo Status
                  </label>
                  <select
                    value={vehForm.repoStatus}
                    onChange={(e) => setVehForm({ ...vehForm, repoStatus: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  >
                    <option>Pending</option>
                    <option>Assigned</option>
                    <option>Agent Visit</option>
                    <option>Vehicle Located</option>
                    <option>In Yard</option>
                    <option>Verification</option>
                    <option>On Hold</option>
                    <option>Released</option>
                    <option>Completed</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Registering...' : 'Register Vehicle & Tracking'}
              </button>
            </form>
          )}

          {/* CUSTOMER FORM */}
          {activeQuickAction === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Naidu"
                  value={custForm.name}
                  onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="9845012345"
                    value={custForm.phone}
                    onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={custForm.email}
                    onChange={(e) => setCustForm({ ...custForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    value={custForm.pan}
                    onChange={(e) => setCustForm({ ...custForm, pan: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 tracking-wider uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={custForm.city}
                    onChange={(e) => setCustForm({ ...custForm, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : 'Add Customer & Onboard'}
              </button>
            </form>
          )}

          {/* DOCUMENT FORM */}
          {activeQuickAction === 'document' && (
            <form onSubmit={handleDocumentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aadhaar_Card_Verified.pdf"
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  >
                    <option>KYC</option>
                    <option>Property Documents</option>
                    <option>Loan Documents</option>
                    <option>Vehicle Documents</option>
                    <option>Agreements</option>
                    <option>Payment Receipts</option>
                    <option>Reports</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    File Type
                  </label>
                  <select
                    value={docForm.fileType}
                    onChange={(e) => setDocForm({ ...docForm, fileType: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  >
                    <option>pdf</option>
                    <option>jpg</option>
                    <option>png</option>
                    <option>docx</option>
                    <option>xlsx</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Uploading...' : 'Save & Index Document'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
