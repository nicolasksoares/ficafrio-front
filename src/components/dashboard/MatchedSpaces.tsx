"use client"

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Loader2, Snowflake, Thermometer, Box, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

// Interface atualizada conforme o SpaceResource do Backend
interface MatchedSpace {
  id: number;
  name: string;
  city: string;
  state: string;
  // Campos mapeados do JSON do SpaceResource
  available_pallet_positions: number;
  min_temperature_celsius: number;
  max_temperature_celsius: number;
  chamber_type?: string;
  main_image?: string | null;
  has_quote?: boolean; // Campo calculado se existir no backend
}

interface MatchedSpacesProps {
  needId: number | string;
  needTitle: string;
}

export const MatchedSpaces = ({ needId, needTitle }: MatchedSpacesProps) => {
  const [matches, setMatches] = useState<MatchedSpace[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/storage-requests/${needId}/matches`);
      // O Resource Collection do Laravel sempre encapsula em 'data'
      const data = response.data.data || [];
      setMatches(data);
      
      // Se o backend enviar flag de cotação existente
      const alreadyQuoted = data.filter((m: MatchedSpace) => m.has_quote).map((m: MatchedSpace) => m.id);
      if (alreadyQuoted.length > 0) {
        setRequestedIds(new Set(alreadyQuoted));
      }

    } catch (error) { 
      console.error(error);
      toast.error('Erro ao buscar parceiros compatíveis.'); 
    } finally { 
      setLoading(false); 
    }
  }, [needId]);

  useEffect(() => { 
    loadMatches(); 
  }, [loadMatches]);

  const handleRequest = async (spaceId: number) => {
    setProcessingIds(prev => new Set(prev).add(spaceId));

    try {
      await api.post('/quotes', { storage_request_id: needId, space_id: spaceId });
      toast.success('Solicitação enviada com sucesso!');
      setRequestedIds(prev => new Set(prev).add(spaceId));

    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message || 'Falha na solicitação.';
        // Se erro for 409 (Conflict) ou mensagem indicar duplicação, marcamos como feito
        if (error.response?.status === 409 || message.toLowerCase().includes('exist')) {
             setRequestedIds(prev => new Set(prev).add(spaceId));
             toast.info("Cotação já havia sido solicitada.");
        } else {
             toast.error(message);
        }
      } else {
        toast.error('Ocorreu um erro inesperado.');
      }
    } finally { 
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(spaceId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-3xl" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
        <div className="flex justify-center mb-4">
            <Box className="h-10 w-10 text-slate-300" />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Nenhum match encontrado para "{needTitle}"
        </p>
        <p className="text-xs text-slate-400 mt-2">
            Aguarde novos parceiros ou ajuste os filtros de temperatura/local.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match, index) => {
        const isProcessing = processingIds.has(match.id);
        const isRequested = requestedIds.has(match.id);
        const isTopMatch = index === 0; 

        return (
          <Card 
            key={match.id} 
            className="group relative border border-slate-200 transition-all duration-300 overflow-hidden flex flex-col bg-white rounded-3xl hover:shadow-xl hover:-translate-y-1"
          >
            {/* Header com Imagem ou Placeholder */}
            <div className="h-32 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              {match.main_image ? (
                <img 
                    src={(() => {
                      // Garante que a URL seja absoluta
                      const url = match.main_image;
                      return url && url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url?.startsWith('/') ? '' : '/'}${url}`;
                    })()}
                    alt={match.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <Snowflake className="h-10 w-10 text-sky-200 opacity-50" />
              )}
              
              {isTopMatch && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-sky-500 hover:bg-sky-600 text-white border-0 font-black text-[9px] uppercase shadow-md cursor-default">
                    Top Match
                  </Badge>
                </div>
              )}

              {/* Gradiente para texto sobrepor imagem */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 left-3 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 z-10">
                 <Snowflake className="h-3 w-3" /> {match.chamber_type || 'Câmara Fria'}
              </div>
            </div>

            <CardHeader className="p-4 pb-2 space-y-1">
              <CardTitle className="text-sm font-black uppercase text-slate-800 line-clamp-1" title={match.name}>
                {match.name}
              </CardTitle>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                <MapPin size={12} className="text-rose-500 shrink-0"/> 
                <span className="truncate">{match.city} - {match.state}</span>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-2 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                {/* Capacidade */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <Box className="h-3.5 w-3.5 text-sky-600" />
                  <span className="font-bold text-slate-700 text-xs">{match.available_pallet_positions}</span> 
                  <span className="text-[9px] text-slate-400 uppercase font-black">vagas</span>
                </div>
                {/* Temperatura */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <Thermometer className="h-3.5 w-3.5 text-rose-500" />
                  <span className="font-bold text-slate-700 text-xs">
                    {match.min_temperature_celsius}° a {match.max_temperature_celsius}°C
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-3 bg-slate-50/50 border-t border-slate-100">
              <Button 
                onClick={() => handleRequest(match.id)}
                disabled={isProcessing || isRequested}
                className={`w-full font-black uppercase text-[10px] tracking-widest h-9 rounded-xl transition-all shadow-sm
                    ${isRequested 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 opacity-100 cursor-default"
                        : "bg-slate-900 hover:bg-sky-600 text-white hover:shadow-md active:scale-95"
                    }
                `}
              >
                {isProcessing ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : isRequested ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Solicitado
                  </>
                ) : (
                  "Solicitar Cotação"
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};