export interface Account {
  accountId: number;
  accountNumber: string;
  balance: number;
  status: string;
  createdAt: string;
}

export interface AccountOwner {
  accountNumber: string;
  ownerName: string;
  bankName: string;
}
