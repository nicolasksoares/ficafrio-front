import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  Wallet, 
  FileCheck, 
  Ban,
  Archive
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const normalizedStatus = status?.toLowerCase() || "";

  const variants: Record<string, { 
    label: string; 
    className: string; 
    icon: React.ElementType 
  }> = {
    // Status Gerais / Fluxo de Solicitação
    pending: { 
      label: "Pendente", 
      className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100", 
      icon: Clock 
    },
    pendente: { 
      label: "Pendente", 
      className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100", 
      icon: Clock 
    },
    
    // Análise de Espaços
    under_review: { 
      label: "Em Análise", 
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100", 
      icon: FileCheck 
    },
    em_revisao: { 
      label: "Em Revisão", 
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100", 
      icon: FileCheck 
    },
    em_ajuste: { 
      label: "Ajustes Necessários", 
      className: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100", 
      icon: AlertCircle 
    },

    // Status de Aprovação / Cotação
    accepted_by_owner: { 
      label: "Aceito", 
      className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100", 
      icon: CheckCircle2 
    },
    aceito: { 
      label: "Aceito", 
      className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100", 
      icon: CheckCircle2 
    },
    active: { 
      label: "Ativo", 
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", 
      icon: CheckCircle2 
    },
    ativo: { 
      label: "Ativo", 
      className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100", 
      icon: CheckCircle2 
    },

    // Financeiro
    payment_pending: { 
      label: "Pagamento Pendente", 
      className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100", 
      icon: Wallet 
    },
    payment_confirmed: { 
      label: "Pago", 
      className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100", 
      icon: CheckCircle2 
    },

    // Finalizados / Negativos
    completed: { 
      label: "Finalizado", 
      className: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200", 
      icon: Archive 
    },
    rejected: { 
      label: "Recusado", 
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100", 
      icon: XCircle 
    },
    rejeitado: { 
      label: "Recusado", 
      className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100", 
      icon: XCircle 
    },
    inativo: { 
      label: "Inativo", 
      className: "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200", 
      icon: Ban 
    },
  };

  const config = variants[normalizedStatus] || { 
    label: status, 
    className: "bg-gray-100 text-gray-600 border-gray-200", 
    icon: HelpCircle 
  };

  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn("gap-1.5 py-1 px-2.5 font-medium border shadow-sm transition-colors", config.className, className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};