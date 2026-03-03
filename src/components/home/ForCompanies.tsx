import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Users, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ForCompanies = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Hook de autenticação

  const solutions = [
    {
      icon: Building,
      title: "Anfitriões",
      subtitle: "Monetize sua capacidade",
      description: "Transforme espaço vazio em receita recorrente sem investimento adicional.",
      benefits: [
        "Aumente sua receita sem investimento adicional",
        "Gestão simplificada de contratos e pagamentos",
        "Alcance empresas de todo o Brasil",
      ],
      // Lógica Condicional: Se logado -> Dashboard. Se não -> Cadastro.
      buttonText: user ? "Gerenciar Meus Espaços" : "Cadastrar Espaço",
      action: () => user ? navigate('/dashboard') : navigate('/auth', { state: { tab: 'signup' } }),
      gradient: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50"
    },
    {
      icon: Users,
      title: "Clientes",
      subtitle: "Acesse câmaras frias sob demanda",
      description: "Flexibilidade total para sua logística com espaços por período e localização.",
      benefits: [
        "Reduza custos operacionais com espaços sob demanda",
        "Escolha localização estratégica para sua logística",
        "Flexibilidade de contrato conforme sua necessidade",
      ],
      // Buscar é útil para logado e deslogado
      buttonText: "Encontrar Espaços",
      action: () => navigate('/buscar'),
      gradient: "from-sky-500 to-blue-500",
      iconColor: "text-sky-600",
      iconBg: "bg-sky-50"
    },
  ];

  return (
    <section className="py-24 bg-linear-to-b from-white to-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6 border border-blue-100">
            Soluções
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Para Sua Empresa
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Soluções personalizadas para tornar sua empresa mais eficiente, maximizar seu capital ocioso e otimizar sua logística refrigerada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {solutions.map((solution, index) => (
            <Card
              key={index}
              className="group border border-slate-200 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden bg-white"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r ${solution.gradient}`} />

              <CardContent className="p-8 md:p-10 flex flex-col h-full">
                <div className="mb-8">
                  <div
                    className={`w-20 h-20 rounded-2xl ${solution.iconBg} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`}
                  >
                    <solution.icon className={`w-10 h-10 ${solution.iconColor}`} />
                  </div>

                  <h3 className="text-3xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {solution.title}
                  </h3>
                  
                  <p className={`text-lg font-semibold bg-linear-to-r ${solution.gradient} bg-clip-text text-transparent mb-4`}>
                    {solution.subtitle}
                  </p>

                  <p className="text-slate-600 leading-relaxed text-base">
                    {solution.description}
                  </p>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {solution.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3 group/item">
                      <div className={`mt-1 shrink-0 w-5 h-5 rounded-full bg-linear-to-r ${solution.gradient} flex items-center justify-center`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-slate-700 text-sm leading-relaxed group-hover/item:text-slate-900 transition-colors">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={solution.action}
                  className={`w-full bg-linear-to-r ${solution.gradient} text-white border-0 hover:opacity-90 hover:shadow-lg transition-all duration-300 h-14 text-lg font-bold rounded-xl shadow-md mt-auto`}
                >
                  {solution.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};