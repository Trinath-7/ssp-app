export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: 'Active' | 'Inactive';
}

export interface Customer {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  altPhone?: string;
  email: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  pan: string;
  aadhaarStatus: 'Verified' | 'Pending' | 'Submitted';
  occupation: string;
  annualIncome: number;
  assignedAgentId?: string;
  assignedAgentName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PropertyType =
  | 'Apartment'
  | 'Villa'
  | 'House'
  | 'Plot'
  | 'Land'
  | 'Commercial'
  | 'Office'
  | 'Shop'
  | 'Warehouse';

export type PropertyStatus =
  | 'Available'
  | 'Sold'
  | 'Rented'
  | 'Reserved'
  | 'Under Development';

export interface Property {
  id: string;
  propertyId: string;
  title: string;
  propertyType: PropertyType;
  location: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  area: number;
  areaUnit: 'sq ft' | 'acres' | 'sq yards';
  bedrooms?: number;
  bathrooms?: number;
  parking?: string;
  price: number;
  ownerName: string;
  ownerPhone: string;
  status: PropertyStatus;
  description: string;
  images: string[];
  documents?: string[];
  featured?: boolean;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export type LoanType =
  | 'Home Loan'
  | 'Property Loan'
  | 'Vehicle Loan'
  | 'Business Loan'
  | 'Personal Loan'
  | 'Mortgage Loan'
  | 'Commercial Loan';

export type LoanStatus = 'Active' | 'Pending' | 'Overdue' | 'Completed' | 'Closed';

export interface LoanEMIScheduleItem {
  id: string;
  loanId: string;
  emiNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  emiAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  paidDate?: string;
}

export interface Loan {
  id: string;
  loanId: string;
  customerId: string;
  customerName: string;
  loanType: LoanType;
  principalAmount: number;
  interestRate: number; // annual %
  tenureMonths: number;
  emiAmount: number;
  startDate: string;
  endDate: string;
  paidAmount: number;
  outstandingAmount: number;
  nextDueDate: string;
  status: LoanStatus;
  assignedAgentId?: string;
  assignedAgentName?: string;
  documents?: string[];
  schedule?: LoanEMIScheduleItem[];
  payments?: Payment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other';
export type PaymentStatus = 'Success' | 'Pending' | 'Failed';

export interface Payment {
  id: string;
  paymentId: string;
  receiptNumber: string;
  loanId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  collectedBy: string;
  notes?: string;
  status: PaymentStatus;
  createdAt: string;
}

export type RepoStatus =
  | 'Pending'
  | 'Assigned'
  | 'Agent Visit'
  | 'Vehicle Located'
  | 'In Yard'
  | 'Verification'
  | 'Released'
  | 'On Hold'
  | 'Completed';

export interface RTOInfo {
  registrationNumber: string;
  ownerName: string;
  rtoOffice: string;
  registeredDate: string;
  fuelType: string;
  vehicleClass: string;
  insuranceValidTill: string;
  fitnessValidTill: string;
  pucValidTill: string;
  financierName: string;
}

export interface FASTagRecord {
  tollPlaza: string;
  dateTime: string;
  amount: number;
  lane: string;
}

export interface Vehicle {
  id: string;
  vehicleId: string;
  regNumber: string;
  chassisNumber: string;
  engineNumber: string;
  make: string;
  model: string;
  vehicleType: 'Two Wheeler' | 'Hatchback' | 'Sedan' | 'SUV' | 'Commercial Truck' | 'Auto';
  manufacturingYear: number;
  color: string;
  ownerName: string;
  ownerPhone: string;
  customerId?: string;
  loanId?: string;
  financeCompany: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  location: string;
  yardLocation?: string;
  repoStatus: RepoStatus;
  overdueAmount: number;
  overdueDays: number;
  uploadDate: string;
  notes?: string;
  // Details from reference screenshot
  confirmerName?: string;
  confirmerPhone?: string;
  agencyName?: string;
  preIntimationDate?: string;
  postIntimationDate?: string;
  releaseDate?: string;
  rtoDetails?: RTOInfo;
  fastagHistory?: FASTagRecord[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RepoStatusHistoryItem {
  id: string;
  vehicleId: string;
  regNumber: string;
  user: string;
  role: string;
  oldStatus: RepoStatus;
  newStatus: RepoStatus;
  date: string;
  time: string;
  notes: string;
  location?: string;
}

export interface Agent {
  id: string;
  agentId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  joiningDate: string;
  status: 'Active' | 'Inactive';
  assignedCasesCount: number;
  completedCasesCount: number;
  rating: number;
  avatar?: string;
  assignedLoansCount?: number;
  assignedPropertiesCount?: number;
}

export type DocumentCategory =
  | 'KYC'
  | 'Property Documents'
  | 'Loan Documents'
  | 'Vehicle Documents'
  | 'Agreements'
  | 'Payment Receipts'
  | 'Reports'
  | 'Other';

export interface DocumentRecord {
  id: string;
  documentId: string;
  name: string;
  category: DocumentCategory;
  fileType: 'pdf' | 'jpg' | 'png' | 'doc' | 'docx' | 'xlsx';
  fileSize: string;
  fileUrl: string;
  entityType: 'Customer' | 'Property' | 'Loan' | 'Vehicle' | 'General';
  entityId?: string;
  entityName?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type:
    | 'EMI_DUE'
    | 'EMI_OVERDUE'
    | 'PAYMENT_RECEIVED'
    | 'NEW_LOAN'
    | 'NEW_PROPERTY'
    | 'NEW_CUSTOMER'
    | 'REPO_ASSIGNED'
    | 'REPO_STATUS'
    | 'DOCUMENT_UPLOADED'
    | 'AGENT_ASSIGNED';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  userRole: UserRole;
  action: string;
  module:
    | 'Customers'
    | 'Properties'
    | 'Loans'
    | 'Payments'
    | 'Vehicles'
    | 'Repo'
    | 'Agents'
    | 'Documents'
    | 'Settings'
    | 'Auth';
  recordId: string;
  recordTitle: string;
  oldValue?: string;
  newValue?: string;
  date: string;
  time: string;
}

export interface BusinessSettings {
  companyName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
  logoUrl: string;
  taxId: string;
  receiptPrefix: string;
  currencySymbol: string;
  enableWhatsAppIntimation: boolean;
  enableSmsReminders: boolean;
  overdueGracePeriodDays: number;
}
