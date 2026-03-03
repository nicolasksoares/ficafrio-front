import { NavBar } from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  Leaf,
  Lightbulb,
  Shield,
  Users,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Sprout,
  ArrowRight,
  Snowflake,
} from "lucide-react";

const Sobre = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      <main className="pt-16">
        {/* Hero Section - Modernizado com gradiente sutil */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-linear-to-br from-sky-50 via-white to-purple-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.08),transparent_50%)]" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 border border-sky-200 mb-8 animate-fade-in">
                <Snowflake className="w-4 h-4 text-sky-600" />
                <span className="text-sm font-medium text-sky-700">
                  Inovação em Armazenamento Refrigerado
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                Transformamos o frio em{" "}
                <span className="bg-linear-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
                  oportunidade
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
                Conectamos empresas com espaço refrigerado ocioso a quem precisa armazenar produtos com segurança e
                eficiência.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/buscar">
                  <Button size="lg" className="group bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/20 h-14 px-8 text-lg rounded-xl">
                    Conheça nossa plataforma
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth" state={{ tab: 'signup' }}>
                  <Button size="lg" variant="outline" className="border-2 h-14 px-8 text-lg rounded-xl bg-white hover:bg-slate-50 text-slate-700">
                    Seja parceiro FicaFrio
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Elemento decorativo rodapé do hero */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
        </section>

        {/* Quem Somos - Layout aprimorado */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Quem Somos</h2>
                <div className="w-24 h-1.5 bg-linear-to-r from-sky-600 to-purple-600 mx-auto rounded-full" />
              </div>

              <div className="grid gap-8">
                <Card className="backdrop-blur-sm bg-white border-l-4 border-l-sky-600 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 sm:p-10">
                    <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                      A <span className="font-bold text-slate-900">FicaFrio</span> nasceu da percepção
                      de um problema crítico na cadeia logística brasileira: milhares de metros cúbicos de capacidade
                      refrigerada ficam ociosos enquanto empresas enfrentam dificuldades para encontrar espaço adequado
                      para armazenar seus produtos.
                    </p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white border-l-4 border-l-purple-600 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 sm:p-10">
                    <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                      Esse desperdício não afeta apenas a eficiência operacional — ele representa energia desperdiçada,
                      custos elevados e oportunidades perdidas. Acreditamos que{" "}
                      <span className="font-bold text-slate-900">
                        conectar quem tem espaço a quem precisa
                      </span>{" "}
                      é mais do que um modelo de negócio: é uma contribuição para uma cadeia do frio mais sustentável e
                      acessível.
                    </p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white border-l-4 border-l-blue-600 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 sm:p-10">
                    <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
                      Nossa plataforma transforma o armazenamento refrigerado em uma{" "}
                      <span className="font-bold text-slate-900">rede colaborativa</span>, onde
                      transparência, rastreabilidade e tecnologia garantem segurança para todos os envolvidos.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Missão e Visão - Design modernizado */}
        <section className="py-24 sm:py-32 bg-linear-to-b from-white to-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 mb-24">
                <Card className="relative overflow-hidden group border-none shadow-md hover:shadow-2xl transition-all duration-300 bg-white">
                  <div className="absolute inset-0 bg-linear-to-br from-sky-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-10 relative z-10">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-sky-100 ring-4 ring-sky-50">
                        <Target className="w-8 h-8 text-sky-600" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">Nossa Missão</h3>
                        <div className="w-16 h-1 bg-sky-600 rounded-full" />
                      </div>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Tornar o armazenamento refrigerado mais{" "}
                      <span className="font-bold text-slate-900">
                        acessível, sustentável e inteligente
                      </span>
                      , otimizando recursos e reduzindo desperdícios.
                    </p>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden group border-none shadow-md hover:shadow-2xl transition-all duration-300 bg-white">
                  <div className="absolute inset-0 bg-linear-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-10 relative z-10">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-purple-100 ring-4 ring-purple-50">
                        <Eye className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">Nossa Visão</h3>
                        <div className="w-16 h-1 bg-purple-600 rounded-full" />
                      </div>
                    </div>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Ser a principal plataforma de compartilhamento de capacidade refrigerada da{" "}
                      <span className="font-bold text-slate-900">América Latina</span>, promovendo
                      logística eficiente e sustentável.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Valores */}
              <div className="text-center mb-16">
                <h3 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Nossos Valores</h3>
                <div className="w-24 h-1.5 bg-linear-to-r from-sky-600 to-purple-600 mx-auto rounded-full mb-6" />
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Princípios que guiam cada decisão e ação da FicaFrio
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Leaf,
                    title: "Sustentabilidade",
                    desc: "Usar recursos com responsabilidade e reduzir desperdícios na cadeia do frio.",
                    colorClass: "bg-green-100",
                    iconColorClass: "text-green-600",
                  },
                  {
                    icon: Lightbulb,
                    title: "Inovação",
                    desc: "Aplicar tecnologia de ponta para transformar a logística refrigerada.",
                    colorClass: "bg-blue-100",
                    iconColorClass: "text-blue-600",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Transparência",
                    desc: "Garantir rastreabilidade completa e confiança em cada operação.",
                    colorClass: "bg-sky-100",
                    iconColorClass: "text-sky-600",
                  },
                  {
                    icon: Users,
                    title: "Colaboração",
                    desc: "Unir produtores, distribuidores e armazenadores em uma rede eficiente.",
                    colorClass: "bg-purple-100",
                    iconColorClass: "text-purple-600",
                  },
                  {
                    icon: Snowflake,
                    title: "Qualidade",
                    desc: "Preservar a integridade dos produtos com padrões técnicos rigorosos.",
                    colorClass: "bg-cyan-100",
                    iconColorClass: "text-cyan-600",
                  },
                  {
                    icon: Shield,
                    title: "Segurança",
                    desc: "Proteger dados, produtos e operações com os mais altos padrões.",
                    colorClass: "bg-red-100",
                    iconColorClass: "text-red-600",
                  },
                ].map((value, idx) => (
                  <Card key={idx} className="group border-slate-200 hover:border-sky-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="p-8 text-center">
                      <div
                        className={`inline-flex p-5 rounded-2xl ${value.colorClass} mb-6 group-hover:scale-110 transition-transform`}
                      >
                        <value.icon className={`w-10 h-10 ${value.iconColorClass}`} />
                      </div>
                      <h4 className="font-bold text-slate-900 mb-3 text-xl">{value.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{value.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nosso Impacto */}
        <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(14,165,233,0.05),transparent_70%)]" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Nosso Impacto</h2>
                <div className="w-24 h-1.5 bg-linear-to-r from-sky-600 to-purple-600 mx-auto rounded-full mb-6" />
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Cada conexão feita pela FicaFrio gera impacto positivo na cadeia logística e no meio ambiente
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: TrendingDown,
                    title: "Redução de Desperdício",
                    desc: "Aproveitamento inteligente de espaços refrigerados ociosos, reduzindo desperdício de alimentos e energia.",
                    colorClass: "bg-green-100",
                    iconColorClass: "text-green-600",
                    ringClass: "ring-green-50",
                  },
                  {
                    icon: DollarSign,
                    title: "Geração de Receita",
                    desc: "Transformamos capacidade ociosa em fonte de renda para empresas parceiras.",
                    colorClass: "bg-blue-100",
                    iconColorClass: "text-blue-600",
                    ringClass: "ring-blue-50",
                  },
                  {
                    icon: Sprout,
                    title: "Menor Pegada de Carbono",
                    desc: "Otimização logística que reduz emissões e promove uma cadeia do frio mais sustentável.",
                    colorClass: "bg-emerald-100",
                    iconColorClass: "text-emerald-600",
                    ringClass: "ring-emerald-50",
                  },
                ].map((impact, idx) => (
                  <Card key={idx} className="text-center relative overflow-hidden group border-none shadow-md hover:shadow-xl transition-all">
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-sky-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-10 relative z-10">
                      <div
                        className={`inline-flex p-6 rounded-3xl ${impact.colorClass} mb-6 ring-4 ${impact.ringClass} group-hover:scale-110 transition-transform`}
                      >
                        <impact.icon className={`w-12 h-12 ${impact.iconColorClass}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">{impact.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{impact.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Equipe */}
        <section className="py-24 sm:py-32 bg-linear-to-b from-white to-slate-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Nossa Equipe</h2>
                <div className="w-24 h-1.5 bg-linear-to-r from-sky-600 to-purple-600 mx-auto rounded-full" />
              </div>

              <Card className="relative overflow-hidden border-none shadow-lg bg-white hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-linear-to-br from-sky-50 via-transparent to-purple-50" />
                <CardContent className="p-10 sm:p-14 relative z-10">
                  <div className="text-center space-y-8">
                    <div className="inline-flex p-8 rounded-3xl bg-linear-to-br from-sky-100 to-purple-100 ring-8 ring-sky-50">
                      <Heart className="w-16 h-16 text-sky-600" />
                    </div>
                    <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed">
                      A FicaFrio nasceu da união entre a{" "}
                      <span className="font-bold text-slate-900">inovação tecnológica</span> e a
                      experiência no setor de{" "}
                      <span className="font-bold text-slate-900">
                        alimentos orgânicos e logística refrigerada
                      </span>.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
                      Nossa equipe multidisciplinar combina expertise em tecnologia, logística, sustentabilidade e
                      gestão para criar soluções que transformam desafios em oportunidades.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 sm:py-32 relative overflow-hidden bg-slate-50">
          <div className="absolute inset-0 bg-linear-to-br from-sky-50 via-white to-purple-50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_70%)]" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Junte-se à revolução da cadeia do frio
              </h2>
              <p className="text-xl sm:text-2xl text-slate-600 mb-10 leading-relaxed">
                FicaFrio — conectando eficiência, sustentabilidade e tecnologia
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/auth" state={{ tab: 'signup' }}>
                  <Button size="lg" className="group bg-sky-600 hover:bg-sky-700 text-white shadow-xl shadow-sky-600/20 h-14 px-8 text-lg rounded-xl">
                    Quero ser parceiro
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/suporte">
                  <Button size="lg" variant="outline" className="border-2 h-14 px-8 text-lg rounded-xl bg-white hover:bg-slate-50 text-slate-700">
                    Entre em contato
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Sobre;