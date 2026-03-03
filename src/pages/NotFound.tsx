import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">Página não encontrada</p>
      <Button onClick={() => navigate("/")}>Voltar para o Início</Button>
    </div>
  );
};

export default NotFound;