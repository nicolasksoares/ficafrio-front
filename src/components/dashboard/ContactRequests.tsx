"use client"

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  MessageSquare, 
  ArrowRight, 
  Sparkles,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ContactRequests = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header com estilo moderno */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-100">
          <MessageSquare className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Solicitações de Contato
          </h1>
          <p className="text-slate-500 font-medium">
            Centralize suas conversas e negociações diretas.
          </p>
        </div>
      </div>

      {/* Card de "Em Breve" com visual de Glassmorphism suave */}
      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Lado Esquerdo: Conteúdo */}
            <div className="p-8 md:p-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Em Breve
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                Uma nova forma de se conectar com parceiros logística.
              </h2>
              
              <p className="text-slate-600 leading-relaxed">
                Estamos desenvolvendo um chat integrado para facilitar a troca de documentos e detalhes operacionais entre você e os donos de câmaras frias.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-emerald-100 text-emerald-600">
                    <Lock className="h-3 w-3" />
                  </div>
                  <p className="text-sm text-slate-500">Conversas criptografadas e seguras.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-1 rounded-full bg-emerald-100 text-emerald-600">
                    <Lock className="h-3 w-3" />
                  </div>
                  <p className="text-sm text-slate-500">Histórico de negociações vinculado às propostas.</p>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/dashboard?section=proposals')}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-6 h-auto font-bold group transition-all"
                >
                  Ir para Minhas Propostas
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* Lado Direito: Ilustração Visual / Decorative */}
            <div className="bg-linear-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-12 relative overflow-hidden">
              {/* Círculos decorativos de fundo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full -ml-20 -mb-20 blur-3xl" />
              
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center rotate-12 animate-bounce duration-[3000ms]">
                  <Mail className="h-10 w-10 text-indigo-500" />
                </div>
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg flex items-center justify-center -absolute -bottom-4 -right-4 -rotate-12">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};