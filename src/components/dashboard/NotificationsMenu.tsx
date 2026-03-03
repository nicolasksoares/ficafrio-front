"use client"

import { useState, useEffect, useCallback, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell, 
  Info, 
  XCircle, 
  DollarSign, 
  PackageCheck, 
  MessageSquare, 
  Building2, 
  MapPin,
  CheckCheck,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { NotificationData } from "@/types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Interface para os dados da notificação
interface QuoteNotificationData {
  message: string;
  status?: string;
  quote_id?: number;
  space_name?: string;
  owner_name?: string;
  price?: number | string;
  quantity?: number;
  type?: 'quote' | 'space' | 'contact' | 'system';
}

interface NotificationItemProps {
  notification: NotificationData;
  onClick: (notification: NotificationData) => void;
  onMarkRead: (id: string) => void;
}

// Componente de item de notificação otimizado
const NotificationItem = ({ notification, onClick, onMarkRead }: NotificationItemProps) => {
  const data = notification.data as QuoteNotificationData;
  const isUnread = !notification.read_at;
  const config = getStatusConfig(data.status, data.type);
  const Icon = config.icon;

  const handleClick = () => {
    onClick(notification);
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnread) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative px-4 py-4 hover:bg-slate-50/80 transition-all flex gap-4 items-start cursor-pointer border-l-4 animate-in fade-in slide-in-from-right duration-300",
        isUnread 
          ? "bg-linear-to-r from-sky-50/50 to-blue-50/30 border-l-sky-500 shadow-sm" 
          : "border-l-transparent hover:border-l-slate-200"
      )}
    >
      {/* Indicador de não lida */}
      {isUnread && (
        <div className="absolute top-4 left-0 w-1 h-6 bg-sky-500 rounded-r-full animate-pulse" />
      )}

      {/* Ícone com gradiente */}
      <div className={cn(
        "mt-0.5 p-2.5 rounded-xl shrink-0 shadow-sm transition-transform group-hover:scale-110",
        config.color,
        isUnread && "ring-2 ring-sky-200"
      )}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-sm leading-snug pr-2",
            isUnread ? "font-bold text-slate-900" : "font-medium text-slate-700"
          )}>
            {data.message}
          </p>
          {isUnread && (
            <button
              onClick={handleMarkRead}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-200"
              title="Marcar como lida"
            >
              <CheckCircle2 className="h-4 w-4 text-slate-400 hover:text-sky-600" />
            </button>
          )}
        </div>

        {/* Card de detalhes (se houver informações adicionais) */}
        {(data.space_name || data.owner_name || data.price) && (
          <div className="bg-white/80 border border-slate-200/80 rounded-lg p-3 space-y-2 shadow-sm backdrop-blur-sm">
            {data.space_name && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                <span className="truncate">{data.space_name}</span>
              </div>
            )}
            {data.owner_name && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{data.owner_name}</span>
              </div>
            )}
            {data.price && (
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                  Proposta
                </span>
                <span className="text-sm font-extrabold bg-linear-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  R$ {Number(data.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer com status e tempo */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 h-5",
              config.badgeColor
            )}
          >
            {config.label}
          </Badge>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(notification.created_at), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Seta indicadora */}
      {isUnread && (
        <ArrowRight className="h-4 w-4 text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
      )}
    </div>
  );
};

// Função para obter configuração de status
const getStatusConfig = (status?: string, type?: string) => {
  switch (status) {
    case 'respondido':
      return { 
        icon: DollarSign, 
        color: "text-blue-600 bg-linear-to-br from-blue-50 to-blue-100", 
        label: "Orçamento Recebido",
        badgeColor: "bg-blue-100 text-blue-700 border-blue-200"
      };
    case 'aceito':
      return { 
        icon: PackageCheck, 
        color: "text-emerald-600 bg-linear-to-br from-emerald-50 to-emerald-100", 
        label: "Negócio Fechado",
        badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200"
      };
    case 'rejeitado':
      return { 
        icon: XCircle, 
        color: "text-rose-600 bg-linear-to-br from-rose-50 to-rose-100", 
        label: "Cancelado",
        badgeColor: "bg-rose-100 text-rose-700 border-rose-200"
      };
    case 'solicitado':
      return { 
        icon: MessageSquare, 
        color: "text-amber-600 bg-linear-to-br from-amber-50 to-amber-100", 
        label: "Nova Solicitação",
        badgeColor: "bg-amber-100 text-amber-700 border-amber-200"
      };
    default:
      if (type === 'space') {
        return {
          icon: Building2,
          color: "text-indigo-600 bg-linear-to-br from-indigo-50 to-indigo-100",
          label: "Espaço",
          badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200"
        };
      }
      return { 
        icon: Info, 
        color: "text-slate-500 bg-linear-to-br from-slate-50 to-slate-100", 
        label: "Aviso",
        badgeColor: "bg-slate-100 text-slate-600 border-slate-200"
      };
  }
};

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications com tratamento de erro melhorado
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/notifications');
      const data = res.data;
      const list = Array.isArray(data) ? data : data.data || [];
      
      // Ordena: não lidas primeiro, depois por data (mais recente primeiro)
      const sorted = [...list].sort((a, b) => {
        const aUnread = !a.read_at;
        const bUnread = !b.read_at;
        if (aUnread !== bUnread) return aUnread ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setNotifications(sorted);
      setUnreadCount(sorted.filter((n: NotificationData) => !n.read_at).length);
    } catch (error: any) {
      console.error('Erro ao buscar notificações:', error);
      toast.error('Não foi possível carregar as notificações');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Marcar notificação como lida
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Notificação marcada como lida');
    } catch (error: any) {
      console.error('Erro ao marcar notificação:', error);
      toast.error('Não foi possível marcar a notificação como lida');
    }
  }, []);

  // Marcar todas como lidas
  const handleMarkAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;
    
    try {
      setIsMarkingAll(true);
      await api.patch('/notifications/read-all');
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error: any) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Não foi possível marcar todas como lidas');
    } finally {
      setIsMarkingAll(false);
    }
  }, [unreadCount]);

  // Handler de clique na notificação
  const handleNotificationClick = useCallback(async (notification: NotificationData) => {
    if (!notification.read_at) {
      await handleMarkAsRead(notification.id);
    }
    
    const data = notification.data as QuoteNotificationData;
    
    // Navegação baseada no tipo/status
    if (data.status || data.type === 'quote') {
      navigate("/dashboard?section=proposals");
    } else if (data.type === 'space') {
      navigate("/dashboard?section=operations");
    } else if (data.type === 'contact') {
      navigate("/dashboard?section=contact-requests");
    }
    
    setIsOpen(false);
  }, [navigate, handleMarkAsRead]);

  // Fetch inicial e polling
  useEffect(() => {
    fetchNotifications();
    
    // Polling inteligente: mais frequente quando aberto, menos quando fechado
    const interval = setInterval(fetchNotifications, isOpen ? 10000 : 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications, isOpen]);

  // Re-fetch quando o popover abre
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Memoiza notificações não lidas
  const unreadNotifications = useMemo(
    () => notifications.filter(n => !n.read_at),
    [notifications]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-slate-100 rounded-xl transition-all hover:scale-110 active:scale-95"
        >
          <Bell className={cn(
            "h-5 w-5 transition-all",
            unreadCount > 0 
              ? "text-sky-600 animate-pulse" 
              : "text-slate-500"
          )} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-[420px] p-0 shadow-2xl border-slate-200/80 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-md"
      >
        {/* Header melhorado */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-linear-to-r from-sky-50/50 to-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100">
              <Bell className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Notificações</h4>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-600 mt-0.5">
                  {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="text-xs h-8 px-3 hover:bg-sky-100 text-sky-700"
            >
              {isMarkingAll ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Marcar todas
            </Button>
          )}
        </div>

        {/* Lista de notificações */}
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 p-8">
              <div className="relative mb-4">
                <Bell className="h-16 w-16 opacity-10" />
                <Sparkles className="h-6 w-6 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                Nenhuma notificação
              </p>
              <p className="text-xs text-slate-400 text-center">
                Você será notificado quando houver novas atualizações
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100/80">
              {notifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                  onMarkRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer com ação rápida */}
        {notifications.length > 0 && !isLoading && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard?section=proposals")}
              className="w-full text-xs text-sky-700 hover:bg-sky-100"
            >
              Ver todas as propostas
              <ArrowRight className="h-3 w-3 ml-2" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
