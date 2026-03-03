import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Search, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const HowItWorks = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Hook para verificar autenticação

  const steps = [
    {
      icon: Building2,
      title: user ? "Empresa Cadastrada" : "Cadastre sua empresa", // Texto adaptativo
      description: user 
        ? "Sua empresa já faz parte da nossa rede. Acesse seu painel para gerenciar."
        : "Registre sua empresa de forma simples. Comece em poucos minutos.",
      buttonText: user ? "Acessar Painel" : "Cadastrar agora",
      action: () => user ? navigate('/dashboard') : navigate('/auth', { state: { tab: 'signup' } }),
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-50 text-blue-600"
    },
    {
      icon: Search,
      title: "Busque ou registre",
      description: "Encontre espaços disponíveis ou anuncie sua capacidade ociosa.",
      buttonText: "Encontre espaços",
      action: () => navigate('/buscar'), // Ação útil para todos
      gradient: "from-sky-500 to-blue-500",
      iconBg: "bg-sky-50 text-sky-600"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Contratos digitais e pagamento seguro. Toda transação é protegida.",
      buttonText: "Saiba mais",
      action: () => navigate('/sobre'),
      gradient: "from-cyan-500 to-teal-500",
      iconBg: "bg-cyan-50 text-cyan-600"
    },
  ];

  return (
    <section className="py-24 bg-linear-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6 border border-blue-100">
            Como Funciona
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Simples e Eficiente
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Conecte sua empresa ao marketplace de câmaras frias em três passos simples.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="group border border-slate-200 hover:border-blue-200/60 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden bg-white"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r ${step.gradient}`} />

              <CardContent className="pt-10 pb-8 px-8 text-center flex flex-col h-full">
                <div className="relative mb-8">
                  <div
                    className={`w-24 h-24 rounded-3xl ${step.iconBg} flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform duration-500`}
                  >
                    <step.icon className="w-10 h-10" />
                  </div>
                  
                  <div className="absolute -top-2 -right-2 md:right-12 w-8 h-8 bg-white border border-slate-100 rounded-full shadow-md flex items-center justify-center text-slate-700 font-bold text-sm z-20">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-blue-700 transition-colors">
                  {step.title}
                </h3>

                <p className="text-slate-500 mb-8 flex-1 leading-relaxed text-base">
                  {step.description}
                </p>

                <Button
                  onClick={step.action}
                  className={`w-full bg-linear-to-r ${step.gradient} text-white border-0 hover:opacity-90 hover:shadow-lg transition-all duration-300 h-12 text-base font-medium rounded-xl shadow-md`}
                >
                  {step.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};