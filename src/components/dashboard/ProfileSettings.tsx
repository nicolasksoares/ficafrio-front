import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, MapPin, Building2, Contact } from "lucide-react";

// Constantes e Interfaces
const STATES = ["SP", "MG", "RJ"] as const;

interface IBGECityResponse {
  id: number;
  nome: string;
}

// Schema alinhado com o Signup (Auth.tsx)
const companyProfileSchema = z.object({
  company_name: z.string().min(3, "Nome da empresa é obrigatório"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  corporate_email: z.string().email("Email inválido"),
  
  // Endereço detalhado
  zip_code: z.string().min(8, "CEP inválido"),
  state: z.string().min(2, "UF obrigatória"),
  city: z.string().min(1, "Cidade obrigatória"),
  address_street: z.string().min(1, "Logradouro obrigatório"),
  address_number: z.string().min(1, "Número obrigatório"),
  district: z.string().min(1, "Bairro obrigatório"),
});

type CompanyProfileValues = z.infer<typeof companyProfileSchema>;

export const ProfileSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false); // Loading do envio (PUT)
  const [fetching, setFetching] = useState(true); // Loading da busca inicial (GET)
  const [companyId, setCompanyId] = useState<number | null>(null);
  
  // Estados para Cidade/IBGE
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const form = useForm<CompanyProfileValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      company_name: "",
      cnpj: "",
      phone: "",
      corporate_email: "",
      zip_code: "",
      state: "",
      city: "",
      address_street: "",
      address_number: "",
      district: "",
    },
  });

  // Monitora o estado para buscar cidades (Igual ao Auth.tsx)
  const selectedState = form.watch("state");

  useEffect(() => {
    if (!selectedState) {
        setCities([]);
        return;
    }

    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`
        );
        const data: IBGECityResponse[] = await response.json();
        const cityNames = data.map(city => city.nome).sort();
        setCities(cityNames);
        
        // Nota: O React Hook Form manterá o valor de 'city' vindo do banco
        // e assim que essa lista carregar, ele vai "casar" o valor com a opção.
      } catch {
        toast({ title: "Erro", description: "Erro ao carregar cidades do IBGE", variant: "destructive" });
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedState, toast]);

  // Busca dados da empresa e preenche o formulário
  const fetchCompanyProfile = useCallback(async () => {
    try {
      setFetching(true);
      
      const response = await api.get('/me');
      const data = response.data.data || response.data;
      
      console.log("Dados do Perfil Recebidos:", data); 

      if (data) {
        setCompanyId(data.id);

        // AQUI ESTÁ A MÁGICA: Mapeamento dos campos do Backend -> Formulário
        form.reset({
          // Identificação
          company_name: data.trade_name || data.name || "", 
          cnpj: data.cnpj || "",
          
          // Contato (Backend usa 'email', form usa 'corporate_email')
          phone: data.phone || "",
          corporate_email: data.email || "", 
          
          // Endereço (Backend deve retornar os campos separados conforme Auth)
          zip_code: data.zip_code || "",
          state: data.state || "",
          city: data.city || "",
          address_street: data.address_street || "",
          address_number: data.address_number || "",
          district: data.district || "",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da empresa.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [form, toast]);

  // Carrega apenas uma vez na montagem
  useEffect(() => {
    fetchCompanyProfile();
  }, [fetchCompanyProfile]);

  const onSubmit = async (data: CompanyProfileValues) => {
    if (!companyId) return;

    try {
      setLoading(true);

      // Prepara payload para o backend (Formulário -> Backend)
      const payload = {
        // Mapeia de volta para os nomes que o backend espera
        trade_name: data.company_name, 
        name: data.company_name,       
        phone: data.phone,
        email: data.corporate_email,   
        
        // Campos de endereço separados
        zip_code: data.zip_code,
        state: data.state,
        city: data.city,
        address_street: data.address_street,
        address_number: data.address_number,
        district: data.district,
        
        // Fallback de endereço completo (caso o backend precise de retrocompatibilidade)
        address: `${data.address_street}, ${data.address_number} - ${data.district}, ${data.city} - ${data.state}`
      };

      await api.put(`/companies/${companyId}`, payload);

      toast({
        title: "Sucesso!",
        description: "As informações da empresa foram atualizadas.",
        className: "bg-green-50 border-green-200 text-green-900", // Toast verdinho de sucesso
      });

    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações. Verifique os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
        <p className="text-muted-foreground text-sm">Carregando informações do perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Configurações</h1>
        <p className="text-slate-500">
          Gerencie as informações cadastrais da sua empresa
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* BLOCO 1: DADOS EMPRESARIAIS */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sky-700">
                <Building2 className="h-5 w-5" />
                <CardTitle className="text-lg">Dados da Empresa</CardTitle>
              </div>
              <CardDescription>Informações legais e de identificação.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Nome da Empresa (Fantasia)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Empresa LTDA" className="bg-white border-slate-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">CNPJ</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00.000.000/0000-00" 
                        {...field} 
                        disabled 
                        className="bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* BLOCO 2: ENDEREÇO (IGUAL AO REGISTER) */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sky-700">
                <MapPin className="h-5 w-5" />
                <CardTitle className="text-lg">Endereço</CardTitle>
              </div>
              <CardDescription>Localização da sede da empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4">
                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" className="bg-white border-slate-200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12 md:col-span-3">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">UF</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="" disabled>Selecione</option>
                            {STATES.map((uf) => (
                              <option key={uf} value={uf}>{uf}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12 md:col-span-5">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Cidade</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                            disabled={!selectedState || isLoadingCities}
                          >
                            <option value="" disabled>
                              {isLoadingCities ? "Carregando..." : "Selecione"}
                            </option>
                            {cities.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-8">
                  <FormField
                    control={form.control}
                    name="address_street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Logradouro</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida..." className="bg-white border-slate-200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <FormField
                    control={form.control}
                    name="address_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700">Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" className="bg-white border-slate-200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Centro" className="bg-white border-slate-200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* BLOCO 3: CONTATO */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2 text-sky-700">
                <Contact className="h-5 w-5" />
                <CardTitle className="text-lg">Contato</CardTitle>
              </div>
              <CardDescription>Dados para comunicação.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" className="bg-white border-slate-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="corporate_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">E-mail Corporativo</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contato@empresa.com" className="bg-white border-slate-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-700 text-white min-w-[150px] shadow-md h-11">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};