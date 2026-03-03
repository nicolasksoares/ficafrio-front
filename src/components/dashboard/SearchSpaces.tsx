import { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Thermometer, Package, Search } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Space {
  id: string;
  name: string;
  city: string;
  state: string;
  min_temperature_celsius: number;
  max_temperature_celsius: number;
  available_pallet_positions: number;
  chamber_type: string;
  price_per_m3_month?: number;
  has_anvisa_certification: boolean;
  has_iso_certification: boolean;
  has_temperature_monitoring: boolean;
  has_24h_security: boolean;
  photos: string[];
}

const SearchSpacesComponent = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    type: 'qualquer' as string,
    minPositions: ''
  });

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/spaces', {
        params: {
          city: filters.city,
          state: filters.state,
          chamber_type: filters.type === 'qualquer' ? undefined : filters.type,
          min_positions: filters.minPositions || undefined
        }
      });

      const data = response.data.data || response.data;
      setSpaces(data || []);

    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro ao buscar espaços');
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Buscar Espaços Disponíveis</h1>
        <p className="text-muted-foreground">
          Explore opções de armazenamento refrigerado
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Cidade"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
            <Input
              placeholder="Estado (UF)"
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              maxLength={2}
            />
            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de câmara" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qualquer">Todos</SelectItem>
                <SelectItem value="resfriada">Resfriada</SelectItem>
                <SelectItem value="congelada">Congelada</SelectItem>
                <SelectItem value="ultra-congelada">Ultra-congelada</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Mín. de posições"
              value={filters.minPositions}
              onChange={(e) => setFilters({ ...filters, minPositions: e.target.value })}
            />
          </div>
          <Button onClick={handleSearch} className="mt-4 w-full md:w-auto" disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-sm text-muted-foreground">Buscando espaços...</p>
          </CardContent>
        </Card>
      ) : spaces.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum espaço encontrado com os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space) => (
            <Card key={space.id} className="hover:shadow-lg transition-shadow">
              {space.photos && space.photos.length > 0 ? (
                <img 
                  src={(() => {
                    // Garante que a URL seja absoluta
                    const url = space.photos[0];
                    return url && url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url?.startsWith('/') ? '' : '/'}${url}`;
                  })()}
                  alt="Espaço de armazenamento"
                  className="w-full h-40 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-40 bg-muted rounded-t-lg flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-lg">{space.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {space.city}, {space.state}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <span>{space.min_temperature_celsius}°C a {space.max_temperature_celsius}°C</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{space.available_pallet_positions} posições disponíveis</span>
                </div>

                {space.chamber_type && (
                  <div className="text-sm text-muted-foreground capitalize">
                    {space.chamber_type}
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {space.has_anvisa_certification && (
                    <Badge variant="secondary" className="text-xs">ANVISA</Badge>
                  )}
                  {space.has_iso_certification && (
                    <Badge variant="secondary" className="text-xs">ISO</Badge>
                  )}
                  {space.has_temperature_monitoring && (
                    <Badge variant="secondary" className="text-xs">Monitoramento</Badge>
                  )}
                  {space.has_24h_security && (
                    <Badge variant="secondary" className="text-xs">Segurança 24h</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const SearchSpaces = memo(SearchSpacesComponent)