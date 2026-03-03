import { useState } from 'react';
import api from '@/lib/api';
import type { Payment } from '@/types/payment';
import { PaymentMethod } from '@/types/payment';
import { toast } from 'sonner';

function getErrorMessage(error: any, defaultMessage: string): string {
  if (!error.response) {
    return 'Verifique sua conexão e tente novamente.';
  }
  return error.response?.data?.message || defaultMessage;
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false);

  const createPayment = async (quoteId: number): Promise<Payment | null> => {
    try {
      setLoading(true);
      const response = await api.post(`/quotes/${quoteId}/payment`);
      return response.data.data || response.data;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Erro ao criar pagamento'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (
    paymentId: number,
    method: PaymentMethod
  ): Promise<Payment | null> => {
    try {
      setLoading(true);
      const response = await api.post(`/payments/${paymentId}/process`, {
        payment_method: method,
      });
      const payment = response.data.data || response.data;
      toast.success('Pagamento processado! Siga as instruções para finalizar.');
      return payment;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Erro ao processar pagamento'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = async (paymentId: number): Promise<Payment | null> => {
    try {
      setLoading(true);
      const response = await api.get(`/payments/${paymentId}/status`);
      return response.data.data || response.data;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Erro ao consultar status'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPayment = async (paymentId: number): Promise<Payment | null> => {
    try {
      setLoading(true);
      const response = await api.get(`/payments/${paymentId}`);
      return response.data.data || response.data;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Erro ao buscar pagamento'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async (
    paymentId: number,
    reason?: string
  ): Promise<Payment | null> => {
    try {
      setLoading(true);
      const response = await api.post(`/admin/payments/${paymentId}/refund`, {
        reason,
      });
      const payment = response.data.data || response.data;
      toast.success('Reembolso processado com sucesso!');
      return payment;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Erro ao processar reembolso'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createPayment,
    processPayment,
    getPaymentStatus,
    getPayment,
    refundPayment,
  };
};

