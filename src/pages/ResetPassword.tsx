import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { NavBar } from "@/components/NavBar";

const resetSchema = z.object({
  password: z.string().min(6, { message: "Mínimo de 6 caracteres" }),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "As senhas não coincidem",
  path: ["password_confirmation"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Pega o token e o email da URL (o Laravel manda assim: ?token=xyz&email=abc)
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = async (data: ResetFormValues) => {
    if (!token || !email) {
      toast.error("Link inválido ou expirado.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/reset-password", {
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      toast.success("Senha alterada com sucesso!", {
        description: "Faça login com sua nova senha.",
      });
      navigate("/auth");
    } catch (error) {
        // CORREÇÃO: Removido ': any'. O interceptor já trata o erro visualmente.
        console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full text-center p-6">
                <h2 className="text-xl font-bold text-red-500 mb-2">Link Inválido</h2>
                <p className="text-slate-600 mb-4">Faltam informações de segurança no link de recuperação.</p>
                <Button onClick={() => navigate('/auth')}>Voltar para Login</Button>
            </Card>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NavBar />
      <div className="flex-1 container mx-auto px-4 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl shadow-sky-100 border-none rounded-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-sky-600" />
            </div>
            <CardTitle className="text-xl text-slate-800">Redefinir Senha</CardTitle>
            <CardDescription>
              Crie uma nova senha para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                className="pr-10 rounded-lg bg-slate-50 border-slate-200 h-11" 
                                {...field} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="rounded-lg bg-slate-50 border-slate-200 h-11" 
                            {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                    type="submit" 
                    className="w-full rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold h-11 shadow-lg shadow-sky-200"
                    disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Alterar Senha"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;