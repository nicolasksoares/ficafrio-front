"use client"

import { useState, memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Snowflake, ShieldCheck, Zap, BarChart3 } from "lucide-react"
import { SpaceFormDialog } from "./SpaceFormDialog"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"

const RegisterSpaceComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSuccess = () => {
    setDialogOpen(false)
    toast({
      title: "Espaço enviado para análise!",
      description: "Nossa equipe revisará os dados e ativará seu anúncio em breve.",
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-10">
      {/* Header com Identidade */}
      <div className="space-y-4 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100">
          <Snowflake className="h-4 w-4 text-sky-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Parceiro FicaFrio</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-sky-900 tracking-tight">
          Monetize sua <span className="text-sky-600">Capacidade Ociosa</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Cadastre suas câmaras frias, conecte-se com indústrias e distribuidores e aumente a rentabilidade da sua operação logística.
        </p>
      </div>

      {/* Botão de Ação Principal (Substituindo os Cards) */}
      <Card
        className="relative border-2 border-dashed border-sky-300 hover:border-sky-500 hover:shadow-2xl transition-all duration-500 cursor-pointer group overflow-hidden bg-white shadow-xl shadow-sky-100/50"
        onClick={() => setDialogOpen(true)}
      >
        <CardContent className="flex flex-col items-center justify-center p-16 text-center">
          <div className="relative w-24 h-24 rounded-3xl bg-sky-600 group-hover:bg-sky-700 flex items-center justify-center mb-8 transition-all duration-300 group-hover:scale-110 shadow-xl shadow-sky-200">
            <Plus className="w-12 h-12 text-white group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <h3 className="text-2xl font-bold text-sky-900 mb-3">
            Anunciar Nova Câmara Fria
          </h3>
          <p className="text-slate-500 max-w-md">
            Clique aqui para preencher os detalhes técnicos, fotos e capacidades do seu espaço refrigerado.
          </p>
        </CardContent>
      </Card>

      {/* Seção de Benefícios (Para preencher o espaço de forma profissional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <h4 className="font-bold text-slate-800">Segurança Total</h4>
          <p className="text-sm text-slate-500">Apenas empresas verificadas e com documentação em dia entram na nossa rede.</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-600" />
          </div>
          <h4 className="font-bold text-slate-800">Gestão de Demanda</h4>
          <p className="text-sm text-slate-500">Receba propostas de cotação diretamente no seu painel administrativo.</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="font-bold text-slate-800">Ativação Rápida</h4>
          <p className="text-sm text-slate-500">Após o cadastro, seu anúncio passa por uma revisão e fica ativo em até 24h.</p>
        </div>
      </div>

      <SpaceFormDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        companyId={user?.id?.toString() || ""} 
        onSuccess={handleSuccess} 
      />
    </div>
  )
}

export const RegisterSpace = memo(RegisterSpaceComponent)