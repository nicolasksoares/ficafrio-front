import { Linkedin, Instagram, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../assets/ficafrio-logo.png";
import React from "react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Coluna 1: Marca e Sobre */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <img 
                src={logoImage || "/placeholder.svg"} 
                alt="FicaFrio Logo" 
                className="w-10 h-10 object-contain group-hover:opacity-90 transition-opacity" 
              />
              <span className="text-xl font-bold text-sky-600">FicaFrio</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Conectando eficiência, sustentabilidade e tecnologia para transformar a logística refrigerada no Brasil.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialLink href="https://linkedin.com" icon={Linkedin} label="LinkedIn" />
              <SocialLink href="https://instagram.com" icon={Instagram} label="Instagram" />
              <SocialLink href="https://wa.me/5511993693710" icon={MessageCircle} label="WhatsApp" />
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Plataforma</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/" label="Início" />
              <FooterLink to="/buscar" label="Buscar Espaços" />
              <FooterLink to="/auth?tab=signup" label="Cadastrar Espaço" />
              <FooterLink to="/dashboard" label="Minha Conta" />
            </ul>
          </div>

          {/* Coluna 3: Institucional e Suporte */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Empresa</h3>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/sobre" label="Sobre Nós" />
              <FooterLink to="/suporte" label="Central de Ajuda" />
              <FooterLink to="/termos" label="Termos de Uso" />
              <FooterLink to="/privacidade" label="Política de Privacidade" />
            </ul>
          </div>

          {/* Coluna 4: Contato e Newsletter */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Fale Conosco</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2 hover:text-sky-600 transition-colors">
                  <Mail className="w-4 h-4 text-sky-500" />
                  <a href="mailto:contato@ficafrioltda.com">contato@ficafrioltda.com</a>
                </li>
                <li className="flex items-center gap-2 hover:text-sky-600 transition-colors">
                  <Phone className="w-4 h-4 text-sky-500" />
                  <a href="tel:+5511993693710">(11) 99369-3710</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-sky-500 mt-0.5" />
                  <span>São Paulo – SP, Brasil</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2025 FicaFrio Tecnologia e Logística Ltda. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sistemas Operacionais
            </span>
            <p>Desenvolvido com 💙 em SP</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

const FooterLink = ({ to, label }: { to: string; label: string }) => (
  <li>
    <Link to={to} className="text-muted-foreground hover:text-sky-600 hover:pl-1 transition-all duration-200 block">
      {label}
    </Link>
  </li>
);

const SocialLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-sky-100 hover:text-sky-600 transition-colors"
    aria-label={label}
  >
    <Icon className="w-4 h-4" />
  </a>
);