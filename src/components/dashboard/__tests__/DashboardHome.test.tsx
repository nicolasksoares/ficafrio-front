import { render, screen, waitFor } from "@testing-library/react";
import { DashboardHome } from "../DashboardHome";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockUseAuth = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

describe("DashboardHome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar os indicadores e exibir o nome da empresa do usuário corretamente", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, trade_name: "Transportadora Rápida", email: "teste@rapida.com" }
    });

    const getSpy = vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: {
        mode: 'user',
        totalSpaces: 5,
        totalRequests: 2
      }
    });

    render(<DashboardHome />);

    expect(screen.getByText("Carregando indicadores...")).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText("Olá, Transportadora Rápida")).toBeInTheDocument();
    });

    expect(screen.getByText("Meus Espaços")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(getSpy).toHaveBeenCalledWith("/dashboard/stats");
  });

  it("deve exibir a visão administrativa quando o backend retornar mode: admin", async () => {
    mockUseAuth.mockReturnValue({
        user: { id: 99, trade_name: "Admin Master", email: "admin@ficafrio.com" }
    });

    vi.spyOn(apiModule.default, "get").mockResolvedValue({
        data: {
          mode: 'admin',
          totalCompanies: 50,
          pendingSpaces: 3
        }
    });

    render(<DashboardHome />);

    await waitFor(() => {
        expect(screen.getByText("Visão da Plataforma")).toBeInTheDocument();
        expect(screen.getByText("Área Administrativa")).toBeInTheDocument();
    });

    expect(screen.getByText("Empresas Cadastradas")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });
});