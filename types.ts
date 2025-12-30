export enum LoanStatus {
  Submitted = "Submitted", // ثبت شده / بررسی اولیه
  IdentityCheck = "IdentityCheck", // در حال احراز هویت شاهکار
  RejectedByShahkar = "RejectedByShahkar", // رد شده توسط شاهکار
  WaitingForLetter = "WaitingForLetter", // در انتظار صدور معرفی‌نامه
  LetterIssued = "LetterIssued", // معرفی‌نامه صادر شد
  WaitingForBankApproval = "WaitingForBankApproval", // در انتظار تایید بانک
  LoanPaid = "LoanPaid", // پرداخت شده / بسته شده
  Closed = "Closed" // بسته شده توسط پشتیبانی
}

export interface Branch {
  code: string;
  name: string;
}

export interface User {
  mobile: string;
  firstName?: string;
  lastName?: string;
}

export interface LoanRequest {
  id: string;
  mobile: string;
  nationalId: string;
  amountToman: number;
  tenorMonths: number;
  branch: Branch;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
  bankResult?: {
    paidAmountToman: number;
    tenorMonths: number;
    paidAt: string;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface CreateLoanParams {
  nationalId: string;
  amountToman: number;
  tenorMonths: number;
  branchCode: string;
  acceptedTerms: boolean;
  acceptedReturnedChequeRule: boolean;
}