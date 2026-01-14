// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    name: string;
    accountNumber: string;
  };
}

export interface SignupResponse {
  userId: number;
  email: string;
  name: string;
  accountNumber: string;
  balance: number;
}

// Account Types
export interface AccountResponse {
  accountId: number;
  accountNumber: string;
  balance: number;
  status: string;
  createdAt: string;
}

export interface AccountOwnerResponse {
  accountNumber: string;
  ownerName: string;
}

// Transfer Types
export interface TransferRequest {
  toAccountNumber: string;
  amount: number;
  simplePassword: string;
  description?: string;
}

export interface TransferResponse {
  transactionId: number;
  fromAccount: string;
  toAccount: string;
  toAccountOwner: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  balanceAfter: number;
}

// Self Deposit Types
export interface SelfDepositRequest {
  amount: number;
  simplePassword: string;
  description?: string;
}

export interface SelfDepositResponse {
  transactionId: number;
  accountNumber: string;
  amount: number;
  balanceAfter: number;
  description: string;
  depositedAt: string;
}

// Transaction Types
export interface TransactionResponse {
  transactionId: number;
  type: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  counterpartyName: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// QR Payment Types
export interface QrGenerateRequest {
  amount: number;
  description?: string;
}

export interface QrGenerateResponse {
  qrPaymentId: number;
  qrCode: string;
  amount: number;
  description: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface QrPayRequest {
  qrCode: string;
  simplePassword: string;
}

export interface QrPayResponse {
  qrPaymentId: number;
  transactionId: number;
  buyerAccount: string;
  sellerAccount: string;
  sellerName: string;
  amount: number;
  description: string;
  status: string;
  paidAt: string;
  balanceAfter: number;
}

// Notification Types
export interface NotificationResponse {
  notificationId: number;
  type: string;
  title: string;
  content: string;
  relatedTransactionId: number;
  amount: number;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

// Scheduled Transfer Types
export interface ScheduledTransferRequest {
  toAccountNumber: string;
  amount: number;
  simplePassword: string;
  description?: string;
  scheduledAt: string; // ISO 8601 format
}

export interface ScheduledTransferResponse {
  scheduleId: number;
  fromAccount: string;
  toAccountNumber: string;
  amount: number;
  description: string;
  scheduledAt: string;
  status: string;
  executedAt: string | null;
  createdAt: string;
}

// Favorite Types
export interface FavoriteRequest {
  accountNumber: string;
  nickname: string;
  memo?: string;
}

export interface FavoriteUpdateRequest {
  nickname?: string;
  memo?: string;
}

export interface FavoriteResponse {
  favoriteId: number;
  accountNumber: string;
  accountOwnerName: string;
  nickname: string;
  memo: string;
  createdAt: string;
}

// Simple Password Types
export interface SimplePasswordRegisterRequest {
  password: string;
  simplePassword: string;
  simplePasswordConfirm: string;
}

export interface SimplePasswordChangeRequest {
  currentSimplePassword: string;
  newSimplePassword: string;
  newSimplePasswordConfirm: string;
}

export interface SimplePasswordVerifyRequest {
  simplePassword: string;
}

export interface SimplePasswordResponse {
  hasSimplePassword: boolean;
  message: string;
}
