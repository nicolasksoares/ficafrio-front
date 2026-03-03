import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';

import ScrollToTop from "./components/ScrollToTop";
import { PublicLayout } from "./components/layout/PublicLayout";

// --- LAZY LOADING DAS PÁGINAS ---
const Index = lazy(() => import("./pages/Index"));
const Buscar = lazy(() => import("./pages/Buscar"));
const EspacoDetalhes = lazy(() => import("./pages/EspacoDetalhes")); 
const Sobre = lazy(() => import("./pages/Sobre"));
const Suporte = lazy(() => import("./pages/Suporte"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// QueryClient otimizado com cache e configurações de performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados frescos
      gcTime: 10 * 60 * 1000, // 10 minutos - tempo de cache (antigo cacheTime)
      refetchOnWindowFocus: false, // Não refetch ao focar na janela
      refetchOnMount: false, // Não refetch ao montar se dados estão frescos
      refetchOnReconnect: true, // Refetch apenas ao reconectar
      retry: 1, // Apenas 1 tentativa em caso de erro
      retryDelay: 1000, // 1 segundo entre tentativas
    },
    mutations: {
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-slate-50">
    <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
  </div>
);

const HomeGuard = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              
              {/* Rotas Públicas com Layout Padrão (Navbar/Footer) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomeGuard />} />
                <Route path="/buscar" element={<Buscar />} />
                
                {/* ROTA DINÂMICA PARA DETALHES */}
                <Route path="/espaco/:id" element={<EspacoDetalhes />} /> 
                
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/suporte" element={<Suporte />} />
                
                <Route path="/auth" element={<Auth />} />
                <Route path="/password-reset" element={<ResetPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Rota Privada (Dashboard gerencia suas próprias sub-rotas) */}
              <Route path="/dashboard/*" element={<Dashboard />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
              
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;