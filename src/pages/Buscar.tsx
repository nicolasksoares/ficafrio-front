"use client"

import { Button } from "@/components/ui/button";
import { ProposalDialog } from "@/components/dashboard/ProposalDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, MapPin, CalendarIcon, 
  Snowflake, Loader2, RotateCcw,
  Lock, Thermometer, Package
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useCallback, useMemo } from "react";
import { format, isBefore, startOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import api from "@/lib/api";

import { SpaceCardSkeleton } from "@/components/skeletons/SpaceCardSkeleton";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { cn } from "@/lib/utils";

interface ColdStorageSpace {
  id: string;
  name: string;
  city: string;
  state: string;
  min_temperature_celsius: number;
  max_temperature_celsius: number;
  available_pallet_positions: number;
  chamber_type?: string | null;
  photos?: string[] | null;
  main_image?: string | null;
  active: boolean;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  links: Array<{ url: string | null; label: string; active: boolean }>;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

const Buscar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  // Estados
  const [dateEntrada, setDateEntrada] = useState<Date>();
  const [dateSaida, setDateSaida] = useState<Date>();
  const [localizacao, setLocalizacao] = useState("todas");
  const [temperatura, setTemperatura] = useState("qualquer");
  const [celsius, setCelsius] = useState("");
  const [paletes, setPaletes] = useState("");
  
  const [espacos, setEspacos] = useState<ColdStorageSpace[]>([]);
  const [allSpaces, setAllSpaces] = useState<ColdStorageSpace[]>([]); 
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<ColdStorageSpace | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const cidadesDisponiveis = useMemo(() => {
    const cidades = allSpaces.map(s => `${s.city}, ${s.state}`);
    return Array.from(new Set(cidades)).sort();
  }, [allSpaces]);

  const isFormValid = useMemo(() => {
    if (dateEntrada && dateSaida && isBefore(dateSaida, dateEntrada)) return false;
    return true;
  }, [dateEntrada, dateSaida]);

  const fetchSpaces = useCallback(async (params: Record<string, string | number | undefined> = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/spaces', { params });
      const { data, ...meta } = response.data;
      setEspacos(data || []);
      setPaginationMeta(meta as PaginationMeta);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSpacesForAllCities = useCallback(async () => {
    try {
      const response = await api.get('/spaces');
      const data = response.data.data || response.data || [];
      setAllSpaces(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlCity = params.get('city');
    const urlState = params.get('state');
    const urlType = params.get('type');
    const urlTargetTemp = params.get('target_temp');
    const urlMinPositions = params.get('min_positions');
    const urlStartDate = params.get('start_date');
    const urlEndDate = params.get('end_date');
    const urlPage = params.get('page');

    if (urlCity && urlState) setLocalizacao(`${urlCity}, ${urlState}`);
    if (urlType) setTemperatura(urlType);
    if (urlTargetTemp) setCelsius(urlTargetTemp);
    if (urlMinPositions) setPaletes(urlMinPositions);
    if (urlStartDate) setDateEntrada(parseISO(urlStartDate));
    if (urlEndDate) setDateSaida(parseISO(urlEndDate));
    
    const pageNum = urlPage ? parseInt(urlPage, 10) : 1;
    setCurrentPage(pageNum);

    const initialParams = {
        city: urlCity || undefined,
        state: urlState || undefined,
        type: urlType || undefined,
        target_temp: urlTargetTemp ? parseFloat(urlTargetTemp) : undefined,
        min_positions: urlMinPositions ? parseInt(urlMinPositions, 10) : undefined,
        start_date: urlStartDate || undefined,
        end_date: urlEndDate || undefined,
        page: pageNum
    };

    if (Object.keys(initialParams).filter(k => initialParams[k as keyof typeof initialParams] !== undefined && k !== 'page').length > 0) setSearchPerformed(true);

    Promise.all([fetchSpaces(initialParams), fetchSpacesForAllCities()]);
  }, [location.search, fetchSpaces, fetchSpacesForAllCities]);

  const resetFilters = useCallback(() => {
    setLocalizacao("todas");
    setTemperatura("qualquer");
    setCelsius("");
    setPaletes("");
    setDateEntrada(undefined);
    setDateSaida(undefined);
    setSearchPerformed(false);
    setCurrentPage(1);
    navigate("/buscar", { replace: true });
    fetchSpaces({});
    toast.success("Filtros limpos!");
  }, [fetchSpaces, navigate]);

  const handleSearch = async (page: number = 1) => {
    if (!isFormValid) return;
    setSearchPerformed(true);
    setCurrentPage(page);

    const city = localizacao !== "todas" ? localizacao.split(',')[0].trim() : undefined;
    const state = localizacao !== "todas" ? localizacao.split(',')[1].trim() : undefined;

    const queryParams = {
      city,
      state,
      type: temperatura !== "qualquer" ? temperatura : undefined,
      target_temp: celsius ? parseFloat(celsius) : undefined,
      min_positions: paletes ? parseInt(paletes) : undefined,
      start_date: dateEntrada ? format(dateEntrada, "yyyy-MM-dd") : undefined,
      end_date: dateSaida ? format(dateSaida, "yyyy-MM-dd") : undefined,
      page,
    };

    Object.keys(queryParams).forEach(key => (queryParams[key as keyof typeof queryParams] === undefined || queryParams[key as keyof typeof queryParams] === "") && delete queryParams[key as keyof typeof queryParams]);

    const newParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => newParams.append(key, String(val)));
    
    navigate(`?${newParams.toString()}`, { replace: true });
    await fetchSpaces(queryParams);
  };

  // --- LÓGICA DE BLOQUEIO / AUTH GUARD ---
  
  // 1. Clique no CARD: Bloqueia e redireciona se não logado
  const handleCardClick = (spaceId: string) => {
    if (!user) {
        toast.info("Acesso Restrito", {
            description: "Para ver detalhes e fotos deste espaço, faça login ou cadastre-se.",
            action: { label: "Entrar", onClick: () => navigate("/auth") },
            icon: <Lock className="h-4 w-4 text-orange-500" />
        });
        navigate('/auth'); // Redirecionamento forçado
        return;
    }
    // Se logado, segue normal
    navigate(`/espaco/${spaceId}`);
  };

  // 2. Clique no BOTÃO: Bloqueia e redireciona se não logado
  const handleReservar = (space: ColdStorageSpace, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede clique duplo

    if (!user) { 
        toast.info("Login Necessário", {
            description: "Você precisa entrar na sua conta para solicitar uma cotação.",
            action: { label: "Entrar", onClick: () => navigate("/auth") },
            icon: <Lock className="h-4 w-4 text-orange-500" />
        });
        navigate('/auth'); // Redirecionamento forçado
        return; 
    }

    setSelectedSpace(space);
    setProposalDialogOpen(true);
  };


  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-sky-500" /></div>;

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 via-white to-slate-50">
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Header melhorado */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-linear-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-3 tracking-tight">
              Encontre o Espaço Ideal
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Conecte-se com espaços de armazenagem em frio disponíveis em toda a rede
            </p>
          </div>

          {/* --- BARRA DE PESQUISA MODERNIZADA --- */}
          <Card className="shadow-2xl border-2 border-sky-100/50 mb-16 max-w-6xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl overflow-visible z-10 relative hover:shadow-sky-200/50 transition-shadow duration-300">
            <CardContent className="p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2 tracking-wider uppercase">Localização</label>
                  <Select value={localizacao} onValueChange={setLocalizacao}>
                    <SelectTrigger className="border-slate-200 h-12 rounded-xl bg-slate-50/50">
                      <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                      <SelectValue placeholder="Selecione a cidade" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="todas">Todas as localizações</SelectItem>
                      {cidadesDisponiveis.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2 tracking-wider uppercase">Entrada</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-slate-200 bg-slate-50/50">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateEntrada ? format(dateEntrada, "dd/MM/yy") : "Data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                      <Calendar mode="single" selected={dateEntrada} onSelect={setDateEntrada} disabled={d => d < startOfDay(new Date())} locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2 tracking-wider uppercase">Saída</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-slate-200 bg-slate-50/50">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateSaida ? format(dateSaida, "dd/MM/yy") : "Data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                      <Calendar mode="single" selected={dateSaida} onSelect={setDateSaida} disabled={d => d < (dateEntrada || startOfDay(new Date()))} locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2 tracking-wider uppercase">Tipo de Câmara</label>
                  <Select value={temperatura} onValueChange={setTemperatura}>
                    <SelectTrigger className="border-slate-200 h-12 rounded-xl bg-slate-50/50"><SelectValue placeholder="Qualquer" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="qualquer">Qualquer</SelectItem>
                      <SelectItem value="resfriado">Resfriado</SelectItem>
                      <SelectItem value="congelado">Congelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2 tracking-wider uppercase">Temperatura do Produto (°C)</label>
                  <div className="relative">
                    <Input type="number" placeholder="Ex: -18" className="border-slate-200 h-12 pl-11 rounded-xl bg-slate-50/50" value={celsius} onChange={e => setCelsius(e.target.value)} />
                    <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-bold text-slate-400 ml-2 tracking-wider uppercase">Vagas Necessárias (Paletes)</label>
                  <div className="relative">
                    <Input type="number" min="0" placeholder="Ex: 50" className="border-slate-200 h-12 pl-11 rounded-xl bg-slate-50/50" value={paletes} onChange={e => setPaletes(e.target.value)} />
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <div className="md:col-span-4 flex gap-4">
                  <Button className="flex-1 bg-sky-600 hover:bg-sky-700 text-white h-12 text-base font-bold shadow-lg rounded-xl transition-all" onClick={() => handleSearch(1)} disabled={loading || !isFormValid}>
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Search className="w-5 h-5 mr-2" /> Buscar</>}
                  </Button>
                  <Button variant="outline" className="px-6 border-slate-200 text-slate-500 h-12 rounded-xl" onClick={resetFilters} disabled={loading}><RotateCcw className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* --- RESULTADOS COM CARROSSEL DE IMAGENS --- */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {searchPerformed ? `Resultados Encontrados` : 'Destaques da Rede'}
                </h2>
                {searchPerformed && paginationMeta && (
                  <p className="text-slate-600 text-sm">
                    {paginationMeta.total} {paginationMeta.total === 1 ? 'espaço disponível' : 'espaços disponíveis'}
                  </p>
                )}
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => <SpaceCardSkeleton key={i} />)}
              </div>
            ) : espacos.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-3xl py-16 text-center">
                <Snowflake className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700">Nenhum frigorífico encontrado</h3>
                <Button variant="outline" onClick={resetFilters} className="mt-4 rounded-xl border-sky-200 text-sky-600">Limpar filtros</Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {espacos.map((space) => (
                    <SpaceCard
                      key={space.id}
                      space={space}
                      user={user}
                      onCardClick={handleCardClick}
                      onReservar={handleReservar}
                    />
                  ))}
                </div>

                {paginationMeta && paginationMeta.last_page > 1 && (
                  <div className="flex justify-center mt-12 gap-2">
                    {Array.from({ length: paginationMeta.last_page }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => handleSearch(pageNum)}
                        className={cn(
                          "w-10 h-10 rounded-lg p-0",
                          currentPage === pageNum ? "bg-sky-600 text-white" : "border-slate-200 text-slate-600"
                        )}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {selectedSpace && user && (
        <ProposalDialog 
            open={proposalDialogOpen} 
            onOpenChange={setProposalDialogOpen} 
            spaceId={selectedSpace.id} 
            spaceCity={selectedSpace.city} 
            spaceState={selectedSpace.state} 
            spaceDisplayName={selectedSpace.name} 
        />
      )}
    </div>
  );
};

export default Buscar;