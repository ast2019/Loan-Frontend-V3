import { LoanRequest, LoanStatus } from '../types';
import { loanApi } from './apiClient';

// Storage Keys
const KEY_ADMIN_TOKEN = "turan_admin_token";
const KEY_LOAN = "turan_active_loan"; // To access user's loan

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to access LocalStorage safely (duplicated to avoid export changes in apiClient)
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      return null;
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      // Ignore
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      // Ignore
    }
  }
};

// Generate some static mock data for the table
const MOCK_REQUESTS: LoanRequest[] = [
  {
    id: "LN-987654",
    mobile: "09121111111",
    nationalId: "0011111111",
    amountToman: 100000000,
    tenorMonths: 24,
    branch: { code: "101", name: "شعبه مرکزی تهران" },
    status: LoanStatus.LoanPaid,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    bankResult: {
        paidAmountToman: 100000000,
        tenorMonths: 24,
        paidAt: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  },
  {
    id: "LN-887766",
    mobile: "09352222222",
    nationalId: "1234567890",
    amountToman: 50000000,
    tenorMonths: 12,
    branch: { code: "103", name: "شعبه سعادت‌آباد" },
    status: LoanStatus.WaitingForLetter,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "LN-112233",
    mobile: "09193333333",
    nationalId: "0055555555",
    amountToman: 30000000,
    tenorMonths: 18,
    branch: { code: "102", name: "شعبه میدان آزادی" },
    status: LoanStatus.RejectedByShahkar,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

export const adminApi = {
  login: async (username: string, password: string) => {
    await delay(800);
    if (username === "admin" && password === "admin") {
      const token = "admin-token-" + Date.now();
      safeStorage.setItem(KEY_ADMIN_TOKEN, token);
      return { token, name: "مدیر سیستم" };
    }
    throw new Error("نام کاربری یا رمز عبور اشتباه است");
  },

  logout: () => {
    safeStorage.removeItem(KEY_ADMIN_TOKEN);
  },

  isAuthenticated: () => !!safeStorage.getItem(KEY_ADMIN_TOKEN),

  getRequests: async (filters?: any) => {
    await delay(600);
    // Combine static mock data with the real user data from local storage
    const requests = [...MOCK_REQUESTS];
    const userLoanStr = safeStorage.getItem(KEY_LOAN);
    if (userLoanStr) {
      const userLoan = JSON.parse(userLoanStr);
      // Avoid duplicate ID if mock has it (unlikely with timestamps)
      if (!requests.find(r => r.id === userLoan.id)) {
        requests.unshift(userLoan); // Add user loan to top
      }
    }
    
    // Simple client-side filtering
    let filtered = requests;
    if (filters?.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.id.toLowerCase().includes(q) || 
        r.mobile.includes(q) || 
        r.nationalId.includes(q)
      );
    }

    return filtered;
  },

  getRequestById: async (id: string) => {
    await delay(400);
    const userLoanStr = safeStorage.getItem(KEY_LOAN);
    if (userLoanStr) {
      const userLoan = JSON.parse(userLoanStr);
      if (userLoan.id === id) return userLoan;
    }
    return MOCK_REQUESTS.find(r => r.id === id) || null;
  },

  // Update status and sync with User's LocalStorage if it matches
  updateStatus: async (id: string, newStatus: LoanStatus, extraData: any = {}) => {
    await delay(1000);
    
    // 1. Update if it's the user's active loan (Real Sync)
    const userLoanStr = safeStorage.getItem(KEY_LOAN);
    if (userLoanStr) {
      const userLoan = JSON.parse(userLoanStr);
      if (userLoan.id === id) {
        const updated = { 
          ...userLoan, 
          status: newStatus, 
          updatedAt: new Date().toISOString(),
          ...extraData 
        };
        safeStorage.setItem(KEY_LOAN, JSON.stringify(updated));
        return updated;
      }
    }

    // 2. Update if it's a mock loan (In-memory for session)
    const mockIndex = MOCK_REQUESTS.findIndex(r => r.id === id);
    if (mockIndex !== -1) {
      MOCK_REQUESTS[mockIndex] = {
        ...MOCK_REQUESTS[mockIndex],
        status: newStatus,
        updatedAt: new Date().toISOString(),
        ...extraData
      };
      return MOCK_REQUESTS[mockIndex];
    }

    throw new Error("Request not found");
  },

  issueLetter: async (id: string) => {
    return adminApi.updateStatus(id, LoanStatus.LetterIssued);
  },

  recordBankResult: async (id: string, approved: boolean, data?: any) => {
    if (approved) {
      return adminApi.updateStatus(id, LoanStatus.LoanPaid, {
        bankResult: {
          paidAmountToman: data.amount,
          tenorMonths: data.tenor,
          paidAt: new Date().toISOString()
        }
      });
    } else {
      // If rejected by bank, maybe close it or go to a special state
      return adminApi.updateStatus(id, LoanStatus.Closed);
    }
  },

  closeRequest: async (id: string) => {
    // If it's user loan, we actually remove it so they can request again
    const userLoanStr = safeStorage.getItem(KEY_LOAN);
    if (userLoanStr) {
      const userLoan = JSON.parse(userLoanStr);
      if (userLoan.id === id) {
        // Option A: Just change status to Closed (History remains)
        // Option B: Remove to allow fresh start immediately. 
        // Let's go with B for "Closing/Resetting" logic as requested in prompt rules
        safeStorage.removeItem(KEY_LOAN); 
        return { ...userLoan, status: LoanStatus.Closed };
      }
    }
    return adminApi.updateStatus(id, LoanStatus.Closed);
  }
};