'use client';

import React, { useState, useEffect } from 'react';
import { Vehicle, RepoStatus, RepoStatusHistoryItem } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatCurrency, createWhatsAppLink } from '@/lib/financial';
import {
  Truck,
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  MessageCircle,
  Share2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  FileSpreadsheet,
  X,
  History,
  Building,
  Navigation,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  User,
  ShieldCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function VehiclesPage() {
  const { openQuickAction, showToast, currentUser, currentRole } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Sub-modals for reference screen features
  const [showRTOModal, setShowRTOModal] = useState(false);
  const [showFASTagModal, setShowFASTagModal] = useState(false);
  const [showIntimationModal, setShowIntimationModal] = useState(false);
  const [showRepoUpdateModal, setShowRepoUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState<RepoStatus>('In Yard');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusLocation, setStatusLocation] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vehicles');
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load vehicles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const repoStatuses: RepoStatus[] = [
    'Pending',
    'Assigned',
    'Agent Visit',
    'Vehicle Located',
    'In Yard',
    'Verification',
    'On Hold',
    'Released',
    'Completed',
  ];

  const filteredVehicles = vehicles.filter((v) => {
    if (statusFilter !== 'All' && v.repoStatus.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (typeFilter !== 'All' && v.vehicleType !== typeFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        v.regNumber.toLowerCase().includes(q) ||
        v.chassisNumber.toLowerCase().includes(q) ||
        v.engineNumber.toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        (v.loanId && v.loanId.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenVehicle = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedVehicle(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateRepoStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    setStatusUpdating(true);
    try {
      const res = await fetch('/api/repo/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicle.vehicleId,
          newStatus,
          user: currentUser.name,
          role: currentRole,
          notes: statusNotes,
          location: statusLocation || selectedVehicle.location,
        }),
      });

      if (res.ok) {
        showToast(`Repo status updated to "${newStatus}"! Audit logged.`);
        setShowRepoUpdateModal(false);
        setStatusNotes('');
        // Refresh vehicle
        handleOpenVehicle(selectedVehicle.vehicleId);
        fetchVehicles();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update status', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredVehicles.map((v) => ({
        'Vehicle ID': v.vehicleId,
        'Reg Number': v.regNumber,
        Make: v.make,
        Model: v.model,
        Owner: v.ownerName,
        'Owner Phone': v.ownerPhone,
        'Repo Status': v.repoStatus,
        'Overdue Days': v.overdueDays,
        'Overdue Amount': v.overdueAmount,
        Location: v.location,
        'Assigned Agent': v.assignedAgentName || 'Unassigned',
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicles_Repo');
    XLSX.writeFile(wb, `SSP_Vehicles_Repo_${Date.now()}.csv`);
    showToast('Exported Vehicles & Repo to CSV');
  };

  // Status counts
  const totalVehicles = vehicles.length;
  const pendingCount = vehicles.filter((v) => v.repoStatus === 'Pending').length;
  const assignedCount = vehicles.filter((v) => v.repoStatus === 'Assigned').length;
  const inYardCount = vehicles.filter((v) => v.repoStatus === 'In Yard').length;
  const onHoldCount = vehicles.filter((v) => v.repoStatus === 'On Hold').length;
  const releasedCount = vehicles.filter((v) => v.repoStatus === 'Released').length;
  const completedCount = vehicles.filter((v) => v.repoStatus === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-emerald-700" />
            <span>Vehicle & Repo Management</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Asset recovery, RTO verification, FASTag tracking, yard admission, and workflow stages
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
            onClick={() => openQuickAction('vehicle')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Vehicle</span>
          </button>
        </div>
      </div>

      {/* Repo Workflow Dashboard KPI Cards Strip (Reference inspired) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div
          onClick={() => setStatusFilter('All')}
          className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'All' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Total Vehicles</span>
          <div className="text-xl font-black mt-1">{totalVehicles}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Pending')}
          className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'Pending' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'Pending' ? 'text-amber-100' : 'text-amber-700'}`}>Pending</span>
          <div className="text-xl font-black mt-1">{pendingCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Assigned')}
          className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'Assigned' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'Assigned' ? 'text-blue-100' : 'text-blue-700'}`}>Assigned</span>
          <div className="text-xl font-black mt-1">{assignedCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('In Yard')}
          className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'In Yard' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'In Yard' ? 'text-rose-100' : 'text-rose-700'}`}>In Yard</span>
          <div className="text-xl font-black mt-1">{inYardCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('On Hold')}
          className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'On Hold' ? 'bg-slate-600 text-white border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'On Hold' ? 'text-slate-100' : 'text-slate-600'}`}>On Hold</span>
          <div className="text-xl font-black mt-1">{onHoldCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Released')}
          className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'Released' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'Released' ? 'text-emerald-100' : 'text-emerald-700'}`}>Released</span>
          <div className="text-xl font-black mt-1">{releasedCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Completed')}
          className={`p-3.5 rounded-2xl border shadow-xs cursor-pointer transition-all ${
            statusFilter === 'Completed' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${statusFilter === 'Completed' ? 'text-emerald-100' : 'text-emerald-800'}`}>Completed</span>
          <div className="text-xl font-black mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Dynamic Vehicle Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by registration (e.g. KA56, MH02), chassis, engine, customer, loan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 uppercase"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            {repoStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Commercial Truck">Commercial Truck</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
            <option value="Hatchback">Hatchback</option>
            <option value="Two Wheeler">Two Wheeler</option>
          </select>

          {(search || statusFilter !== 'All' || typeFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('All');
                setTypeFilter('All');
              }}
              className="py-2 px-3 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Vehicles Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Reg Number</th>
                <th className="p-3.5">Make & Model</th>
                <th className="p-3.5">Type & Year</th>
                <th className="p-3.5">Owner / Contact</th>
                <th className="p-3.5">Loan & Overdue</th>
                <th className="p-3.5">Location / Yard</th>
                <th className="p-3.5">Repo Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => handleOpenVehicle(v.vehicleId)}
                  className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                >
                  <td className="p-3.5">
                    <span className="font-black text-sm font-mono tracking-wider text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-300">
                      {v.regNumber}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">Chassis: {v.chassisNumber.slice(-6)}</div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    <div>{v.make} {v.model}</div>
                    <div className="text-[10px] font-normal text-slate-500">Color: {v.color}</div>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">
                    <div>{v.vehicleType}</div>
                    <div className="text-[10px] text-slate-400">{v.manufacturingYear}</div>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <div className="font-semibold">{v.ownerName}</div>
                    <div className="text-[10px] text-slate-400">{v.ownerPhone}</div>
                  </td>
                  <td className="p-3.5">
                    {v.overdueAmount > 0 ? (
                      <div>
                        <span className="font-bold text-rose-700 font-mono">
                          {formatCurrency(v.overdueAmount)}
                        </span>
                        <div className="text-[10px] text-rose-600 font-medium">
                          {v.overdueDays} days default
                        </div>
                      </div>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-[11px]">Regular / Cleared</span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div className="truncate max-w-[150px]">{v.location}</div>
                    {v.yardLocation && (
                      <div className="text-[10px] text-emerald-800 font-medium truncate max-w-[150px]">
                        Yard: {v.yardLocation}
                      </div>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        v.repoStatus === 'In Yard'
                          ? 'bg-rose-100 text-rose-800 font-black'
                          : v.repoStatus === 'Vehicle Located'
                          ? 'bg-purple-100 text-purple-800'
                          : v.repoStatus === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.repoStatus === 'Released'
                          ? 'bg-teal-100 text-teal-800'
                          : v.repoStatus === 'Assigned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.repoStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenVehicle(v.vehicleId)}
                      className="px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-lg"
                    >
                      Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VEHICLE DETAILS MODAL (ALL 8 REFERENCE SECTIONS) */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Quick Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 gap-3">
              <div className="flex items-center gap-3">
                <span className="font-black text-base font-mono tracking-wider bg-white px-3 py-1 rounded-xl border border-slate-300 shadow-xs">
                  {selectedVehicle.regNumber}
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.manufacturingYear})
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{selectedVehicle.vehicleType}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-800">
                      Status: {selectedVehicle.repoStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowRepoUpdateModal(true)}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Update Repo Status
                </button>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Actions Strip (Inspired by reference screenshot) */}
            <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-900 text-white overflow-x-auto text-xs font-bold">
              <span className="text-emerald-300 uppercase tracking-wider text-[10px] mr-2 flex-shrink-0">
                Quick Actions:
              </span>
              <button
                onClick={() => setShowRTOModal(true)}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 rounded-lg whitespace-nowrap"
              >
                RTO SEARCH
              </button>
              <button
                onClick={() => setShowIntimationModal(true)}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 rounded-lg whitespace-nowrap"
              >
                PRE/POST INTIMATION
              </button>
              <button
                onClick={() => setShowFASTagModal(true)}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 rounded-lg whitespace-nowrap"
              >
                FASTAG HISTORY
              </button>
              <a
                href={`tel:${selectedVehicle.ownerPhone}`}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 rounded-lg whitespace-nowrap flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>CALL</span>
              </a>
              <a
                href={createWhatsAppLink(
                  selectedVehicle.ownerPhone,
                  `SSP Properties & Loans Official Notice: Regarding vehicle ${selectedVehicle.regNumber} (${selectedVehicle.make} ${selectedVehicle.model}). Overdue balance: ₹${selectedVehicle.overdueAmount.toLocaleString()}. Please contact our recovery bureau immediately.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg whitespace-nowrap flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WHATSAPP</span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  showToast('Vehicle case link copied to clipboard');
                }}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 rounded-lg whitespace-nowrap flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                <span>SHARE</span>
              </button>
            </div>

            {/* Modal Body with 8 Reference Sections */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SECTION 1: OWNER DETAILS */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>1. Owner Details</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Registered Owner</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedVehicle.ownerName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Contact Mobile</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedVehicle.ownerPhone}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Customer ID</span>
                    <div className="font-mono text-emerald-900 font-bold mt-0.5">{selectedVehicle.customerId || 'Direct Lien'}</div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: VEHICLE SPECIFICATIONS */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>2. Vehicle Specifications</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Registration No</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedVehicle.regNumber}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Chassis Number</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedVehicle.chassisNumber}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Engine Number</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedVehicle.engineNumber}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Make / Model</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedVehicle.make} {selectedVehicle.model}</div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: REPO INFORMATION */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-700" />
                  <span>3. Repo Information & Location</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Current Repo Status</span>
                    <div className="font-black text-emerald-900 mt-0.5">{selectedVehicle.repoStatus}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Spotted Location</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedVehicle.location}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Allocated Yard</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedVehicle.yardLocation || 'Awaiting Yard Entry'}</div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: CONFIRMER DETAILS */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>4. Confirmer Details</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Confirmer Name</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedVehicle.confirmerName || 'Mahesh Gowda (Yard Supervisor)'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Confirmer Contact</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedVehicle.confirmerPhone || '+91 98450 99887'}</div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: AGENCY DETAILS */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <span>5. Recovery Agency Details</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Recovery Agency</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedVehicle.agencyName || 'Garuda Asset Recovery Bureau'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Assigned Agent</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedVehicle.assignedAgentName || 'Rahul Sharma (Field Agent)'}</div>
                  </div>
                </div>
              </div>

              {/* SECTION 7: DOCUMENTS */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>7. Vehicle Case Documents</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>RC Copy ({selectedVehicle.regNumber})</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Loan Sanction & Hypothecation Deed</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>RTO Pre-Intimation Dispatch Notice</span>
                  </div>
                </div>
              </div>

              {/* SECTION 8: ACTIVITY HISTORY (Every status change stored) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-700" />
                  <span>8. Activity History Audit Timeline</span>
                </h4>
                <div className="space-y-2.5">
                  {((selectedVehicle as any).history || []).length === 0 ? (
                    <div className="text-xs text-slate-400 py-2">No activity history transitions recorded.</div>
                  ) : (
                    ((selectedVehicle as any).history || []).map((h: RepoStatusHistoryItem) => (
                      <div key={h.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{h.user} ({h.role}) changed status:</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{h.oldStatus}</span>
                            <span>→</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black">{h.newStatus}</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{h.date} • {h.time}</div>
                        </div>
                        <div className="text-slate-600 mt-1 text-[11px]">{h.notes}</div>
                        {h.location && (
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{h.location}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setShowRepoUpdateModal(true)}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors"
              >
                Transition Repo Stage
              </button>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RTO SEARCH MODAL */}
      {showRTOModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <Truck className="w-5 h-5 text-emerald-700" />
                <span>RTO Vahan Verification Result</span>
              </div>
              <button onClick={() => setShowRTOModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 font-mono font-bold text-center text-lg text-emerald-950">
              {selectedVehicle.regNumber}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Registered Owner</span>
                <div className="font-bold text-slate-900">{selectedVehicle.rtoDetails?.ownerName || selectedVehicle.ownerName}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">RTO Office</span>
                <div className="font-bold text-slate-900">{selectedVehicle.rtoDetails?.rtoOffice || 'Regional Transport Office'}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Registration Date</span>
                <div className="font-bold text-slate-900">{selectedVehicle.rtoDetails?.registeredDate || '2023-01-15'}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Vehicle Class</span>
                <div className="font-bold text-slate-900">{selectedVehicle.rtoDetails?.vehicleClass || selectedVehicle.vehicleType}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Insurance Valid Till</span>
                <div className="font-bold text-emerald-800">{selectedVehicle.rtoDetails?.insuranceValidTill || '2026-03-31'}</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Hypothecation</span>
                <div className="font-bold text-emerald-800">{selectedVehicle.rtoDetails?.financierName || 'SSP Properties & Loans'}</div>
              </div>
            </div>

            <button
              onClick={() => setShowRTOModal(false)}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* FASTAG HISTORY MODAL */}
      {showFASTagModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <Navigation className="w-5 h-5 text-emerald-700" />
                <span>FASTag NETC Toll Crossing Logs</span>
              </div>
              <button onClick={() => setShowFASTagModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600">
              Live automated toll plaza detections for <strong>{selectedVehicle.regNumber}</strong>:
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(selectedVehicle.fastagHistory || [
                { tollPlaza: 'Attibele Toll Plaza (NH-44)', dateTime: 'Recent (24h ago)', amount: 155, lane: 'Lane 4' },
                { tollPlaza: 'Electronic City Tollway Plaza', dateTime: '2 days ago', amount: 80, lane: 'Lane 2' },
                { tollPlaza: 'KIAL Airport Expressway Toll', dateTime: '5 days ago', amount: 110, lane: 'Lane 3' },
              ]).map((t, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{t.tollPlaza}</div>
                    <div className="text-[10px] text-slate-400">{t.dateTime} • {t.lane}</div>
                  </div>
                  <div className="font-black text-emerald-900">
                    ₹{t.amount}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowFASTagModal(false)}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
            >
              Close FASTag View
            </button>
          </div>
        </div>
      )}

      {/* PRE/POST INTIMATION MODAL */}
      {showIntimationModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>RTO Pre/Post Intimation Records</span>
              </div>
              <button onClick={() => setShowIntimationModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400">Pre-Intimation Dispatch</span>
                <div className="font-bold text-slate-900 mt-1">
                  Dispatch Date: {selectedVehicle.preIntimationDate || 'Dispatched (7 Days Prior)'}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Notice served to police station & registered borrower residence per regulatory guidelines.
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400">Post-Intimation Submission</span>
                <div className="font-bold text-slate-900 mt-1">
                  Submission Date: {selectedVehicle.postIntimationDate || 'Awaiting Post-Intimation (Pending Yard Admission)'}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Inventory copy with police station receiving seal uploaded in documents archive.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIntimationModal(false)}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* UPDATE REPO STATUS MODAL */}
      {showRepoUpdateModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <ShieldAlert className="w-5 h-5 text-emerald-700" />
                <span>Transition Repo Workflow Stage</span>
              </div>
              <button onClick={() => setShowRepoUpdateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRepoStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Target Repo Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Agent Visit">Agent Visit</option>
                  <option value="Vehicle Located">Vehicle Located</option>
                  <option value="In Yard">In Yard</option>
                  <option value="Verification">Verification</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Released">Released</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  New Location / Yard
                </label>
                <input
                  type="text"
                  placeholder="e.g. SSP Attibele South Yard"
                  value={statusLocation}
                  onChange={(e) => setStatusLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Audit Notes & Inspection Remarks
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed notes describing reason for stage transition..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRepoUpdateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusUpdating}
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold"
                >
                  {statusUpdating ? 'Updating...' : 'Save & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
