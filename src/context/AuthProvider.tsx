import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AxiosError } from "axios";
import api from "../lib/api"; 
import { AuthContext } from "./AuthContext";
import type { User, SignupData, AuthResponse } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("ficafrio_token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const { data } = await api.get("/me");
        setUser(data.data || data); 
      } catch {
        localStorage.removeItem("ficafrio_token");
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/login", { email, password });
      
      localStorage.setItem("ficafrio_token", data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      
      return { error: null };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return { error: err.response?.data?.message || "Erro ao realizar login" };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, data: SignupData, turnstileToken: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const payload = {
        trade_name: data.company_name,
        legal_name: data.company_name, 
        cnpj: data.cnpj,
        phone: data.phone,
        email: email,
        password: password,
        password_confirmation: password,
        
        zip_code: data.zip_code,
        state: data.state,
        city: data.city,
        address_street: data.address_street,
        address_number: data.address_number,
        district: data.district,
        
        turnstile_token: turnstileToken
      };
      
      const { data: responseData } = await api.post("/companies", payload);
      
      if (responseData.token) {
        localStorage.setItem("ficafrio_token", responseData.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${responseData.token}`;
        setUser(responseData.user || responseData.data);
      } else {
         await signIn(email, password);
      }
      return { error: null };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return { error: err.response?.data?.message || "Erro ao criar conta" };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      await api.post("/forgot-password", { email });
      return { error: null };
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      return { error: err.response?.data?.message || "Erro ao solicitar recuperação" };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("ficafrio_token");
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      window.location.href = "/auth";
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        signIn, 
        signUp, 
        forgotPassword,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};