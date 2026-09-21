'use client';

import React, { useState, useEffect } from 'react';
import { Property, PropertyType, PropertyStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatCurrency, createWhatsAppLink } from '@/lib/financial';
import {
  Building,
  Plus,
  Search,
  Filter,
  Download,
  Grid,
  List,
  Phone,
  MessageCircle,
  Share2,
  Trash2,
  Edit,
  FileText,
  FileDown,
  X,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Maximize2,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export default function PropertiesPage() {
  const { openQuickAction, showToast, currentRole } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/properties');
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load properties', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const tabs = [
    'All',
    'Available',
    'Sold',
    'Rented',
    'Reserved',
    'Under Development',
  ];

  const cities = ['All', 'Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Chennai', 'Delhi', 'Ahmedabad', 'Alibaug'];
  const types = ['All', 'Apartment', 'Villa', 'House', 'Plot', 'Land', 'Commercial', 'Office', 'Shop', 'Warehouse'];

  // Filtered properties
  const filteredProperties = properties.filter((p) => {
    if (activeTab !== 'All' && p.status.toLowerCase() !== activeTab.toLowerCase()) {
      return false;
    }
    if (cityFilter !== 'All' && p.city.toLowerCase() !== cityFilter.toLowerCase()) {
      return false;
    }
    if (typeFilter !== 'All' && p.propertyType !== typeFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.propertyId.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Property deleted successfully', 'info');
        setDeleteConfirmId(null);
        setSelectedProperty(null);
        fetchProperties();
      } else {
        showToast('Failed to delete property', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error deleting property', 'error');
    }
  };

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredProperties.map((p) => ({
        'Property ID': p.propertyId,
        Title: p.title,
        Type: p.propertyType,
        Price: p.price,
        Location: p.location,
        City: p.city,
        Status: p.status,
        Owner: p.ownerName,
        'Owner Phone': p.ownerPhone,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Properties');
    XLSX.writeFile(wb, `SSP_Properties_${Date.now()}.csv`);
    showToast('Exported Properties to CSV');
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredProperties.map((p) => ({
        'Property ID': p.propertyId,
        Title: p.title,
        Type: p.propertyType,
        Price: p.price,
        Area: `${p.area} ${p.areaUnit}`,
        Location: p.location,
        City: p.city,
        Status: p.status,
        Owner: p.ownerName,
        'Owner Phone': p.ownerPhone,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Properties');
    XLSX.writeFile(wb, `SSP_Properties_${Date.now()}.xlsx`);
    showToast('Exported Properties to Excel');
  };

  const handleGeneratePDF = (property: Property) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(15, 81, 71);
    doc.text('SSP PROPERTIES & LOANS', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Official Property Brochure & Specification Sheet', 20, 27);
    doc.line(20, 32, 190, 32);

    doc.setFontSize(14);
    doc.setTextColor(20);
    doc.text(property.title, 20, 42);

    doc.setFontSize(11);
    doc.text(`Property ID: ${property.propertyId}`, 20, 50);
    doc.text(`Asset Type: ${property.propertyType}`, 20, 58);
    doc.text(`Listed Price: ${formatCurrency(property.price)}`, 20, 66);
    doc.text(`Location: ${property.location}, ${property.city}`, 20, 74);
    doc.text(`Total Area: ${property.area} ${property.areaUnit}`, 20, 82);
    doc.text(`Current Status: ${property.status}`, 20, 90);
    doc.text(`Owner: ${property.ownerName} (${property.ownerPhone})`, 20, 98);

    doc.text('Description:', 20, 110);
    const splitDesc = doc.splitTextToSize(property.description, 170);
    doc.text(splitDesc, 20, 118);

    doc.line(20, 150, 190, 150);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Generated from SSP Commercial Operating Platform • Bangalore HQ', 20, 156);

    doc.save(`${property.propertyId}_Brochure.pdf`);
    showToast(`PDF Brochure downloaded for ${property.propertyId}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building className="w-7 h-7 text-emerald-700" />
            <span>Property Management</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Real estate inventory, title verification, and asset portfolio ({properties.length} listings)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'grid' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'table' ? 'bg-emerald-100 text-emerald-900' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

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
            onClick={() => openQuickAction('property')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab) => {
          const count =
            tab === 'All'
              ? properties.length
              : properties.filter((p) => p.status.toLowerCase() === tab.toLowerCase()).length;
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, location, city, property ID, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="flex-1 md:flex-initial py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                City: {c}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 md:flex-initial py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                Type: {t}
              </option>
            ))}
          </select>

          {(search || cityFilter !== 'All' || typeFilter !== 'All' || activeTab !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setCityFilter('All');
                setTypeFilter('All');
                setActiveTab('All');
              }}
              className="py-2 px-3 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mr-2 align-middle"></div>
          <span className="font-semibold text-sm">Loading properties database...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProperties.length === 0 && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Building className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No properties found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No property records matched your active tab or filter criteria. Try resetting filters or add a new property.
          </p>
          <button
            onClick={() => openQuickAction('property')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-900"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && viewMode === 'grid' && filteredProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProperties.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProperty(p)}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all overflow-hidden flex flex-col cursor-pointer group"
            >
              {/* Image & Badges */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60'}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                      p.status === 'Available'
                        ? 'bg-emerald-900 text-emerald-100'
                        : p.status === 'Sold'
                        ? 'bg-slate-900 text-slate-100'
                        : p.status === 'Rented'
                        ? 'bg-blue-900 text-blue-100'
                        : 'bg-amber-900 text-amber-100'
                    }`}
                  >
                    {p.status}
                  </span>
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                    {p.propertyType}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-slate-950/80 backdrop-blur-xs rounded-xl text-white font-black text-sm shadow-md">
                  {formatCurrency(p.price, true)}
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase">
                    {p.propertyId} • {p.city}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1 mt-0.5">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{p.location}</span>
                  </p>
                </div>

                {/* Specs Pill bar */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                  <div>
                    <strong>{p.area}</strong> {p.areaUnit}
                  </div>
                  {p.bedrooms && (
                    <div className="flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.bedrooms} Beds</span>
                    </div>
                  )}
                  {p.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.bathrooms} Baths</span>
                    </div>
                  )}
                </div>

                {/* Owner & Quick actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="truncate">
                    <span className="text-slate-400">Owner:</span>{' '}
                    <strong className="text-slate-800">{p.ownerName}</strong>
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${p.ownerPhone}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-800 hover:bg-emerald-50"
                      title="Direct Phone Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={createWhatsAppLink(
                        p.ownerPhone,
                        `Hello ${p.ownerName}, I am contacting you regarding your property "${p.title}" (${p.propertyId}) listed on SSP Properties & Loans.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                      title="WhatsApp Inquiry"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {!loading && viewMode === 'table' && filteredProperties.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Property</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">City / Location</th>
                  <th className="p-3.5">Area</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Owner</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProperty(p)}
                    className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{p.title}</div>
                      <div className="text-[10px] font-mono text-emerald-800">{p.propertyId}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">{p.propertyType}</td>
                    <td className="p-3.5 text-slate-600">
                      <div>{p.city}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{p.location}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {p.area} {p.areaUnit}
                    </td>
                    <td className="p-3.5 font-black text-slate-900">{formatCurrency(p.price)}</td>
                    <td className="p-3.5 text-slate-600">
                      <div>{p.ownerName}</div>
                      <div className="text-[10px] text-slate-400">{p.ownerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'Sold'
                            ? 'bg-slate-100 text-slate-800'
                            : p.status === 'Rented'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedProperty(p)}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-lg"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROPERTY DETAILS MODAL / DRAWER */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                  {selectedProperty.propertyId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedProperty.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {selectedProperty.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGeneratePDF(selectedProperty)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Generate PDF</span>
                </button>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Photo Gallery Carousel */}
              <div className="space-y-2">
                <div className="h-64 rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={selectedProperty.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60'}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedProperty.images && selectedProperty.images.length > 1 && (
                  <div className="flex gap-2">
                    {selectedProperty.images.map((img, i) => (
                      <div key={i} className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Valuation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{selectedProperty.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} - {selectedProperty.pincode}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-950">
                    {formatCurrency(selectedProperty.price)}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium">Official Listed Price</div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Property Type</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedProperty.propertyType}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Carpet Area</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedProperty.area} {selectedProperty.areaUnit}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Rooms</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedProperty.bedrooms ? `${selectedProperty.bedrooms} Beds, ${selectedProperty.bathrooms} Baths` : 'Commercial Layout'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Parking</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedProperty.parking || 'Standard Allocation'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description & Specifications
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {selectedProperty.description}
                </p>
              </div>

              {/* Owner Information & Communication */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Registered Property Owner
                  </div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {selectedProperty.ownerName}
                  </div>
                  <div className="text-xs text-slate-600">Mobile: {selectedProperty.ownerPhone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedProperty.ownerPhone}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Call Owner</span>
                  </a>
                  <a
                    href={createWhatsAppLink(
                      selectedProperty.ownerPhone,
                      `Hello ${selectedProperty.ownerName}, I am contacting you regarding your property "${selectedProperty.title}" (${selectedProperty.propertyId}) with SSP Properties & Loans.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Title Deeds and Documents */}
              {selectedProperty.documents && selectedProperty.documents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Verified Documents & Clearances
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with destructive actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              {deleteConfirmId === selectedProperty.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-600 font-bold">Confirm deletion?</span>
                  <button
                    onClick={() => handleDelete(selectedProperty.id)}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(selectedProperty.id)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing</span>
                </button>
              )}

              <button
                onClick={() => setSelectedProperty(null)}
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
