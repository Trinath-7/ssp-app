'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Truck,
  Menu,
  Plus,
  X,
  BarChart3,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { openQuickAction } = useApp();
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const mainTabs = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Vehicles', href: '/vehicles', icon: Truck },
  ];

  const moreItems = [
    { label: 'Reports & Analytics', href: '/reports', icon: BarChart3, desc: 'Export vehicle fleet & repo data' },
    { label: 'Settings', href: '/settings', icon: Settings, desc: 'Agency profile & system rules' },
  ];

  const handleFabAction = (action: string) => {
    setIsFabOpen(false);
    openQuickAction(action);
  };

  return (
    <>
      {/* Floating Action Button (FAB) Menu Backdrop */}
      {isFabOpen && (
        <div
          onClick={() => setIsFabOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* FAB Quick Action Sheet */}
      {isFabOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 space-y-1 animate-in slide-in-from-bottom-5 duration-150 lg:hidden">
          <div className="px-3 py-1.5 text-xs font-bold text-slate-800 border-b border-slate-100">
            Quick Actions
          </div>
          <button
            onClick={() => handleFabAction('vehicle')}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-emerald-50 text-left text-xs font-semibold text-slate-800 transition-colors"
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Register Vehicle</span>
          </button>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsFabOpen((prev) => !prev)}
        className="fixed bottom-18 right-4 z-50 w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all lg:hidden"
        aria-label="Create New"
      >
        {isFabOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6 stroke-[2.5]" />}
      </button>

      {/* More Bottom Sheet Drawer */}
      {isMoreDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs lg:hidden">
          <div
            className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-slate-200 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-base text-slate-900">More Modules</span>
              <button
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 pt-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-emerald-50/70 border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-800">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/90 backdrop-blur-md border-t border-emerald-100 px-3 flex items-center justify-around shadow-[0_-10px_25px_rgba(15,23,42,0.06)] lg:hidden">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-emerald-800 font-bold'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </Link>
          );
        })}

        {/* More Tab */}
        <button
          onClick={() => setIsMoreDrawerOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isMoreDrawerOpen ? 'text-emerald-800 font-bold' : 'text-slate-400'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1">More</span>
        </button>
      </nav>
    </>
  );
};
