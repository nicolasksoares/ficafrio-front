import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NavBar } from "@/components/NavBar";
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Turnstile } from '@marsidev/react-turnstile';

const STATES = ["SP", "MG", "RJ"] as const;

interface IBGECityResponse {
  id: number;
  nome: string;
}

const loginSchema = z.object({
  email: z.string().email({ message: "Insira um email válido" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Insira um email válido para recuperação" }),
});

const signupSchema = z.object({
  company_name: z.string().min(3, { message: "Nome da empresa é obrigatório" }),
  cnpj: z.string().min(14, { message: "CNPJ inválido (mínimo 14 dígitos)" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  
  zip_code: z.string().min(8, { message: "CEP inválido" }),
  state: z.enum(["SP", "MG", "RJ"]),
  city: z.string().min(1, { message: "Selecione a cidade" }),
  address_street: z.string().min(1, { message: "Logradouro é obrigatório" }),
  address_number: z.string().min(1, { message: "Número é obrigatório" }),
  district: z.string().min(1, { message: "Bairro é obrigatório" }),

  corporate_email: z.string().email({ message: "Email corporativo inválido" }),
  confirm_email: z.string().email({ message: "Confirmação de email inválida" }),
  password: z.string().min(6, { message: "Mínimo de 6 caracteres" }),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "As senhas não coincidem",
  path: ["confirm_password"],
}).refine((data) => data.corporate_email === data.confirm_email, {
  message: "Os emails não coincidem",
  path: ["confirm_email"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type ForgotFormValues = z.infer<typeof forgotPasswordSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, forgotPassword, isLoading: isAuthLoading } = useAuth();
  
  const [viewState, setViewState] = useState<"login" | "forgot">("login");
  const [activeTab, setActiveTab] = useState<string>((location.state as { tab?: string })?.tab || "login");
  const [isRecovering, setIsRecovering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      company_name: "", cnpj: "", phone: "",
      zip_code: "", state: "SP", city: "", address_street: "", address_number: "", district: "",
      corporate_email: "", confirm_email: "", password: "", confirm_password: ""
    },
  });

  const selectedState = signupForm.watch("state");

  useEffect(() => {
    if (!selectedState) return;

    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`
        );
        const data: IBGECityResponse[] = await response.json();
        const cityNames = data.map(city => city.nome).sort();
        setCities(cityNames);
        
        signupForm.setValue("city", ""); 
      } catch {
        toast.error("Erro ao carregar cidades", { description: "Tente novamente mais tarde." });
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedState, signupForm]);

  const forgotForm = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      toast.error("Erro no login", { description: error });
    } else {
      toast.success("Bem-vindo de volta!", { icon: <CheckCircle2 className="text-green-500" /> });
      navigate("/");
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    if (!turnstileToken) {
      toast.error("Segurança", { description: "Por favor, aguarde a verificação de segurança." });
      return;
    }

    const { error } = await signUp(data.corporate_email, data.password, data, turnstileToken);
    
    if (error) {
      toast.error("Erro no cadastro", { description: error });
      setTurnstileToken(""); 
    } else {
      toast.success("Conta criada com sucesso!", { icon: <CheckCircle2 className="text-green-500" /> });
      navigate("/");
    }
  };

  const onForgotSubmit = async (data: ForgotFormValues) => {
    setIsRecovering(true);
    const { error } = await forgotPassword(data.email);
    setIsRecovering(false);

    if (error) {
      toast.error("Não foi possível enviar", { description: error });
    } else {
      toast.success("Email enviado!", { description: "Verifique sua caixa de entrada para redefinir a senha." });
      setViewState("login");
      forgotForm.reset();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NavBar />
      
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-100/50 blur-3xl opacity-60" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl opacity-60" />
      </div>
      
      <div className="flex-1 container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="w-full max-w-lg">
          
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {activeTab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h1>
            <p className="text-slate-500">
              {activeTab === 'login' 
                ? 'Gerencie sua logística refrigerada com eficiência.' 
                : 'Junte-se à maior rede de armazenamento frio.'}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            
            <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-200/60 rounded-xl mb-8 h-auto">
              <TabsTrigger 
                value="login"
                onClick={() => setViewState("login")}
                className="rounded-lg text-sm font-medium transition-all py-2.5 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="rounded-lg text-sm font-medium transition-all py-2.5 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="focus-visible:outline-none animate-in fade-in zoom-in-95 duration-300">
                <Card className="border border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">
                    {viewState === "login" ? "Acesse sua conta" : "Recuperar acesso"}
                  </CardTitle>
                  <CardDescription>
                    {viewState === "login" 
                      ? "Insira seus dados abaixo para continuar." 
                      : "Enviaremos um link de recuperação para seu e-mail."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viewState === "login" ? (
                    <Form {...loginForm}>
                      <form key="login-form" onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="exemplo@empresa.com" 
                                  className="rounded-lg bg-slate-50 border-slate-200 focus:bg-white transition-all h-11" 
                                  {...field} 
                                  autoComplete="email" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-slate-700">Senha</FormLabel>
                                <button
                                    type="button"
                                    onClick={() => setViewState("forgot")}
                                    className="text-xs font-medium text-sky-600 hover:text-sky-700 hover:underline bg-transparent p-0 border-none outline-none transition-colors"
                                  >
                                    Esqueceu a senha?
                                </button>
                              </div>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Insira sua Senha" 
                                    {...field} 
                                    autoComplete="current-password" 
                                    className="pr-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white transition-all h-11"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors"
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                  >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold h-11 shadow-lg shadow-sky-600/20 hover:shadow-sky-600/30 transition-all" 
                          disabled={isAuthLoading}
                        >
                          {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar na Plataforma"}
                        </Button>
                      </form>
                    </Form>
                  ) : (
                    <Form {...forgotForm}>
                      <form key="forgot-form" onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4 animate-fade-in">
                        <FormField
                          control={forgotForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Corporativo</FormLabel>
                              <FormControl>
                                <Input placeholder="seu@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col gap-2">
                            <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white" disabled={isRecovering}>
                            {isRecovering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Link de Recuperação
                            </Button>
                            <Button 
                            variant="ghost" 
                            type="button" 
                            className="w-full"
                            onClick={() => setViewState("login")}
                            >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Login
                            </Button>
                        </div>
                      </form>
                    </Form>
                  )}

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="focus-visible:outline-none animate-in fade-in zoom-in-95 duration-300">
              <Card className="border border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-800">Dados da Empresa</CardTitle>
                  <CardDescription>Preencha as informações para cadastro.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={signupForm.control}
                          name="company_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa</FormLabel>
                              <FormControl><Input placeholder="Razão Social" className="rounded-lg bg-slate-50 border-slate-200 h-10" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                          <FormField
                          control={signupForm.control}
                          name="cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CNPJ</FormLabel>
                              <FormControl><Input placeholder="00.000.000/0000-00" className="rounded-lg bg-slate-50 border-slate-200 h-10" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={signupForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl><Input placeholder="(00) 00000-0000" className="rounded-lg bg-slate-50 border-slate-200 h-10" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-3 pt-2">
                        <h4 className="font-medium text-slate-500 uppercase tracking-wider text-xs">Endereço</h4>
                        
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-12 md:col-span-4">
                            <FormField
                              control={signupForm.control}
                              name="zip_code"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CEP</FormLabel>
                                  <FormControl><Input placeholder="00000-000" className="rounded-lg bg-slate-50 border-slate-200 h-10" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="col-span-12 md:col-span-3">
                            <FormField
                              control={signupForm.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>UF</FormLabel>
                                  <FormControl>
                                    <select 
                                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                      {...field}
                                    >
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
                              control={signupForm.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cidade</FormLabel>
                                  <FormControl>
                                    <select 
                                      className="flex h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

                         <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-12 md:col-span-8">
                             <FormField
                              control={signupForm.control}
                              name="address_street"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Logradouro</FormLabel>
                                  <FormControl><Input placeholder="Rua, Avenida..." className="rounded-lg bg-slate-50 border-slate-200 h-10" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="col-span-12 md:col-span-4">
                             <FormField
                              control={signupForm.control}
                              name="address_number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número</FormLabel>
                                  <FormControl><Input placeholder="123" className="rounded-lg bg-slate-50 border-slate-200 h-10" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1">
                           <FormField
                              control={signupForm.control}
                              name="district"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bairro</FormLabel>
                                  <FormControl><Input placeholder="Centro" className="rounded-lg bg-slate-50 border-slate-200 h-10" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 my-4" />

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={signupForm.control}
                          name="corporate_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Corporativo</FormLabel>
                              <FormControl><Input placeholder="contato@empresa.com" className="rounded-lg bg-slate-50 border-slate-200 h-10" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="confirm_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar Email</FormLabel>
                              <FormControl><Input placeholder="Repita o email" className="rounded-lg bg-slate-50 border-slate-200 h-10" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Insira sua Senha" 
                                    className="pr-10 rounded-lg bg-slate-50 border-slate-200 h-10"
                                    {...field} 
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                  >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="confirm_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar Senha</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Repita sua Senha" className="rounded-lg bg-slate-50 border-slate-200 h-10" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-center py-2">
                        <Turnstile 
                          siteKey="1x00000000000000000000AA"
                          onSuccess={(token) => setTurnstileToken(token)}
                          options={{ theme: 'light' }}
                        />
                      </div>

                      <Button type="submit" className="w-full rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold h-11 mt-4 shadow-lg shadow-sky-600/20" disabled={isAuthLoading || !turnstileToken}>
                        {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Finalizar Cadastro"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;