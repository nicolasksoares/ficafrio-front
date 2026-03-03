import { createContext } from "react";

export interface User {
  id: number;
  trade_name: string;
  legal_name: string;
  cnpj: string;
  email: string;
  phone: string;
  type: string;
  address_street?: string;
  address_number?: string;
  district?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SignupData {
  company_name: string;
  cnpj: string;
  phone: string;
  
  zip_code: string;
  state: string;
  city: string;
  address_street: string;
  address_number: string;
  district: string;

  corporate_email: string; 
  password?: string;
  confirm_password?: string;
}

export interface AuthResponse {
  error: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, data: SignupData, turnstileToken: string) => Promise<AuthResponse>;
  forgotPassword: (email: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);