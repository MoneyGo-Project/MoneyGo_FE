// 이메일 검증
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 비밀번호 검증 (8-20자, 대소문자, 숫자, 특수문자 포함)
export const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  return passwordRegex.test(password);
};

// 전화번호 검증 (010-1234-5678)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

// 계좌번호 검증 (1001-1234-5678)
export const validateAccountNumber = (accountNumber: string): boolean => {
  const accountRegex = /^\d{4}-\d{4}-\d{4}$/;
  return accountRegex.test(accountNumber);
};

// 금액 검증 (양수, 최대 100만원)
export const validateAmount = (amount: number, max: number = 1000000): boolean => {
  return amount > 0 && amount <= max;
};
