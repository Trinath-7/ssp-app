'use client';

import React from 'react';
import { Payment } from '@/types';
import { SSPLogo } from '@/components/common/SSPLogo';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/financial';

interface ReceiptModalProps {
  payment: Payment | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200 print:hidden">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Official Payment Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-emerald-900/10 pb-6">
            <div>
              <SSPLogo size="lg" />
              <div className="text-xs text-slate-500 mt-2">
                #452, 14th Main, HSR Layout Sector 4, Bangalore - 560102
              </div>
              <div className="text-xs text-slate-500">
                GSTIN: 29ABCDE1234F1Z5 • Tel: +91 80 4123 9900
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full uppercase tracking-wider">
                Payment Success
              </div>
              <div className="text-lg font-black text-slate-900 mt-2 font-mono">
                {payment.receiptNumber}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Date: {payment.paymentDate}
              </div>
            </div>
          </div>

          {/* Customer & Loan Overview */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Received From
              </div>
              <div className="font-bold text-sm text-slate-900 mt-0.5">
                {payment.customerName}
              </div>
              <div className="text-slate-600 mt-0.5">Customer ID: {payment.customerId}</div>
            </div>
            <div>
              <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Account & Reference
              </div>
              <div className="font-bold text-sm text-slate-900 mt-0.5">
                Loan ID: {payment.loanId}
              </div>
              <div className="text-slate-600 mt-0.5">Tx ID: {payment.transactionId}</div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white flex items-center justify-between shadow-md">
            <div>
              <div className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                Total Amount Received
              </div>
              <div className="text-3xl font-black mt-1 tracking-tight">
                {formatCurrency(payment.amount)}
              </div>
            </div>
            <div className="text-right text-xs text-emerald-200">
              <div className="font-bold text-white uppercase">{payment.paymentMethod}</div>
              <div className="text-[11px] opacity-80 mt-0.5">Collected By: {payment.collectedBy}</div>
            </div>
          </div>

          {/* Payment Notes */}
          {payment.notes && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <strong className="text-slate-800">Remarks:</strong> {payment.notes}
            </div>
          )}

          {/* Receipt Footer with Signature & Stamp */}
          <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="text-slate-500 text-[11px]">
              <p>This is a computer generated digital receipt.</p>
              <p className="font-semibold text-slate-700">SSP Properties & Loans Management System</p>
            </div>
            <div className="text-center">
              <div className="h-10 border-b border-dashed border-slate-400 w-36 mb-1"></div>
              <div className="font-bold text-slate-700 text-xs">Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
