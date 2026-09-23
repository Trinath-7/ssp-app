'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Truck, Users, FileText, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    customers: any[];
    agents: any[];
    vehicles: any[];
    documents: any[];
  }>({
    customers: [],
    agents: [],
    vehicles: [],
    documents: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ customers: [], agents: [], vehicles: [], documents: [] });
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ customers: [], agents: [], vehicles: [], documents: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults({
            customers: data.customers || [],
            agents: data.agents || [],
            vehicles: data.vehicles || [],
            documents: data.documents || [],
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleNavigate = (path: string) => {
    setIsSearchOpen(false);
    router.push(path);
  };

  const hasResults =
    results.vehicles.length > 0 ||
    results.customers.length > 0 ||
    (results.agents && results.agents.length > 0) ||
    results.documents.length > 0;

  const searchExamples = ['KA56M4920', 'DL04AA3991', 'GJ01KN7822'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50">
          <div className="flex items-center">
            <Search className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vehicles (e.g. KA56, MH02), chassis, repo cases..."
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-base focus:outline-none"
            />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="ml-2 px-2 py-1 text-xs font-semibold text-slate-400 bg-slate-200/80 rounded"
            >
              ESC
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {searchExamples.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="px-2.5 py-1 rounded-full border border-emerald-200 bg-white text-[11px] font-semibold text-emerald-800 shadow-sm hover:bg-emerald-50 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
          {loading && (
            <div className="py-8 text-center text-sm text-slate-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent mr-2 align-middle"></div>
              Searching vehicle repo database...
            </div>
          )}

          {!loading && query.trim().length >= 2 && !hasResults && (
            <div className="py-10 text-center text-slate-500">
              <p className="font-medium text-slate-700">No records found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try vehicle registration numbers (KA56, MH02), chassis numbers, borrower names, or agent IDs.</p>
            </div>
          )}

          {/* Vehicles (Priority matching like in prompt KA56) */}
          {results.vehicles.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-800 uppercase px-2 mb-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                Vehicles & Repo Cases ({results.vehicles.length})
              </div>
              <div className="space-y-1">
                {results.vehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleNavigate(`/vehicles?id=${v.vehicleId}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-emerald-800">
                          {v.regNumber}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                          {v.make} {v.model}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                            v.repoStatus === 'In Yard'
                              ? 'bg-rose-100 text-rose-700'
                              : v.repoStatus === 'Completed' || v.repoStatus === 'Released'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {v.repoStatus}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Owner: {v.ownerName} • Chassis: {v.chassisNumber?.slice(-6)} • Location: {v.location}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Borrowers / Customers */}
          {results.customers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-800 uppercase px-2 mb-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Borrowers ({results.customers.length})
              </div>
              <div className="space-y-1">
                {results.customers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleNavigate(`/customers?id=${c.customerId}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-emerald-800">
                        {c.name}
                        <span className="ml-2 text-xs text-slate-400 font-normal">
                          {c.customerId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {c.phone} • {c.city} • PAN: {c.pan}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Field Agents */}
          {results.agents && results.agents.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-800 uppercase px-2 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Field Recovery Agents ({results.agents.length})
              </div>
              <div className="space-y-1">
                {results.agents.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleNavigate(`/agents?id=${a.agentId}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-emerald-800">
                        {a.name}
                        <span className="ml-2 text-xs text-slate-400 font-normal">
                          {a.agentId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {a.phone} • {a.city} • Success Rate: {a.successRate}% • Status: {a.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Documents */}
          {results.documents.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-800 uppercase px-2 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Documents ({results.documents.length})
              </div>
              <div className="space-y-1">
                {results.documents.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleNavigate(`/documents?id=${d.documentId}`)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-emerald-800">
                        {d.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {d.category} • {d.fileSize} • Uploaded by {d.uploadedBy}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono shadow-xs">ESC</kbd>
            <span>to close</span>
          </div>
          <div>SSP Integrated Dynamic Search</div>
        </div>
      </div>
    </div>
  );
};
