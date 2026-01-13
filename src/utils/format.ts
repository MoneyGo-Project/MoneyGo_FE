// 금액 포맷팅 (1000000 -> 1,000,000원)
export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(num);
};

// 계좌번호 포맷팅 (123456789012 -> 1234-5678-9012)
export const formatAccountNumber = (accountNumber: string): string => {
  if (!accountNumber) return '';
  return accountNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
};

// 날짜 포맷팅
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

// 날짜/시간 포맷팅
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

// 전화번호 포맷팅 (01012345678 -> 010-1234-5678)
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};
