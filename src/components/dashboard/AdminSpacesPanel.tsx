"use client"

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // <--- NOVO
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { Loader2, CheckCircle2, XCircle, MapPin, Building, Clock, ExternalLink, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Space } from "@/types";

export const AdminSpacesPanel = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // --- NOVOS ESTADOS PARA FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'todos' | 'em_analise' | 'aprovado' | 'rejeitado'>('todos');

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate(); 

  const loadSpaces = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await api.get('/admin/spaces');
      const data = response.data.data || response.data || [];
      setSpaces(data);
    } catch (error) {
      console.error("Erro no AdminPanel:", error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erro de conexão.";
      setErrorMsg(errorMessage);
      toast({ title: "Erro", description: "Não foi possível carregar os espaços.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);

  // --- LÓGICA DE FILTRAGEM NO FRONTEND ---
  const filteredSpaces = useMemo(() => {
    return spaces.filter(space => {
        // 1. Filtro de Status
        if (statusFilter !== 'todos' && space.status !== statusFilter) return false;
        
        // 2. Filtro de Texto (Nome, Empresa, Cidade)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const nameMatch = space.name?.toLowerCase().includes(term);
            const cityMatch = space.city?.toLowerCase().includes(term);
            const companyMatch = space.company?.trade_name?.toLowerCase().includes(term);
            return nameMatch || cityMatch || companyMatch;
        }
        return true;
    });
  }, [spaces, searchTerm, statusFilter]);

  const handleAnalyze = async (id: number, approved: boolean, reason?: string) => {
    try {
      setProcessingId(id);
      await api.post(`/admin/spaces/${id}/analyze`, { approved, reason });
      toast({
        title: approved ? "Aprovado!" : "Rejeitado",
        description: approved ? "Espaço publicado." : "Parceiro notificado.",
        variant: approved ? "default" : "destructive"
      });
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedSpaceId(null);
      loadSpaces();
    } catch (error) {
      console.error("Falha:", error);
      toast({ title: "Erro", description: "Falha ao processar.", variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSpaceId(id);
    setRejectDialogOpen(true);
  };

  const handleApproveClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    handleAnalyze(id, true);
  };

  const statusConfig = {
    em_analise: { label: "Em Análise", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    aprovado: { label: "Aprovado", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    rejeitado: { label: "Rejeitado", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-sky-600" /></div>;
  if (errorMsg) return <div className="text-center py-20 text-red-500">{errorMsg} <Button onClick={loadSpaces} variant="link">Tentar de novo</Button></div>;

  return (
    <div className="space-y-6">
      {/* HEADER E FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aprovações</h1>
          <p className="text-slate-500">Auditoria e controle de qualidade.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Buscar empresa, cidade..." 
                    className="pl-9 w-full sm:w-64 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                {(['todos', 'em_analise', 'aprovado', 'rejeitado'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            statusFilter === status 
                            ? 'bg-white text-slate-900 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {status === 'todos' ? 'Todos' : 
                         status === 'em_analise' ? 'Pendentes' : 
                         status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* LISTA FILTRADA */}
      <div className="grid gap-4">
        {filteredSpaces.map((space) => {
          const currentStatus = space.status || 'em_analise';
          const StatusIcon = statusConfig[currentStatus]?.icon || Clock;
          
          return (
            <Card 
                key={space.id} 
                onClick={() => navigate(`/espaco/${space.id}`)}
                className={`overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer group ${currentStatus === 'em_analise' ? 'border-l-amber-500 ring-1 ring-amber-50' : 'border-l-slate-300 opacity-95'}`}
            >
              <CardHeader className="pb-3 bg-slate-50/30 group-hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={`flex items-center gap-1 ${statusConfig[currentStatus]?.color}`}>
                        <StatusIcon className="w-3 h-3" /> {statusConfig[currentStatus]?.label}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">
                        {space.created_at ? format(new Date(space.created_at), "dd/MM/yy HH:mm", { locale: ptBR }) : 'Data N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xl text-slate-800">{space.name}</CardTitle>
                        <ExternalLink className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Building className="h-3 w-3" /> {space.company?.trade_name || 'Empresa'} • <MapPin className="h-3 w-3" /> {space.city}/{space.state}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardFooter className="pt-4 bg-white border-t border-slate-100 flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                {currentStatus === 'em_analise' ? (
                  <>
                    <Button variant="outline" className="text-red-700 hover:bg-red-50 hover:border-red-200" onClick={(e) => openRejectDialog(space.id, e)} disabled={processingId === space.id}>
                      Rejeitar
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100" onClick={(e) => handleApproveClick(space.id, e)} disabled={processingId === space.id}>
                      {processingId === space.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar</>}
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Processado</span>
                      {currentStatus === 'rejeitado' && (
                        <Button variant="link" className="text-sky-600 h-auto p-0" onClick={(e) => handleApproveClick(space.id, e)}>Reverter e Aprovar</Button>
                      )}
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}

        {filteredSpaces.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhum espaço encontrado com os filtros atuais.</p>
            <Button variant="link" onClick={() => {setSearchTerm(''); setStatusFilter('todos');}}>Limpar Filtros</Button>
          </div>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-slate-200">
          <DialogHeader><DialogTitle className="text-red-700 flex items-center gap-2"><XCircle className="w-5 h-5"/> Rejeitar Espaço</DialogTitle><DialogDescription>Motivo da rejeição (será enviado ao parceiro):</DialogDescription></DialogHeader>
          <Textarea placeholder="Ex: Fotos ilegíveis..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="min-h-[100px]" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => selectedSpaceId && handleAnalyze(selectedSpaceId, false, rejectReason)} disabled={!rejectReason.trim()}>Confirmar Rejeição</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};