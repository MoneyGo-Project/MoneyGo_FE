export interface TransferRequest {
  toAccountNumber: string;
  amount: number;
  description?: string;
  password: string;
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

export interface Transaction {
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

export interface TransactionListResponse {
  content: Transaction[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

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
  password: string;
}

export interface QrPayResponse {
  transactionId: number;
  qrPaymentId: number;
  amount: number;
  description: string;
  sellerAccount: string;
  sellerName: string;
  status: string;
  createdAt: string;
  balanceAfter: number;
}
