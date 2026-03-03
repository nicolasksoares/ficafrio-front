import { Outlet } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

export const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans antialiased">
      {/* NavBar fixa ou relativa */}
      <NavBar /> 
      
      {/* O flex-1 empurra o footer para baixo mesmo se houver pouco conteúdo */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};