import axios from 'axios';
import { AuthResponse, Branch, CreateLoanParams, LoanRequest, LoanStatus } from '../types';

// Mock Data
const MOCK_BRANCHES: Branch[] = [
  { code: "101", name: "شعبه مرکزی تهران" },
  { code: "102", name: "شعبه میدان آزادی" },
  { code: "103", name: "شعبه سعادت‌آباد" },
  { code: "104", name: "شعبه پونک" },
  { code: "201", name: "شعبه مرکزی اصفهان" },
  { code: "301", name: "شعبه مرکزی شیراز" },
];

const DELAY_MS = 800;

// LocalStorage Keys
const KEY_TOKEN = "turan_token";
const KEY_LOAN = "turan_active_loan";
const KEY_USER = "turan_user";

// Safe Storage Wrapper
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('LocalStorage access denied/failed', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage access denied/failed', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('LocalStorage access denied/failed', e);
    }
  }
};

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Functions
export const authApi = {
  requestOtp: async (mobile: string): Promise<void> => {
    await delay(DELAY_MS);
    console.log(`OTP for ${mobile}: 12345`); // Mock OTP
    return;
  },
  
  verifyOtp: async (mobile: string, otp: string): Promise<AuthResponse> => {
    await delay(DELAY_MS);
    if (otp !== "12345") throw new Error("کد وارد شده اشتباه است");
    
    const user = { mobile };
    const token = "mock-jwt-token-" + Date.now();
    
    safeStorage.setItem(KEY_TOKEN, token);
    safeStorage.setItem(KEY_USER, JSON.stringify(user));
    
    return { accessToken: token, user };
  },

  logout: () => {
    safeStorage.removeItem(KEY_TOKEN);
    safeStorage.removeItem(KEY_USER);
  },

  getCurrentUser: () => {
    const u = safeStorage.getItem(KEY_USER);
    return u ? JSON.parse(u) : null;
  },

  isAuthenticated: () => !!safeStorage.getItem(KEY_TOKEN),
};

export const loanApi = {
  getBranches: async (): Promise<Branch[]> => {
    await delay(500);
    return MOCK_BRANCHES;
  },

  getActiveLoan: async (): Promise<LoanRequest | null> => {
    await delay(DELAY_MS);
    const stored = safeStorage.getItem(KEY_LOAN);
    if (!stored) return null;
    return JSON.parse(stored);
  },

  createLoan: async (params: CreateLoanParams): Promise<LoanRequest> => {
    await delay(1500); // Simulate processing
    
    const user = authApi.getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Check existing
    if (safeStorage.getItem(KEY_LOAN)) {
      throw new Error("شما یک درخواست فعال دارید.");
    }

    const branch = MOCK_BRANCHES.find(b => b.code === params.branchCode) || MOCK_BRANCHES[0];

    const newLoan: LoanRequest = {
      id: "LN-" + Date.now().toString().slice(-6),
      mobile: user.mobile,
      nationalId: params.nationalId,
      amountToman: params.amountToman,
      tenorMonths: params.tenorMonths,
      branch,
      status: LoanStatus.IdentityCheck, // Start at check
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    safeStorage.setItem(KEY_LOAN, JSON.stringify(newLoan));
    
    // Simulate Background Shahkar Check
    setTimeout(() => {
        const currentStr = safeStorage.getItem(KEY_LOAN);
        const current = currentStr ? JSON.parse(currentStr) : null;
        if(current && current.id === newLoan.id) {
            // 90% chance of success
            const success = Math.random() > 0.1; 
            current.status = success ? LoanStatus.WaitingForLetter : LoanStatus.RejectedByShahkar;
            safeStorage.setItem(KEY_LOAN, JSON.stringify(current));
            
            // If success, simulate Letter Issuance after 10 seconds (for demo)
            if (success) {
                setTimeout(() => {
                    const curr2Str = safeStorage.getItem(KEY_LOAN);
                    const curr2 = curr2Str ? JSON.parse(curr2Str) : null;
                     if(curr2 && curr2.id === newLoan.id) {
                        curr2.status = LoanStatus.LetterIssued;
                        safeStorage.setItem(KEY_LOAN, JSON.stringify(curr2));
                     }
                }, 10000);
            }
        }
    }, 3000);

    return newLoan;
  },

  downloadLetter: async (id: string): Promise<Blob> => {
    await delay(2000);
    // Return a dummy PDF blob
    return new Blob(["Mock PDF Content"], { type: 'application/pdf' });
  }
};