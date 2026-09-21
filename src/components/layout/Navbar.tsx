'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { SSPLogo } from '@/components/common/SSPLogo';
import {
  Search,
  Bell,
  CheckCheck,
  UserCheck,
  ExternalLink,
  Settings,
  HelpCircle,
  Menu,
  Shield,
  Briefcase,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    setIsSearchOpen,
    openQuickAction,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'ADMIN', title: 'Admin', desc: 'Full system control & settings' },
    { role: 'MANAGER', title: 'Manager', desc: 'Loans, vehicles, properties, reports' },
    { role: 'AGENT', title: 'Field Agent', desc: 'Assigned cases, visits, repo updates' },
    { role: 'STAFF', title: 'Staff', desc: 'Operational data view & customer support' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Left: Mobile Menu Toggle & Logo */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link href="/" className="hover:opacity-95 transition-opacity">
          <SSPLogo size="md" />
        </Link>
      </div>

      {/* Middle: Live Search Bar Trigger */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-500 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200 rounded-xl transition-all shadow-xs group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700" />
            <span className="text-slate-500 font-normal">
              Search vehicles (e.g. KA56), loans, customers...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-slate-500 bg-white border border-slate-300/80 rounded-md shadow-xs">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Role Switcher, Quick Action, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Role Switcher Pill */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all shadow-xs bg-emerald-50/80 border-emerald-300 text-emerald-900 hover:bg-emerald-100"
            title="Switch User Role to test permissions"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span className="uppercase tracking-wider font-bold">{currentRole}</span>
            <ChevronDown className="w-3 h-3 text-emerald-700 opacity-70" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="text-xs font-bold text-slate-900">Active Role Switcher</div>
                <div className="text-[11px] text-slate-500">Test role-based access & views</div>
              </div>
              <div className="space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setCurrentRole(r.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left text-xs transition-colors ${
                      currentRole === r.role
                        ? 'bg-emerald-50 text-emerald-950 font-semibold border border-emerald-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        currentRole === r.role ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    />
                    <div>
                      <div className="font-bold">{r.title}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                        !n.isRead ? 'bg-emerald-50/40 font-medium' : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      <div className="text-[10px] text-slate-400 mt-1.5">
                        {new Date(n.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <Link
                  href="/reports"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                >
                  View Activity Audit Trail →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-600/30 bg-emerald-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
              {currentUser.name.split(' ')[0]}
            </div>
            <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
              {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
