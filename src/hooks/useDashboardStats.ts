import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface DashboardStats {
  mode: 'admin' | 'user';
  totalCompanies?: number;
  pendingSpaces?: number;
  activeSpaces?: number;
  totalRequests?: number;
  recentUsers?: Array<{
    trade_name: string;
    email: string;
    created_at: string;
  }>;
  totalSpaces?: number;
  activeRequests?: number;
  totalCities?: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook customizado para gerenciar estatísticas do dashboard
 * 
 * @returns {UseDashboardStatsReturn} Objeto com stats, loading, error e função refetch
 */
export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<DashboardStats>("/dashboard/stats");
      setStats(response.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao carregar estatísticas');
      setError(error);
      console.error("Erro ao carregar stats do dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

