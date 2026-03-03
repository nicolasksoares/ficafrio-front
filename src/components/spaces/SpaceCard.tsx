"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
  MapPin,
  Thermometer,
  Package,
  Lock,
  ArrowRight,
  Warehouse,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ensureAbsoluteImageUrl } from "@/lib/imageUtils"

interface SpaceCardProps {
  space: {
    id: string
    name: string
    city: string
    state: string
    min_temperature_celsius: number
    max_temperature_celsius: number
    available_pallet_positions: number
    chamber_type?: string | null
    photos?: string[] | null
    main_image?: string | null
  }
  user: any
  onCardClick: (spaceId: string) => void
  onReservar: (space: any, e: React.MouseEvent) => void
}

export const SpaceCard = ({ space, user, onCardClick, onReservar }: SpaceCardProps) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  // Coleta todas as imagens disponíveis
  const allImages: string[] = []
  
  if (space.main_image) {
    const mainImg = ensureAbsoluteImageUrl(space.main_image)
    if (mainImg) allImages.push(mainImg)
  }
  
  if (space.photos && Array.isArray(space.photos)) {
    space.photos.forEach((photo) => {
      const photoUrl = ensureAbsoluteImageUrl(photo)
      if (photoUrl && !allImages.includes(photoUrl)) {
        allImages.push(photoUrl)
      }
    })
  }

  const hasImages = allImages.length > 0
  const hasMultipleImages = allImages.length > 1

  // Atualiza o índice atual quando o carrossel muda
  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  return (
    <Card
      onClick={() => onCardClick(space.id)}
      className="group relative flex flex-col border-none shadow-sm hover:shadow-2xl hover:shadow-sky-100/50 transition-all duration-500 bg-white rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-2 ring-1 ring-slate-100/50 hover:ring-2 hover:ring-sky-500/30"
    >
      {/* --- ÁREA DA IMAGEM COM CARROSSEL --- */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-linear-to-br from-slate-100 to-slate-200">
        {hasImages ? (
          <>
            {/* Carrossel de Imagens */}
            {hasMultipleImages ? (
              <Carousel
                setApi={setApi}
                className="w-full h-full"
                opts={{
                  align: "start",
                  loop: true,
                  dragFree: false,
                }}
              >
                <CarouselContent className="h-full -ml-0">
                  {allImages.map((img, idx) => (
                    <CarouselItem key={idx} className="h-full pl-0 basis-full">
                      <div className="relative h-full w-full">
                        <img
                          src={img}
                          alt={`${space.name} - Foto ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading={idx === 0 ? "eager" : "lazy"}
                          onError={(e) => {
                            // Fallback para placeholder em caso de erro
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                        {/* Overlay gradiente para melhor legibilidade do texto */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/50 to-black/20" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                
                {/* Botões de navegação do carrossel */}
                <CarouselPrevious 
                  className="left-3 h-9 w-9 bg-white/95 hover:bg-white text-slate-700 border-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  onClick={(e) => e.stopPropagation()}
                />
                <CarouselNext 
                  className="right-3 h-9 w-9 bg-white/95 hover:bg-white text-slate-700 border-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                  onClick={(e) => e.stopPropagation()}
                />
              </Carousel>
            ) : (
              // Imagem única (sem carrossel)
              <div className="relative h-full w-full">
                <img
                  src={allImages[0]}
                  alt={space.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
            )}

            {/* Indicador de múltiplas imagens */}
            {hasMultipleImages && (
              <div className={cn(
                "absolute bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 z-20 shadow-lg transition-all",
                !user ? "top-14 right-4" : "top-4 right-4"
              )}>
                <div className="flex gap-1.5">
                  {allImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        idx === current
                          ? "bg-white w-6"
                          : "bg-white/50 w-1.5"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-white ml-0.5">
                  {current + 1}/{allImages.length}
                </span>
              </div>
            )}
          </>
        ) : (
          // Placeholder quando não há imagens
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-linear-to-br from-slate-50 to-slate-100">
            <Warehouse className="h-16 w-16 mb-3 opacity-40" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">
              Imagem Indisponível
            </span>
          </div>
        )}

        {/* Badge Tipo (Topo Esquerda) */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-white/95 backdrop-blur-md text-sky-800 px-3 py-1.5 text-xs font-bold shadow-lg border-none uppercase tracking-wide">
            {space.chamber_type || "Câmara Fria"}
          </Badge>
        </div>

        {/* Indicador de Lock (Topo Direita - Somente se !user) */}
        {!user && (
          <div
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/30 z-10 shadow-lg"
            title="Login necessário"
            onClick={(e) => e.stopPropagation()}
          >
            <Lock className="h-4 w-4 text-white" />
          </div>
        )}

        {/* Informações Principais (Rodapé da Imagem) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          <div className="flex items-center gap-2 mb-2 text-sky-200">
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider drop-shadow-lg">
              {space.city} / {space.state}
            </span>
          </div>
          <h3 className="text-2xl font-bold leading-tight text-white drop-shadow-lg line-clamp-2">
            {space.name}
          </h3>
        </div>
      </div>

      {/* --- CONTEÚDO E DETALHES --- */}
      <CardContent className="p-6 flex flex-col gap-5 bg-white grow">
        {/* Grid de Informações */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-linear-to-br from-orange-50 to-orange-100/50 border border-orange-200 group-hover:from-orange-100 group-hover:to-orange-50 transition-all duration-300">
            <div className="flex items-center gap-2 text-orange-700 mb-1">
              <div className="p-1.5 bg-orange-200 rounded-lg">
                <Thermometer className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider">
                Temperatura
              </span>
            </div>
            <span className="text-sm font-bold text-slate-800">
              {space.min_temperature_celsius}° a {space.max_temperature_celsius}°C
            </span>
          </div>

          <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-linear-to-br from-sky-50 to-sky-100/50 border border-sky-200 group-hover:from-sky-100 group-hover:to-sky-50 transition-all duration-300">
            <div className="flex items-center gap-2 text-sky-700 mb-1">
              <div className="p-1.5 bg-sky-200 rounded-lg">
                <Package className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider">
                Capacidade
              </span>
            </div>
            <span className="text-sm font-bold text-slate-800">
              {space.available_pallet_positions} paletes
            </span>
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="mt-auto pt-2">
          <Button
            className={cn(
              "w-full h-12 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-md",
              user
                ? "bg-linear-to-r from-slate-900 to-slate-800 text-white hover:from-sky-600 hover:to-sky-700 hover:shadow-sky-200/50 hover:-translate-y-0.5 active:translate-y-0"
                : "bg-slate-100 text-slate-500 border-2 border-slate-200 hover:bg-slate-200 hover:text-slate-700 hover:border-slate-300"
            )}
            onClick={(e) => onReservar(space, e)}
          >
            {user ? (
              <span className="flex items-center justify-center gap-2">
                Solicitar Cotação <ArrowRight className="h-4 w-4" />
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-3.5 w-3.5" /> Entrar para Cotar
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

