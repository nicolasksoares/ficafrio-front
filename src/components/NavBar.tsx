import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@/assets/ficafrio-logo.png";
import { Menu, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface NavBarProps {
  menuItems?: Array<{ id: string; label: string; icon: LucideIcon | React.ElementType }>;
  activeSection?: string;
  onSelectSection?: (section: string) => void;
}

export function NavBar({ menuItems, activeSection, onSelectSection }: NavBarProps) {
  const { user, signOut, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // DEBUG: Veja no console do navegador se o user está chegando
  useEffect(() => {
    console.log("Estado do Usuário na NavBar:", user);
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isDashboard = Boolean(menuItems);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Esquerda: Logo e Menu Mobile */}
        <div className="flex items-center gap-2">
          {isDashboard && (
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 pt-8 w-64 bg-white">
                  <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                  <nav className="p-2 space-y-1">
                    {menuItems?.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant={activeSection === item.id ? "default" : "ghost"}
                          className={`w-full justify-start gap-3 ${activeSection === item.id ? 'bg-sky-500 text-white hover:bg-sky-600' : 'text-foreground hover:bg-sky-50 hover:text-sky-600'}`}
                          onClick={() => {
                            if (onSelectSection) onSelectSection(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span>{item.label}</span>
                        </Button>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          )}

          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logoImage} alt="FicaFrio Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold text-sky-600">FicaFrio</span>
          </Link>
        </div>

        {/* Centro: Links de Navegação (some se for Dashboard) */}
        {!isDashboard && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className={`transition-colors hover:text-sky-500 ${pathname === "/" ? "text-sky-600" : "text-gray-600"}`}>
              Início
            </Link>
            <Link to="/buscar" className={`transition-colors hover:text-sky-500 ${pathname === "/buscar" ? "text-sky-600" : "text-gray-600"}`}>
              Buscar Espaços
            </Link>
            <Link to="/sobre" className={`transition-colors hover:text-sky-500 ${pathname === "/sobre" ? "text-sky-600" : "text-gray-600"}`}>
              Sobre nós
            </Link>
            <Link to="/suporte" className={`transition-colors hover:text-sky-500 ${pathname === "/suporte" ? "text-sky-600" : "text-gray-600"}`}>
              Suporte
            </Link>
          </div>
        )}

        {/* Direita: Auth Buttons (AQUI É ONDE VOCÊ QUER MEXER) */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 bg-gray-100" />
              <Skeleton className="h-9 w-24 bg-gray-100" />
            </div>
          ) : (
            <>
              {/* Se USER existe, mostra Dashboard e Logout */}
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button className="bg-sky-500 text-white hover:bg-sky-600 font-semibold shadow-sm h-9">
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleLogout} 
                    variant="ghost" 
                    className="text-gray-600 hover:text-red-500 h-9"
                  >
                    Sair
                  </Button>
                </>
              ) : (
                /* Se USER NÃO existe, mostra Login e Cadastro */
                <>
                  <Link to="/auth">
                    <Button variant="ghost" className="text-gray-600 hover:text-sky-600 font-medium h-9">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth" state={{ tab: 'signup' }}>
                    <Button className="bg-sky-500 text-white hover:bg-sky-600 font-semibold shadow-sm h-9">
                      Cadastrar Empresa
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}