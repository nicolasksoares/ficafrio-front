"use client"

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { 
  Loader2, MapPin, Thermometer, Package, 
  ChevronLeft, Clock, Calendar, CheckCircle2, 
  Share2, ShieldCheck, Zap, 
  Truck, Building2, FileCheck, Info, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProposalDialog } from "@/components/dashboard/ProposalDialog";
import { useToast } from "@/hooks/use-toast";
import { ensureAbsoluteImageUrl } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";

interface SpaceDetail {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  street_address: string;
  number: string;
  district: string;
  zip_code: string;
  min_temperature_celsius: number;
  max_temperature_celsius: number;
  available_pallet_positions: number;
  total_pallet_positions: number;
  chamber_type: string;
  operating_hours: string; 
  available_from: string;
  available_until: string;
  main_image: string | null;
  photos: string[] | null;
  has_anvisa?: boolean;
  has_security?: boolean;
  has_generator?: boolean;
  has_dock?: boolean;
  company?: {
    trade_name: string;
  }
}

export const EspacoDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [space, setSpace] = useState<SpaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para o carrossel
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);
  
  // Estados para modal fullscreen
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [fullscreenApi, setFullscreenApi] = useState<CarouselApi>();
  
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Coleta todas as imagens disponíveis de forma robusta
  const collectImages = useCallback((data: SpaceDetail) => {
    const images: string[] = [];
    
    // Adiciona imagem principal se existir
    if (data.main_image) {
      const mainImgUrl = ensureAbsoluteImageUrl(data.main_image);
      if (mainImgUrl && !images.includes(mainImgUrl)) {
        images.push(mainImgUrl);
      }
    }
    
    // Adiciona todas as fotos adicionais
    if (data.photos && Array.isArray(data.photos)) {
      data.photos.forEach((photo: string) => {
        const photoUrl = ensureAbsoluteImageUrl(photo);
        if (photoUrl && !images.includes(photoUrl)) {
          images.push(photoUrl);
        }
      });
    }
    
    return images.length > 0 ? images : ["/placeholder.svg"];
  }, []);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/spaces/${id}`);
        const data = res.data.data;
        setSpace(data);

        // Coleta todas as imagens
        const images = collectImages(data);
        setAllImages(images);

      } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do espaço.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSpace();
  }, [id, collectImages, toast]);

  // Atualiza o índice atual quando o carrossel muda
  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCurrent(carouselApi.selectedScrollSnap());

    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Sincroniza o índice do carrossel fullscreen com o estado
  useEffect(() => {
    if (!fullscreenApi) {
      return;
    }

    fullscreenApi.on("select", () => {
      setFullscreenIndex(fullscreenApi.selectedScrollSnap());
    });
  }, [fullscreenApi]);

  // Garante que o carrossel fullscreen abra sempre na imagem correta
  useEffect(() => {
    if (!fullscreenApi || !isFullscreenOpen) {
      return;
    }

    fullscreenApi.scrollTo(fullscreenIndex);
  }, [fullscreenApi, fullscreenIndex, isFullscreenOpen]);

  // Navegação por teclado no fullscreen (setas e Esc)
  useEffect(() => {
    if (!isFullscreenOpen || !fullscreenApi) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        fullscreenApi.scrollNext();
      } else if (event.key === "ArrowLeft") {
        fullscreenApi.scrollPrev();
      } else if (event.key === "Escape") {
        setIsFullscreenOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreenOpen, fullscreenApi]);

  // Abre modal fullscreen na imagem atual
  const openFullscreen = useCallback((index: number) => {
    setFullscreenIndex(index);
    setIsFullscreenOpen(true);
  }, []);

  // Navega para uma imagem específica
  const goToImage = useCallback((index: number) => {
    carouselApi?.scrollTo(index);
    setCurrent(index);
  }, [carouselApi]);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const cleanDate = dateStr.split('T')[0].split(' ')[0];
      return format(parseISO(`${cleanDate}T12:00:00`), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return null;
    }
  };

  const handleShare = async () => {
    if (!space) return;

    const shareData = {
      title: `FicaFrio - ${space.name}`,
      text: `Encontrei este espaço de armazenagem em ${space.city}: ${space.name}`,
      url: window.location.href,
    };

    const triggerSuccessState = () => {
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2500);
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        triggerSuccessState();
        toast({ title: "Link copiado!", description: "Pronto para colar." });
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        triggerSuccessState();
        toast({ title: "Link copiado!", description: "Link salvo na área de transferência." });
      } catch {
        toast({ title: "Erro", description: "Não foi possível compartilhar.", variant: "destructive" });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <p className="text-xl font-semibold text-slate-600">Espaço não encontrado.</p>
        <Button onClick={() => navigate("/buscar")}>Voltar para busca</Button>
      </div>
    );
  }

  const hasMultipleImages = allImages.length > 1;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex justify-between items-center mb-6">
            <Button 
              variant="ghost" 
              className="gap-2 text-slate-600 hover:text-sky-600 pl-0 hover:bg-transparent transition-colors duration-300"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className={cn(
                "gap-2 shadow-xs transition-all duration-500 ease-out active:scale-95",
                isShared 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700" 
                  : "bg-white text-slate-600 hover:bg-slate-50 hover:text-sky-600 hover:border-sky-200"
              )}
            >
              <div className={cn(
                "transition-all duration-500 transform",
                isShared ? "scale-110 rotate-0" : "scale-100 rotate-0"
              )}>
                {isShared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              </div>
              <span className={cn(
                "transition-opacity duration-300",
                isShared ? "font-bold" : "font-medium"
              )}>
                {isShared ? "Copiado!" : "Compartilhar"}
              </span>
            </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* --- GALERIA DE IMAGENS MELHORADA --- */}
            <div className="space-y-4">
              <div className="group relative overflow-hidden rounded-3xl bg-slate-100 shadow-xl border border-slate-100 h-[260px] sm:h-[320px] md:h-[380px] max-h-[60vh] flex items-center justify-center">
                {hasMultipleImages ? (
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
                          <div className="relative h-full w-full flex items-center justify-center">
                            <img 
                              src={img} 
                              alt={`${space.name} - Foto ${idx + 1}`}
                              className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                              loading={idx === 0 ? "eager" : "lazy"}
                              onClick={() => openFullscreen(idx)}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    
                    <CarouselPrevious 
                      className="left-4 h-10 w-10 bg-white/95 hover:bg-white text-slate-700 border-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    />
                    <CarouselNext 
                      className="right-4 h-10 w-10 bg-white/95 hover:bg-white text-slate-700 border-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    />
                  </Carousel>
                ) : (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <img 
                      src={allImages[0]} 
                      alt={space.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105 cursor-zoom-in"
                      loading="eager"
                      onClick={() => openFullscreen(0)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Badge Tipo */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-white/95 backdrop-blur-md text-sky-700 px-3 py-1.5 text-xs font-bold border-none shadow-lg uppercase tracking-wide">
                    {space.chamber_type}
                  </Badge>
                </div>

                {/* Indicador de múltiplas imagens */}
                {hasMultipleImages && (
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 z-10 shadow-lg">
                    <div className="flex gap-1.5">
                      {allImages.map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            idx === current
                              ? "bg-white w-8"
                              : "bg-white/50 w-2"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-white">
                      {current + 1}/{allImages.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Galeria de Thumbnails Melhorada */}
              {hasMultipleImages && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-sm font-semibold text-slate-700">
                      Galeria de Fotos ({allImages.length})
                    </p>
                    <p className="text-xs text-slate-500">
                      Clique para ampliar
                    </p>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 px-1">
                    {allImages.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          goToImage(idx);
                          openFullscreen(idx);
                        }}
                        className={cn(
                          "relative h-20 w-28 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer hover:shadow-lg group/thumb",
                          idx === current 
                            ? "border-sky-500 ring-2 ring-sky-200 scale-105 opacity-100 shadow-md" 
                            : "border-slate-200 opacity-70 hover:opacity-100 hover:scale-105 hover:border-slate-300"
                        )}
                        aria-label={`Ver foto ${idx + 1}`}
                      >
                        <img 
                          src={img} 
                          className="h-full w-full object-contain bg-slate-100 transition-transform duration-300 group-hover/thumb:scale-110" 
                          alt={`Thumbnail ${idx + 1}`}
                          loading="lazy"
                        />
                        {idx === current && (
                          <div className="absolute inset-0 bg-sky-500/20 pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* --- CONTEÚDO DO ESPAÇO --- */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-3 tracking-tight">
                  {space.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
                        <MapPin className="h-4 w-4 text-sky-500" />
                        <span className="font-medium">{space.city}/{space.state}</span>
                    </div>
                    {space.company && (
                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">
                              Anunciado por: <span className="text-slate-900 font-semibold">{space.company.trade_name}</span>
                            </span>
                        </div>
                    )}
                </div>
              </div>

              <div className="w-full h-px bg-linear-to-r from-slate-200 via-slate-100 to-transparent" />
              
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Info className="h-5 w-5 text-sky-500" /> Sobre este espaço
                </h3>
                <p className="text-base leading-relaxed text-slate-600 whitespace-pre-line pl-1">
                    {space.description || "Descrição não fornecida."}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Infraestrutura e Diferenciais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {space.has_anvisa && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-emerald-800 transition-colors hover:bg-emerald-50">
                            <div className="p-2 bg-emerald-100 rounded-full"><FileCheck className="h-4 w-4" /></div>
                            <span className="font-semibold text-sm">Licença ANVISA</span>
                        </div>
                    )}
                    {space.has_security && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100/50 border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100">
                            <div className="p-2 bg-slate-200 rounded-full"><ShieldCheck className="h-4 w-4" /></div>
                            <span className="font-semibold text-sm">Segurança 24h</span>
                        </div>
                    )}
                    {space.has_generator && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/50 border border-amber-100 text-amber-800 transition-colors hover:bg-amber-50">
                            <div className="p-2 bg-amber-100 rounded-full"><Zap className="h-4 w-4" /></div>
                            <span className="font-semibold text-sm">Gerador Próprio</span>
                        </div>
                    )}
                    {space.has_dock && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-blue-800 transition-colors hover:bg-blue-50">
                            <div className="p-2 bg-blue-100 rounded-full"><Truck className="h-4 w-4" /></div>
                            <span className="font-semibold text-sm">Docas de Carga</span>
                        </div>
                    )}
                    {(!space.has_anvisa && !space.has_security && !space.has_generator && !space.has_dock) && (
                        <div className="col-span-2 flex items-center gap-2 text-slate-500 italic p-3 bg-slate-50 rounded-xl justify-center border border-dashed border-slate-200">
                            <Info className="h-4 w-4" /> Detalhes de infraestrutura não informados.
                        </div>
                    )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Localização Aproximada</h3>
                <div className="w-full h-48 bg-slate-100 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-200 group shadow-inner">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover grayscale transition-transform duration-1000 group-hover:scale-110"></div>
                    <div className="z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <MapPin className="h-10 w-10 text-sky-600 mb-2 drop-shadow-md fill-sky-100" />
                        <div className="bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm border border-slate-100">
                            <p className="font-bold text-slate-800 text-sm">{space.district}</p>
                            <p className="text-xs text-slate-500 text-center">{space.city} - {space.state}</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2 italic text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> O endereço exato é liberado após a confirmação.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-none shadow-xl rounded-3xl bg-white ring-1 ring-slate-100/80">
              <CardContent className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-sky-50/80 rounded-2xl flex flex-col items-center justify-center text-center border border-sky-100">
                        <Thermometer className="h-6 w-6 text-sky-600 mb-1" />
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Temperatura</span>
                        <span className="text-sm font-extrabold text-sky-900 mt-0.5">
                            {space.min_temperature_celsius}° a {space.max_temperature_celsius}°C
                        </span>
                    </div>
                    <div className="p-4 bg-blue-50/80 rounded-2xl flex flex-col items-center justify-center text-center border border-blue-100">
                        <Package className="h-6 w-6 text-blue-600 mb-1" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Capacidade</span>
                        <span className="text-sm font-extrabold text-blue-900 mt-0.5">
                            {space.available_pallet_positions} paletes
                        </span>
                    </div>
                </div>

                <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-xs text-sky-600"><Calendar className="h-5 w-5" /></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Disponibilidade</p>
                            <p className="text-sm font-bold text-slate-700">
                                {formatDate(space.available_from) && formatDate(space.available_until)
                                    ? `${formatDate(space.available_from)} até ${formatDate(space.available_until)}`
                                    : "Sob consulta"}
                            </p>
                        </div>
                    </div>
                    
                    <div className="w-full h-px bg-slate-200/60 my-1"></div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-xs text-sky-600"><Clock className="h-5 w-5" /></div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Horário de Operação</p>
                            <p className="text-sm font-bold text-slate-700">
                                {space.operating_hours || "Comercial (08:00 - 18:00)"}
                            </p>
                        </div>
                    </div>
                </div>

                <Button 
                  onClick={() => setIsProposalOpen(true)}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white h-14 rounded-xl text-lg font-bold shadow-lg shadow-sky-200/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Solicitar Cotação
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                   <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 
                   Empresa Verificada & Ativa
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Modal Fullscreen para Imagens */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex flex-col">
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-semibold">
                {fullscreenIndex + 1} / {allImages.length}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreenOpen(false)}
                className="h-10 w-10 rounded-full bg-black/60 hover:bg-black/80 text-white border-none"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Carousel
              setApi={setFullscreenApi}
              className="w-full h-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="h-full ml-0">
                {allImages.map((img, idx) => (
                  <CarouselItem key={idx} className="h-full pl-0 basis-full">
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                      <img 
                        src={img} 
                        alt={`${space.name} - Foto ${idx + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 h-12 w-12 bg-black/60 hover:bg-black/80 text-white border-none" />
              <CarouselNext className="right-4 h-12 w-12 bg-black/60 hover:bg-black/80 text-white border-none" />
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>

      <ProposalDialog 
        open={isProposalOpen}
        onOpenChange={setIsProposalOpen}
        spaceId={space.id}
        spaceCity={space.city}
        spaceState={space.state}
        spaceDisplayName={space.name}
      />
    </div>
  );
};

export default EspacoDetalhes;
