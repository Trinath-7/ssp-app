'use client';

import React, { useState, useEffect } from 'react';
import { DocumentRecord, DocumentCategory } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  FileText,
  Search,
  Plus,
  Download,
  Trash2,
  Eye,
  Share2,
  Filter,
  CheckCircle2,
  X,
  FileCheck,
} from 'lucide-react';

export default function DocumentsPage() {
  const { openQuickAction, showToast } = useApp();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const categories = [
    'All',
    'KYC',
    'Property Documents',
    'Loan Documents',
    'Vehicle Documents',
    'Agreements',
    'Payment Receipts',
    'Reports',
  ];

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Document removed from archive');
        setDeleteConfirmId(null);
        fetchDocuments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = (doc: DocumentRecord) => {
    // Generate a simple text/pdf mock payload for download
    const blob = new Blob([`Official Document Record: ${doc.name}\nCategory: ${doc.category}\nEntity: ${doc.entityName || 'SSP'}\nUploaded by: ${doc.uploadedBy}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${doc.name}`);
  };

  const filteredDocs = documents.filter((d) => {
    if (selectedCategory !== 'All' && d.category !== selectedCategory) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.documentId.toLowerCase().includes(q) ||
        (d.entityName && d.entityName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-emerald-700" />
            <span>Document Repository & Records</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Encrypted storage for KYC, property deeds, hypothecation agreements, and RC copies
          </p>
        </div>

        <button
          onClick={() => openQuickAction('document')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-900/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {categories.map((cat) => {
          const count =
            cat === 'All'
              ? documents.length
              : documents.filter((d) => d.category === cat).length;
          const isActive = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <span>{cat}</span>
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

      {/* Search Bar */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by file name, category, or linked entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Document</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Linked Asset / Entity</th>
                <th className="p-3.5">File Format & Size</th>
                <th className="p-3.5">Uploaded By</th>
                <th className="p-3.5">Upload Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((d) => (
                <tr key={d.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">{d.name}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{d.documentId}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {d.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <div>{d.entityName || 'Corporate Archive'}</div>
                    <div className="text-[10px] text-slate-400">{d.entityType}</div>
                  </td>
                  <td className="p-3.5 text-slate-600 font-mono">
                    <span className="uppercase font-bold text-emerald-900">{d.fileType}</span> • {d.fileSize}
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">{d.uploadedBy}</td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(d.uploadedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPreviewDoc(d)}
                        className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg"
                        title="Preview Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(d)}
                        className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {deleteConfirmId === d.id ? (
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(d.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-700" />
                <span className="font-bold text-slate-900 text-sm">{previewDoc.name}</span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
              <FileText className="w-16 h-16 text-emerald-700 mx-auto" />
              <div className="font-bold text-sm text-slate-900">{previewDoc.name}</div>
              <div className="text-xs text-slate-500">
                Category: {previewDoc.category} • Size: {previewDoc.fileSize}
              </div>
              <div className="text-[11px] text-slate-400">
                Linked to: {previewDoc.entityName || 'SSP Corporation'}
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Clean Digital Document</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(previewDoc)}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
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
