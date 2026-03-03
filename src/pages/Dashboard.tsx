"use client"

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { NavBar } from "@/components/NavBar"
import { useAuth } from "@/hooks/useAuth"
import {
  Home,
  Snowflake,
  Package,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Mail,
  Shield,
  LogOut,
  Building,
  CheckSquare,
  Menu,
  X,
  Loader2,
  Sparkles,
  Zap,
  DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Importações diretas para componentes frequentes (melhor performance)
import { DashboardHome } from "@/components/dashboard/DashboardHome"
import { RegisterSpace } from "@/components/dashboard/RegisterSpace"
import { RegisterNeed } from "@/components/dashboard/RegisterNeed"
import { SearchSpaces } from "@/components/dashboard/SearchSpaces"
import { MyOperations } from "@/components/dashboard/MyOperations"

// Lazy loading apenas para componentes pesados/raros
const MyProposals = lazy(() => import("@/components/dashboard/MyProposals").then(m => ({ default: m.MyProposals })))
const ProfileSettings = lazy(() => import("@/components/dashboard/ProfileSettings").then(m => ({ default: m.ProfileSettings })))
const ContactRequests = lazy(() => import("@/components/dashboard/ContactRequests").then(m => ({ default: m.ContactRequests })))
const AdminIntermediationPanel = lazy(() => import("@/components/dashboard/AdminIntermediationPanel").then(m => ({ default: m.AdminIntermediationPanel })))
const AdminSpacesPanel = lazy(() => import("@/components/dashboard/AdminSpacesPanel").then(m => ({ default: m.AdminSpacesPanel })))
const AdminQuotesPanel = lazy(() => import("@/components/dashboard/AdminQuotesPanel").then(m => ({ default: m.AdminQuotesPanel })))
const AdminCompaniesPanel = lazy(() => import("@/components/dashboard/AdminCompaniesPanel").then(m => ({ default: m.AdminCompaniesPanel })))
const NotificationsMenu = lazy(() => import("@/components/dashboard/NotificationsMenu").then(m => ({ default: m.NotificationsMenu })))
const PaymentHistory = lazy(() => import("@/pages/PaymentHistory"))
const AdminPaymentManagement = lazy(() => import("@/pages/admin/PaymentManagement"))

// Componente de loading melhorado
const ComponentLoader = () => (
  <div className="flex items-center justify-center py-20 animate-in fade-in duration-300">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
        <div className="absolute inset-0 h-10 w-10 animate-ping text-sky-200 opacity-20" />
      </div>
      <p className="text-sm text-slate-500 font-medium">Carregando conteúdo...</p>
    </div>
  </div>
)

export type DashboardSection =
  | "home"
  | "register-space"
  | "register-need"
  | "search"
  | "operations"
  | "proposals"
  | "payments"
  | "contact-requests"
  | "admin"
  | "admin-spaces"
  | "admin-quotes"
  | "admin-companies"
  | "admin-payments"
  | "settings"

interface MenuItem {
  id: DashboardSection
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  adminOnly?: boolean
  description?: string
}

const Dashboard = () => {
  const { user, isLoading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSection, setActiveSection] = useState<DashboardSection>("home")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Verificação se é admin
  const isAdmin = user?.type === 'admin'

  // Feedback ao voltar do Stripe (sucesso ou cancelamento)
  useEffect(() => {
    const success = searchParams.get('payment_success')
    const cancelled = searchParams.get('payment_cancelled')
    if (success === '1') {
      toast.success('Pagamento concluído com sucesso. A confirmação pode levar alguns instantes.')
      const next = new URLSearchParams(searchParams)
      next.delete('payment_success')
      next.delete('payment_id')
      setSearchParams(next, { replace: true })
    } else if (cancelled === '1') {
      toast.info('Pagamento cancelado. Você pode tentar novamente quando quiser.')
      const next = new URLSearchParams(searchParams)
      next.delete('payment_cancelled')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // Sincroniza URL com estado interno
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/auth", { replace: true })
      return
    }

    // Verifica se há section na URL
    const sectionFromUrl = searchParams.get('section') as DashboardSection | null
    const sectionFromState = location.state?.activeTab as DashboardSection | null

    if (sectionFromUrl && isValidSection(sectionFromUrl, isAdmin)) {
      setActiveSection(sectionFromUrl)
    } else if (sectionFromState && isValidSection(sectionFromState, isAdmin)) {
      setActiveSection(sectionFromState)
      setSearchParams({ section: sectionFromState })
    } else {
      setActiveSection("home")
      setSearchParams({ section: "home" })
    }
  }, [user, authLoading, navigate, location.state, searchParams, setSearchParams, isAdmin])

  // Função auxiliar para validar seção
  const isValidSection = (section: string, isAdmin: boolean): section is DashboardSection => {
    const validSections: DashboardSection[] = ["home", "settings"]
    const adminSections: DashboardSection[] = ["admin", "admin-spaces", "admin-quotes", "admin-companies", "admin-payments"]
    const userSections: DashboardSection[] = ["register-space", "register-need", "operations", "proposals", "payments", "contact-requests", "search"]
    
    return validSections.includes(section as DashboardSection) ||
           (isAdmin && adminSections.includes(section as DashboardSection)) ||
           (!isAdmin && userSections.includes(section as DashboardSection))
  }

  // Handler para mudança de seção com animação
  const handleSectionChange = useCallback((section: DashboardSection) => {
    if (section === activeSection) return
    
    setIsTransitioning(true)
    setActiveSection(section)
    setSearchParams({ section })
    setMobileMenuOpen(false)
    
    // Reset transition após animação
    setTimeout(() => setIsTransitioning(false), 300)
  }, [activeSection, setSearchParams])

  // Configuração do menu lateral com descrições
  const menuItems = useMemo<MenuItem[]>(() => {
    const items: MenuItem[] = [
      { 
        id: "home", 
        label: "Visão Geral", 
        icon: Home,
        description: "Painel principal com estatísticas"
      },
    ]

    if (isAdmin) {
      items.push(
        { 
          id: "admin", 
          label: "Relatórios Gerais", 
          icon: Shield, 
          adminOnly: true,
          description: "Métricas e análises da plataforma"
        },
        { 
          id: "admin-spaces", 
          label: "Aprovar Espaços", 
          icon: CheckSquare, 
          adminOnly: true,
          description: "Moderação de anúncios"
        },
        { 
          id: "admin-quotes", 
          label: "Aprovar Propostas", 
          icon: Package, 
          adminOnly: true,
          description: "Cotações aguardando aprovação"
        },
        { 
          id: "admin-companies", 
          label: "Empresas", 
          icon: Building, 
          adminOnly: true,
          description: "Listagem de empresas cadastradas"
        },
        { 
          id: "admin-payments", 
          label: "Gerenciar Pagamentos", 
          icon: DollarSign, 
          adminOnly: true,
          description: "Gestão financeira"
        }
      )
    } else {
      items.push(
        { 
          id: "register-space", 
          label: "Cadastrar Espaço", 
          icon: Snowflake,
          description: "Anuncie seu galpão"
        },
        { 
          id: "register-need", 
          label: "Solicitar Armazenamento", 
          icon: Package,
          description: "Publique sua demanda"
        },
        { 
          id: "operations", 
          label: "Minhas Operações", 
          icon: TrendingUp,
          description: "Gerencie seus espaços"
        },
        { 
          id: "proposals", 
          label: "Minhas Propostas", 
          icon: Package,
          description: "Cotações e negociações"
        },
        { 
          id: "payments", 
          label: "Pagamentos", 
          icon: DollarSign,
          description: "Histórico de pagamentos"
        },
        { 
          id: "contact-requests", 
          label: "Solicitações de Contato", 
          icon: Mail,
          description: "Mensagens recebidas"
        }
      )
    }

    items.push({ 
      id: "settings", 
      label: "Configurações", 
      icon: Settings,
      description: "Perfil e preferências"
    })

    return items
  }, [isAdmin])

  // Preload de componentes críticos quando Dashboard monta
  useEffect(() => {
    // Preload de componentes lazy que podem ser acessados
    const preloadComponents = async () => {
      if (isAdmin) {
        // Preload componentes admin
        import("@/components/dashboard/AdminIntermediationPanel")
        import("@/components/dashboard/AdminSpacesPanel")
        import("@/components/dashboard/AdminQuotesPanel")
        import("@/components/dashboard/AdminCompaniesPanel")
        import("@/pages/admin/PaymentManagement")
      }
      // Preload componentes comuns
      import("@/components/dashboard/MyProposals")
      import("@/pages/PaymentHistory")
    }
    preloadComponents()
  }, [isAdmin])

  // Renderização do conteúdo otimizada (sem Suspense duplo)
  const renderContent = useCallback(() => {
    switch (activeSection) {
      case "home":
        return <DashboardHome />
      case "register-space":
        return <RegisterSpace />
      case "register-need":
        return <RegisterNeed />
      case "search":
        return <SearchSpaces />
      case "operations":
        return <MyOperations />
      case "proposals":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <MyProposals />
          </Suspense>
        )
      case "payments":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <PaymentHistory />
          </Suspense>
        )
      case "contact-requests":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ContactRequests />
          </Suspense>
        )
      case "admin":
        return isAdmin ? (
          <Suspense fallback={<ComponentLoader />}>
            <AdminIntermediationPanel />
          </Suspense>
        ) : <DashboardHome />
      case "admin-spaces":
        return isAdmin ? (
          <Suspense fallback={<ComponentLoader />}>
            <AdminSpacesPanel />
          </Suspense>
        ) : <DashboardHome />
      case "admin-quotes":
        return isAdmin ? (
          <Suspense fallback={<ComponentLoader />}>
            <AdminQuotesPanel />
          </Suspense>
        ) : <DashboardHome />
      case "admin-companies":
        return isAdmin ? (
          <Suspense fallback={<ComponentLoader />}>
            <AdminCompaniesPanel />
          </Suspense>
        ) : <DashboardHome />
      case "admin-payments":
        return isAdmin ? (
          <Suspense fallback={<ComponentLoader />}>
            <AdminPaymentManagement />
          </Suspense>
        ) : <DashboardHome />
      case "settings":
        return (
          <Suspense fallback={<ComponentLoader />}>
            <ProfileSettings />
          </Suspense>
        )
      default:
        return <DashboardHome />
    }
  }, [activeSection, isAdmin])

  // Dados do usuário
  const companyName = useMemo(() => {
    return user?.trade_name || user?.legal_name || user?.email?.split("@")[0] || "Minha Empresa"
  }, [user])

  const userEmail = user?.email || ""
  const currentSectionLabel = menuItems.find((item) => item.id === activeSection)?.label || "Dashboard"
  const currentSectionDescription = menuItems.find((item) => item.id === activeSection)?.description

  // Loading state melhorado
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-sky-50">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
            <Sparkles className="h-6 w-6 text-sky-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-slate-700 font-semibold">Carregando painel...</p>
            <p className="text-xs text-slate-500">Preparando sua experiência</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen w-screen bg-linear-to-br from-slate-50 via-white to-sky-50/30 flex flex-col overflow-hidden">
        {/* NavBar Fixo */}
        <div className="fixed top-0 left-0 right-0 z-50 shadow-sm">
          <NavBar />
        </div>

        <div className="pt-16 flex flex-1 overflow-hidden">
          {/* Sidebar Desktop - Melhorado */}
          <aside
            className={cn(
              "hidden md:flex flex-col bg-white/95 backdrop-blur-md border-r border-slate-200/80 transition-all duration-300 z-40 h-full shadow-lg",
              sidebarCollapsed ? "w-20" : "w-72"
            )}
          >
            {/* Header do Sidebar com Gradiente */}
            <div
              className={cn(
                "p-4 border-b border-slate-100 flex flex-col justify-center transition-all relative overflow-hidden",
                sidebarCollapsed ? "h-20 items-center" : "h-24"
              )}
            >
              {/* Background gradiente sutil */}
              <div className={cn(
                "absolute inset-0 opacity-5",
                isAdmin ? "bg-linear-to-br from-purple-500 to-indigo-500" : "bg-linear-to-br from-sky-500 to-blue-500"
              )} />
              
              <div className="flex items-center gap-3 w-full relative z-10">
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all shadow-md group-hover:scale-110",
                    isAdmin
                      ? "bg-linear-to-br from-purple-100 to-indigo-100 border-purple-200 text-purple-600"
                      : "bg-linear-to-br from-sky-100 to-blue-100 border-sky-200 text-sky-600"
                  )}
                >
                  {isAdmin ? <Shield className="h-6 w-6" /> : <Building className="h-6 w-6" />}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                    <p className="font-bold text-sm text-slate-800 truncate leading-tight" title={companyName}>
                      {companyName}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1" title={userEmail}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {isAdmin ? "Administrador" : "Parceiro"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Botão de Collapse Melhorado */}
            <div className="px-4 py-3 flex justify-end border-b border-slate-100 bg-slate-50/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-sky-600 transition-all hover:scale-110 active:scale-95"
                    aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                  >
                    {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{sidebarCollapsed ? "Expandir menu" : "Recolher menu"}</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Navegação Melhorada */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <Tooltip key={item.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSectionChange(item.id)}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-sm font-medium group relative overflow-hidden",
                          sidebarCollapsed ? "justify-center" : "",
                          isActive
                            ? isAdmin
                              ? "bg-linear-to-r from-purple-50 to-indigo-50 text-purple-700 shadow-md shadow-purple-100/50 scale-[1.02]"
                              : "bg-linear-to-r from-sky-50 to-blue-50 text-sky-700 shadow-md shadow-sky-100/50 scale-[1.02]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.01]"
                        )}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        {/* Background animado no hover */}
                        <div className={cn(
                          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                          isAdmin ? "bg-linear-to-r from-purple-50/50 to-indigo-50/50" : "bg-linear-to-r from-sky-50/50 to-blue-50/50"
                        )} />
                        
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-all relative z-10",
                            isActive
                              ? isAdmin
                                ? "text-purple-600 scale-110"
                                : "text-sky-600 scale-110"
                              : "text-slate-400 group-hover:text-slate-600 group-hover:scale-110"
                          )}
                        />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1 text-left relative z-10 font-semibold">{item.label}</span>
                            {item.badge && (
                              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-sky-500 text-white shadow-sm animate-in zoom-in">
                                {item.badge}
                              </span>
                            )}
                            {isActive && (
                              <Zap className="h-4 w-4 text-sky-500 animate-pulse relative z-10" />
                            )}
                          </>
                        )}
                        {/* Indicador lateral animado */}
                        {isActive && !sidebarCollapsed && (
                          <div
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full animate-in slide-in-from-left duration-300",
                              isAdmin ? "bg-linear-to-b from-purple-600 to-indigo-600" : "bg-linear-to-b from-sky-600 to-blue-600"
                            )}
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                    {sidebarCollapsed && (
                      <TooltipContent side="right" className="bg-slate-900 text-white border-slate-700">
                        <p className="font-medium">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                        )}
                      </TooltipContent>
                    )}
                  </Tooltip>
                )
              })}
            </nav>

            {/* Footer do Sidebar Melhorado */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={signOut}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-red-600 hover:bg-red-50 hover:shadow-sm group",
                      sidebarCollapsed ? "justify-center" : ""
                    )}
                    title="Sair"
                  >
                    <LogOut className="h-5 w-5 shrink-0 group-hover:rotate-12 transition-transform" />
                    {!sidebarCollapsed && <span>Sair</span>}
                  </button>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right">
                    <p>Sair da conta</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </aside>

          {/* Menu Mobile Melhorado */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          <aside
            className={cn(
              "fixed left-0 top-16 bottom-0 w-80 bg-white/95 backdrop-blur-md border-r border-slate-200 z-50 transform transition-transform duration-300 shadow-2xl md:hidden",
              mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="p-4 border-b border-slate-100 bg-linear-to-r from-sky-50/50 to-blue-50/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center border-2 shadow-md",
                      isAdmin
                        ? "bg-linear-to-br from-purple-100 to-indigo-100 border-purple-200 text-purple-600"
                        : "bg-linear-to-br from-sky-100 to-blue-100 border-sky-200 text-sky-600"
                    )}
                  >
                    {isAdmin ? <Shield className="h-6 w-6" /> : <Building className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-800">{companyName}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {isAdmin ? "Administrador" : "Parceiro"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                      isActive
                        ? isAdmin
                          ? "bg-linear-to-r from-purple-50 to-indigo-50 text-purple-700 shadow-md"
                          : "bg-linear-to-r from-sky-50 to-blue-50 text-sky-700 shadow-md"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <div className="flex-1 text-left">
                      <span className="font-semibold">{item.label}</span>
                      {item.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    {isActive && <Zap className="h-4 w-4 text-sky-500 animate-pulse" />}
                  </button>
                )
              })}
            </nav>
            <div className="p-3 border-t border-slate-100">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sair da conta</span>
              </button>
            </div>
          </aside>

          {/* Conteúdo Principal Melhorado */}
          <main className="flex-1 overflow-y-auto bg-linear-to-br from-slate-50/50 via-white to-sky-50/20 relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            {/* Header Melhorado */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-sky-600 transition-all active:scale-95"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-xl md:text-3xl font-extrabold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {currentSectionLabel}
                  </h1>
                  {currentSectionDescription && (
                    <p className="text-xs md:text-sm text-slate-500 mt-1 hidden md:block">
                      {currentSectionDescription}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Suspense fallback={<Skeleton className="h-9 w-9 rounded-full" />}>
                  <NotificationsMenu />
                </Suspense>
              </div>
            </header>

            {/* Conteúdo com Animação */}
            <div className={cn(
              "p-4 md:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-8rem)]",
              "animate-in fade-in slide-in-from-bottom-4 duration-500"
            )}>
              <div className={cn(
                "transition-opacity duration-300",
                isTransitioning ? "opacity-0" : "opacity-100"
              )}>
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default Dashboard
