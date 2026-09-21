import { LoanEMIScheduleItem } from '@/types';

/**
 * Calculates monthly EMI using standard formula:
 * EMI = P * r * (1+r)^n / ((1+r)^n - 1)
 * where r = annualRate / 12 / 100
 */
export function calculateEMI(
  principal: number,
  annualRatePercentage: number,
  tenureMonths: number
): {
  monthlyEMI: number;
  totalInterest: number;
  totalPayable: number;
} {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyEMI: 0, totalInterest: 0, totalPayable: 0 };
  }

  if (annualRatePercentage <= 0) {
    const monthlyEMI = Math.round(principal / tenureMonths);
    return {
      monthlyEMI,
      totalInterest: 0,
      totalPayable: principal,
    };
  }

  const monthlyRate = annualRatePercentage / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const monthlyEMI = Math.round((principal * monthlyRate * factor) / (factor - 1));
  const totalPayable = monthlyEMI * tenureMonths;
  const totalInterest = Math.max(0, totalPayable - principal);

  return {
    monthlyEMI,
    totalInterest,
    totalPayable,
  };
}

/**
 * Generates month-by-month amortization schedule
 */
export function generateEMISchedule(
  loanId: string,
  principal: number,
  annualRatePercentage: number,
  tenureMonths: number,
  startDateStr: string,
  alreadyPaidEMICount: number = 0
): LoanEMIScheduleItem[] {
  const { monthlyEMI } = calculateEMI(principal, annualRatePercentage, tenureMonths);
  const monthlyRate = annualRatePercentage / (12 * 100);
  let balance = principal;
  const schedule: LoanEMIScheduleItem[] = [];
  const start = new Date(startDateStr);

  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = new Date(start);
    dueDate.setMonth(start.getMonth() + i);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const interestComponent = Math.round(balance * monthlyRate);
    const principalComponent = Math.min(balance, Math.max(0, monthlyEMI - interestComponent));
    balance = Math.max(0, balance - principalComponent);

    let status: 'Paid' | 'Pending' | 'Overdue' | 'Partial' = 'Pending';
    let paidAmount = 0;
    let paidDate: string | undefined = undefined;

    if (i <= alreadyPaidEMICount) {
      status = 'Paid';
      paidAmount = monthlyEMI;
      const paidD = new Date(dueDate);
      paidD.setDate(paidD.getDate() - 2);
      paidDate = paidD.toISOString().split('T')[0];
    } else {
      const today = new Date();
      if (dueDate < today) {
        status = 'Overdue';
      }
    }

    schedule.push({
      id: `${loanId}-EMI-${i}`,
      loanId,
      emiNumber: i,
      dueDate: dueDateStr,
      principal: principalComponent,
      interest: interestComponent,
      emiAmount: monthlyEMI,
      paidAmount,
      balance,
      status,
      paidDate,
    });
  }

  return schedule;
}

/**
 * Indian Rupee formatter (e.g. ₹12.85 Cr, ₹48.6 L, ₹1,25,000)
 */
export function formatCurrency(amount: number, compact: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';

  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)} K`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validates Indian Mobile Number (10 digits starting with 6,7,8,9)
 */
export function validateIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/[\s-+]/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates PAN Number (e.g. ABCDE1234F)
 */
export function validatePAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
}

/**
 * Validates Indian Vehicle Registration number (e.g. KA56M4920, MH02BQ8112)
 */
export function validateVehicleReg(reg: string): boolean {
  const cleaned = reg.replace(/[\s-]/g, '').toUpperCase();
  return /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/.test(cleaned);
}

/**
 * Generates direct WhatsApp click-to-chat URL with pre-filled message
 */
export function createWhatsAppLink(
  phone: string,
  message: string
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  // Append 91 if 10 digits
  const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}
