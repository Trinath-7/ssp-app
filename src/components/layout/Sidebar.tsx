'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  BarChart3,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { currentRole, openQuickAction } = useApp();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Vehicles & Repo', href: '/vehicles', icon: Truck, badge: '15' },
    { label: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white/85 backdrop-blur-sm border-r border-emerald-100/80 shadow-[8px_0_30px_rgba(15,23,42,0.04)] flex flex-col justify-between overflow-y-auto transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Quick Create CTA Button */}
          <div>
            <button
              onClick={() => openQuickAction('vehicle')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-semibold text-sm shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>+ Register Vehicle</span>
            </button>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations & Portfolios
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 border border-emerald-200 shadow-[0_8px_20px_rgba(16,185,129,0.12)]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4.5 h-4.5 transition-colors ${
                        isActive ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                        isActive
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Bangalore HQ Live</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Ph: +91 80 4123 9900
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Role: <strong className="text-emerald-800">{currentRole}</strong></span>
            <span>v2.4 Pro</span>
          </div>
        </div>
      </aside>
    </>
  );
};
