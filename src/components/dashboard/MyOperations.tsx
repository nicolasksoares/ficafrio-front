"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { 
  Snowflake, MapPin, MoreVertical, Pencil, Trash2, 
  ImageIcon, Clock, AlertCircle, CheckCircle2, 
  Thermometer, Box, Plus, LayoutGrid, ChevronLeft, ChevronRight
} from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SpaceFormDialog } from "./SpaceFormDialog"
import { useNavigate } from "react-router-dom"
import type { Space, SpaceStatus } from "@/types"
import { cn } from "@/lib/utils"
import { ensureAbsoluteImageUrl } from "@/lib/imageUtils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

// Interface auxiliar para os dados brutos da API
interface RawSpaceData {
  [key: string]: unknown;
  chamber_type?: string;
  type?: string;
  total_pallet_positions?: number;
  capacity?: number;
  min_temperature_celsius?: number;
  temp_min?: number;
  max_temperature_celsius?: number;
  temp_max?: number;
  street_address?: string;
  address?: string;
  status?: string;
  photos?: (string | { url: string })[];
  main_image?: string;
}

// Componente de Card de Espaço com Carrossel
interface SpaceCardProps {
  space: Space;
  onEdit: (space: Space) => void;
  onDelete: (id: number) => void;
  onNavigate: (id: number) => void;
}

const SpaceCard = ({ space, onEdit, onDelete, onNavigate }: SpaceCardProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Coleta todas as imagens disponíveis
  const allImages = useMemo(() => {
    const images: string[] = [];
    
    if (space.main_image) {
      const mainImgUrl = ensureAbsoluteImageUrl(space.main_image);
      if (mainImgUrl) images.push(mainImgUrl);
    }
    
    if (space.photos && Array.isArray(space.photos)) {
      space.photos.forEach((photo) => {
        const photoUrl = ensureAbsoluteImageUrl(photo as string);
        if (photoUrl && !images.includes(photoUrl)) {
          images.push(photoUrl);
        }
      });
    }
    
    return images.length > 0 ? images : null;
  }, [space.main_image, space.photos]);

  const hasMultipleImages = allImages && allImages.length > 1;

  // Atualiza o índice atual quando o carrossel muda
  useEffect(() => {
    if (!carouselApi) return;

    setCurrent(carouselApi.selectedScrollSnap());
    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
        aprovado: { color: "bg-emerald-500 hover:bg-emerald-600", icon: CheckCircle2, label: "Ativo" },
        rejeitado: { color: "bg-red-500 hover:bg-red-600", icon: AlertCircle, label: "Rejeitado" },
        em_analise: { color: "bg-amber-500 hover:bg-amber-600", icon: Clock, label: "Em Análise" }
    }[status] || { color: "bg-slate-500", icon: Clock, label: "Desconhecido" };

    const Icon = config.icon;

    return (
        <Badge className={cn("text-white shadow-sm gap-1 pl-1.5 pr-2.5 py-0.5", config.color)}>
            <Icon className="w-3.5 h-3.5" /> {config.label}
        </Badge>
    );
  };

  return (
    <Card 
      onClick={() => onNavigate(space.id)}
      className={cn(
        "group relative border transition-all duration-300 overflow-hidden flex flex-col bg-white rounded-3xl cursor-pointer hover:shadow-xl hover:-translate-y-1",
        space.status === 'rejeitado' ? 'border-red-200 hover:border-red-300' : 'border-slate-200 hover:border-sky-300'
      )}
    >
      {/* ÁREA DE IMAGENS COM CARROSSEL */}
      <div className="h-52 w-full bg-slate-100 border-b border-slate-100 relative overflow-hidden">
        {allImages ? (
          hasMultipleImages ? (
            <Carousel
              setApi={setCarouselApi}
              className="w-full h-full"
              opts={{
                align: "start",
                loop: true,
                dragFree: false,
              }}
            >
              <CarouselContent className="h-full ml-0">
                {allImages.map((img, idx) => (
                  <CarouselItem key={idx} className="h-full pl-0 basis-full">
                    <div className="relative h-full w-full">
                      <img 
                        src={img} 
                        alt={`${space.name} - Foto ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading={idx === 0 ? "eager" : "lazy"}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <CarouselPrevious 
                className="left-2 h-8 w-8 bg-white/95 hover:bg-white text-slate-700 border-slate-300 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                onClick={(e) => e.stopPropagation()}
              />
              <CarouselNext 
                className="right-2 h-8 w-8 bg-white/95 hover:bg-white text-slate-700 border-slate-300 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                onClick={(e) => e.stopPropagation()}
              />
            </Carousel>
          ) : (
            <div className="relative h-full w-full">
              <img 
                src={allImages[0]} 
                alt={space.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="eager"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          )
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-300 bg-linear-to-br from-slate-50 to-slate-100">
            <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Sem Foto</span>
          </div>
        )}
        
        {/* Badge de Status */}
        <div className="absolute top-4 left-4 z-10">
          <StatusBadge status={space.status} />
        </div>
        
        {/* Indicador de múltiplas imagens */}
        {hasMultipleImages && (
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 z-10 shadow-lg">
            <div className="flex gap-1">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === current
                      ? "bg-white w-5"
                      : "bg-white/50 w-1.5"
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-white">
              {current + 1}/{allImages.length}
            </span>
          </div>
        )}
        
        {/* Menu de Ações */}
        <div 
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20" 
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                className="h-9 w-9 p-0 bg-white/95 backdrop-blur-sm shadow-lg rounded-full border border-slate-200 hover:bg-white hover:scale-110 transition-all"
              >
                <MoreVertical className="h-4 w-4 text-slate-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white shadow-xl border-slate-100">
              <DropdownMenuItem 
                className="cursor-pointer font-medium text-slate-700 focus:bg-slate-50" 
                onClick={() => { 
                  onEdit(space); 
                }}
              >
                <Pencil className="mr-2 h-4 w-4 text-sky-500" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer font-medium text-red-600 focus:bg-red-50 focus:text-red-700" 
                onClick={() => onDelete(space.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Overlay com tipo de câmara */}
        <div className="absolute bottom-4 left-4 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 z-10">
          <Snowflake className="h-3.5 w-3.5" /> 
          {space.chamber_type || space.type}
        </div>
      </div>
      
      <CardHeader className="p-5 pb-2 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <CardTitle 
            className="text-lg font-bold text-slate-900 leading-tight line-clamp-1 group-hover:text-sky-600 transition-colors" 
            title={space.name}
          >
            {space.name}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {space.city} - {space.state}
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-4 flex-1">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <div className="flex items-center gap-1.5 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
            <Box className="h-4 w-4 text-sky-500" />
            <span className="font-semibold text-slate-900">{space.capacity}</span> 
            <span className="text-xs text-slate-400">paletes</span>
          </div>
          <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
            <Thermometer className="h-4 w-4 text-rose-500" />
            <span className="font-semibold text-slate-900">{space.temp_min}°</span> 
            <span className="text-xs text-slate-400">a</span> 
            <span className="font-semibold text-slate-900">{space.temp_max}°C</span>
          </div>
        </div>

        {space.status === 'rejeitado' && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <span className="font-bold block text-red-800 mb-0.5">Ação Necessária</span>
              O anúncio foi rejeitado pela moderação. Edite para corrigir.
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 text-xs text-slate-400 border-t border-slate-50 mt-auto bg-slate-50/30 flex justify-between items-center">
        <span>Atualizado recentemente</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 text-xs hover:text-sky-600 px-0 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(space.id);
          }}
        >
          Ver detalhes →
        </Button>
      </CardFooter>
    </Card>
  );
};

const MyOperationsComponent = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [spaces, setSpaces] = useState<Space[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)

  const fetchOperations = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      const res = await api.get("/my-spaces")
      const rawData: RawSpaceData[] = res.data.data || res.data || []
      
      const formattedData = rawData.map((s) => {
        let normalizedStatus: SpaceStatus = 'em_analise';
        const backendStatus = String(s.status).toLowerCase();

        if (backendStatus === 'ativo' || backendStatus === 'aprovado') normalizedStatus = 'aprovado';
        else if (backendStatus === 'rejeitado') normalizedStatus = 'rejeitado';
        else normalizedStatus = 'em_analise';

        return {
            ...s,
            type: (s.chamber_type || s.type) as string,
            capacity: (s.total_pallet_positions || s.capacity) as number,
            temp_min: (s.min_temperature_celsius ?? s.temp_min) as number,
            temp_max: (s.max_temperature_celsius ?? s.temp_max) as number,
            address: (s.street_address || s.address) as string,
            street_address: (s.street_address || s.address) as string,
            status: normalizedStatus,
            photos: Array.isArray(s.photos) ? s.photos.map((p) => typeof p === 'string' ? p : p.url) : []
        };
      }) as Space[] 
      
      setSpaces(formattedData)
    } catch (error) {
      console.error("Erro ao carregar espaços:", error);
      toast({ 
        title: "Erro", 
        description: "Falha ao carregar espaços.", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    if (user) fetchOperations()
  }, [fetchOperations, user])

  const handleDeleteSpace = useCallback(async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este espaço? Essa ação não pode ser desfeita.")) return
    try {
      await api.delete(`/spaces/${id}`)
      toast({ title: "Sucesso", description: "Espaço removido." })
      fetchOperations()
    } catch (error) {
      console.error("Erro ao excluir espaço:", error);
      toast({ 
        title: "Erro", 
        description: "Erro ao excluir.", 
        variant: "destructive" 
      })
    }
  }, [toast, fetchOperations])

  const handleEditSpace = useCallback((space: Space) => {
    setSelectedSpace(space);
    setIsEditDialogOpen(true);
  }, []);

  const handleNavigate = useCallback((id: number) => {
    navigate(`/espaco/${id}`);
  }, [navigate]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-3xl overflow-hidden shadow-sm bg-white">
                <Skeleton className="h-52 w-full" />
                <div className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-8 w-20 rounded-lg" />
                        <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                </div>
            </div>
        ))}
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-end">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <SpaceFormDialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setSelectedSpace(null);
        }}
        onSuccess={() => { 
          fetchOperations(); 
          setIsEditDialogOpen(false); 
        }}
        companyId={user?.id?.toString() || ""}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData={selectedSpace as any || undefined}
      />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-linear-to-br from-sky-100 to-blue-100 rounded-lg text-sky-700 shadow-sm">
                <LayoutGrid className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Minhas Operações</h1>
          </div>
          <p className="text-slate-500 ml-1">Gerencie seus ativos logísticos e disponibilidade.</p>
        </div>
        <Button 
          onClick={() => navigate("/dashboard?section=register-space")} 
          className="bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-md gap-2 transition-all hover:scale-105"
        >
            <Plus className="h-4 w-4" /> Novo Espaço
        </Button>
      </div>

      {/* GRID DE ESPAÇOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.length === 0 ? (
          <Card className="col-span-full border-2 border-dashed border-slate-200 py-20 text-center bg-linear-to-br from-slate-50 to-slate-100/50">
            <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-full shadow-sm ring-4 ring-slate-50">
                    <Snowflake className="h-10 w-10 text-slate-300" />
                </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nenhuma operação ativa</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">
              Você ainda não cadastrou nenhum espaço. Comece agora e aumente sua receita.
            </p>
            <Button 
              onClick={() => navigate("/dashboard?section=register-space")} 
              variant="outline" 
              className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:border-sky-300 transition-colors"
            >
                Cadastrar Primeiro Espaço
            </Button>
          </Card>
        ) : (
          spaces.map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onEdit={handleEditSpace}
              onDelete={handleDeleteSpace}
              onNavigate={handleNavigate}
            />
          ))
        )}
      </div>
    </div>
  )
}

export const MyOperations = memo(MyOperationsComponent)
