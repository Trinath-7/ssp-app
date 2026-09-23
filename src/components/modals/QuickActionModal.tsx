'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Check, Truck, Users, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/financial';
import confetti from 'canvas-confetti';

interface QuickActionModalProps {
  onSuccess?: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({ onSuccess }) => {
  const { isQuickActionOpen, activeQuickAction, closeQuickAction, showToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

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
    financeCompany: 'SSP Vehicle Repo & Recovery',
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
    category: 'Vehicle Documents' as any,
    fileType: 'pdf' as any,
    fileSize: '1.5 MB',
    entityType: 'Customer' as any,
    entityId: '',
    entityName: '',
  });

  // Fetch customers for dropdowns
  useEffect(() => {
    if (isQuickActionOpen) {
      fetch('/api/customers')
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) {
            setCustomers(d);
            if (d.length > 0) {
              setDocForm((prev) => ({
                ...prev,
                entityId: d[0].customerId,
                entityName: d[0].name,
              }));
            }
          }
        })
        .catch(console.error);
    }
  }, [isQuickActionOpen]);

  if (!isQuickActionOpen || !activeQuickAction) return null;

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
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
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
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        showToast('Borrower onboarded & verified successfully!');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            {activeQuickAction === 'vehicle' && <Truck className="w-5 h-5 text-emerald-700" />}
            {activeQuickAction === 'customer' && <Users className="w-5 h-5 text-emerald-700" />}
            {activeQuickAction === 'document' && <FileText className="w-5 h-5 text-emerald-700" />}
            <span className="font-bold text-base text-slate-900 capitalize">
              {activeQuickAction === 'vehicle' && 'Register Vehicle / Repo'}
              {activeQuickAction === 'customer' && 'Onboard New Borrower'}
              {activeQuickAction === 'document' && 'Upload Seizure / Yard Document'}
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
                    Chassis Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MAT4825TCK10921"
                    value={vehForm.chassisNumber}
                    onChange={(e) => setVehForm({ ...vehForm, chassisNumber: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Current Location / Last Known
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Peenya Yard, Bangalore"
                    value={vehForm.location}
                    onChange={(e) => setVehForm({ ...vehForm, location: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Registered Borrower Name
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
                {loading ? 'Saving...' : 'Add Borrower & Onboard'}
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
                  placeholder="e.g. Seizure_Memo_KA56M4920.pdf"
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
                    <option>Vehicle Documents</option>
                    <option>Seizure Memos</option>
                    <option>Yard Intake Receipts</option>
                    <option>KYC</option>
                    <option>Agreements</option>
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
