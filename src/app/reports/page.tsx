'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/financial';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileDown,
  Calendar,
  Filter,
  Landmark,
  CreditCard,
  Building,
  Truck,
  Users,
  UserCheck,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export default function ReportsPage() {
  const { showToast } = useApp();
  const [reportType, setReportType] = useState('Loan Report');
  const [dateRange, setDateRange] = useState('This Month');
  const [loading, setLoading] = useState(true);

  const [reportData, setReportData] = useState<{
    loans: any[];
    payments: any[];
    properties: any[];
    vehicles: any[];
    agents: any[];
    customers: any[];
  }>({
    loans: [],
    payments: [],
    properties: [],
    vehicles: [],
    agents: [],
    customers: [],
  });

  const reportOptions = [
    { name: 'Loan Report', icon: Landmark, desc: 'Sanctions, tenures, rates & statuses' },
    { name: 'Payment Report', icon: CreditCard, desc: 'Collections, transaction IDs & methods' },
    { name: 'Outstanding Report', icon: Clock, desc: 'Overdue loans, defaulters & balances' },
    { name: 'Property Report', icon: Building, desc: 'Inventory, valuations & occupancy' },
    { name: 'Vehicle Report', icon: Truck, desc: 'Fleet records, chassis, engine & types' },
    { name: 'Repo Report', icon: Truck, desc: 'Repo stages, yard admissions & intimations' },
    { name: 'Agent Performance', icon: UserCheck, desc: 'Resolved cases, ratings & case loads' },
    { name: 'Customer Report', icon: Users, desc: 'KYC statuses, incomes & contact records' },
  ];

  const dateRanges = ['Today', '7 Days', 'This Month', '3 Months', '6 Months', 'This Year', 'All Time'];

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [lRes, pRes, prRes, vRes, aRes, cRes] = await Promise.all([
        fetch('/api/loans'),
        fetch('/api/payments'),
        fetch('/api/properties'),
        fetch('/api/vehicles'),
        fetch('/api/agents'),
        fetch('/api/customers'),
      ]);

      setReportData({
        loans: lRes.ok ? await lRes.json() : [],
        payments: pRes.ok ? await pRes.json() : [],
        properties: prRes.ok ? await prRes.json() : [],
        vehicles: vRes.ok ? await vRes.json() : [],
        agents: aRes.ok ? await aRes.json() : [],
        customers: cRes.ok ? await cRes.json() : [],
      });
    } catch (e) {
      console.error(e);
      showToast('Error loading report datasets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Format active dataset for export
  const getExportData = () => {
    switch (reportType) {
      case 'Loan Report':
        return reportData.loans.map((l) => ({
          'Loan ID': l.loanId,
          Customer: l.customerName,
          Type: l.loanType,
          Principal: l.principalAmount,
          'Interest Rate (%)': l.interestRate,
          Tenure: `${l.tenureMonths} Mos`,
          EMI: l.emiAmount,
          Paid: l.paidAmount,
          Outstanding: l.outstandingAmount,
          Status: l.status,
        }));
      case 'Payment Report':
        return reportData.payments.map((p) => ({
          'Receipt #': p.receiptNumber,
          Customer: p.customerName,
          'Loan ID': p.loanId,
          Amount: p.amount,
          Date: p.paymentDate,
          Method: p.paymentMethod,
          'Tx ID': p.transactionId,
          Collector: p.collectedBy,
        }));
      case 'Outstanding Report':
        return reportData.loans
          .filter((l) => l.outstandingAmount > 0)
          .map((l) => ({
            'Loan ID': l.loanId,
            Customer: l.customerName,
            Type: l.loanType,
            Outstanding: l.outstandingAmount,
            MonthlyEMI: l.emiAmount,
            NextDueDate: l.nextDueDate,
            Status: l.status,
          }));
      case 'Property Report':
        return reportData.properties.map((p) => ({
          'Property ID': p.propertyId,
          Title: p.title,
          Type: p.propertyType,
          Location: p.location,
          City: p.city,
          Price: p.price,
          Area: `${p.area} ${p.areaUnit}`,
          Status: p.status,
        }));
      case 'Vehicle Report':
        return reportData.vehicles.map((v) => ({
          'Vehicle ID': v.vehicleId,
          'Reg Plate': v.regNumber,
          Make: v.make,
          Model: v.model,
          Type: v.vehicleType,
          Owner: v.ownerName,
          Status: v.repoStatus,
        }));
      case 'Repo Report':
        return reportData.vehicles.map((v) => ({
          'Reg Plate': v.regNumber,
          Model: `${v.make} ${v.model}`,
          'Repo Status': v.repoStatus,
          'Overdue Days': v.overdueDays,
          'Overdue Amount': v.overdueAmount,
          'Yard Location': v.yardLocation || 'N/A',
          Agent: v.assignedAgentName || 'Unassigned',
        }));
      case 'Agent Performance':
        return reportData.agents.map((a) => ({
          'Agent ID': a.agentId,
          Name: a.name,
          City: a.city,
          Phone: a.phone,
          'Assigned Cases': a.assignedCasesCount,
          'Completed Cases': a.completedCasesCount,
          Rating: a.rating,
        }));
      case 'Customer Report':
        return reportData.customers.map((c) => ({
          'Customer ID': c.customerId,
          Name: c.name,
          Phone: c.phone,
          City: c.city,
          PAN: c.pan,
          'Aadhaar Status': c.aadhaarStatus,
          Income: c.annualIncome,
        }));
      default:
        return [];
    }
  };

  const handleExportCSV = () => {
    const data = getExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType.replace(/\s+/g, '_'));
    XLSX.writeFile(wb, `SSP_${reportType.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    showToast(`Exported ${reportType} to CSV`);
  };

  const handleExportExcel = () => {
    const data = getExportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType.replace(/\s+/g, '_'));
    XLSX.writeFile(wb, `SSP_${reportType.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
    showToast(`Exported ${reportType} to Excel`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(15, 81, 71);
    doc.text('SSP PROPERTIES & LOANS', 20, 20);

    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text(`Official Executive Report: ${reportType}`, 20, 28);
    doc.setFontSize(9);
    doc.text(`Date Range Filter: ${dateRange} • Generated: ${new Date().toLocaleString()}`, 20, 34);
    doc.line(20, 38, 190, 38);

    const data = getExportData().slice(0, 20); // Top 20 for PDF preview
    let y = 46;
    doc.setFontSize(9);
    doc.setTextColor(20);

    data.forEach((row, i) => {
      const summaryLine = Object.entries(row)
        .slice(0, 4)
        .map(([k, v]) => `${k}: ${v}`)
        .join('  |  ');
      doc.text(`${i + 1}. ${summaryLine}`, 20, y);
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text('Confidential commercial operating report • SSP Properties & Loans Systems', 20, 285);

    doc.save(`SSP_${reportType.replace(/\s+/g, '_')}.pdf`);
    showToast(`PDF generated for ${reportType}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-700" />
            <span>Executive Reports & Financial Intelligence</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Cross-functional business analytics, audit extracts, and regulatory reporting
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
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
        </div>
      </div>

      {/* Report Selection Strip (8 Reports) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {reportOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = reportType === opt.name;

          return (
            <button
              key={opt.name}
              onClick={() => setReportType(opt.name)}
              className={`p-3.5 rounded-2xl border text-left transition-all shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-md'
                  : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`} />
                {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs">{opt.name}</div>
                <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {opt.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Date Range Selector & Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Active Dataset Preview
          </span>
          <h3 className="font-black text-lg text-slate-900">{reportType}</h3>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
          >
            {dateRanges.map((d) => (
              <option key={d} value={d}>
                Period: {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Report Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent mr-2"></div>
              Compiling database records...
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  {Object.keys(getExportData()[0] || {}).map((header) => (
                    <th key={header} className="p-3.5">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getExportData().map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    {Object.values(row).map((val: any, i) => (
                      <td key={i} className="p-3.5 text-slate-800 font-medium">
                        {typeof val === 'number' && String(Object.keys(row)[i]).includes('Amount') ||
                        String(Object.keys(row)[i]).includes('Price') ||
                        String(Object.keys(row)[i]).includes('Principal') ||
                        String(Object.keys(row)[i]).includes('Outstanding') ||
                        String(Object.keys(row)[i]).includes('EMI') ||
                        String(Object.keys(row)[i]).includes('Income')
                          ? formatCurrency(val)
                          : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
