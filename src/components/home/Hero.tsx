import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-cold-storage.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  const handleSearch = () => {
    navigate('/buscar');
  };

  return (
    // Removida animação e blur. Apenas um container flex simples.
    <div className="relative min-h-[650px] flex items-center justify-center bg-slate-900 overflow-hidden">
      
      {/* 1. Imagem de Fundo (ESTÁTICA = Performance Máxima) */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay escuro simples para contraste (sem blur) */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* 2. Conteúdo Centralizado */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        
        {/* Badge simples estático */}
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-8 border border-white/10">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm font-medium text-white tracking-wide">Solução logística inteligente</span>
        </div>

        {/* Título Limpo */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto">
          Encontramos a melhor solução logística para a sua empresa
        </h1>
        
        {/* Subtítulo */}
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Conectamos você aos melhores espaços de armazenamento com tecnologia, segurança e eficiência.
        </p>

        {/* Botões (Sem animações complexas) */}
        {!isLoading && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            
            {!user ? (
              <Button 
                size="lg" 
                className="bg-white text-sky-700 hover:bg-gray-100 text-lg px-8 py-6 h-auto font-bold rounded-full transition-colors"
                onClick={() => navigate('/auth', { state: { tab: 'signup' } })}
              >
                Cadastrar minha empresa
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <Button 
                size="lg"
                className="bg-sky-600 hover:bg-sky-700 text-white text-lg px-8 py-6 h-auto font-bold rounded-full transition-colors"
                onClick={handleSearch}
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar seu Espaço
              </Button>
            )}
          </div>
        )}

        {/* Cards de Benefícios (Estáticos e Leves) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto text-left">
          {[
            { title: "Resultados Precisos", desc: "Encontre o espaço ideal em segundos" },
            { title: "Processo Rápido", desc: "Contrate e opere em poucos cliques" },
            { title: "Seguro e Confiável", desc: "Parceiros 100% verificados" },
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className="bg-white/5 rounded-xl p-5 border border-white/10"
            >
              <h3 className="font-bold text-lg mb-1 text-white">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};