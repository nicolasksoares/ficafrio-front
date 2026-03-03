import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyProposals } from "../MyProposals";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockToast = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1 } }),
}));

describe("MyProposals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar propostas corretamente", async () => {
    const mockProposals = [
      {
        id: 1,
        status: "Respondido",
        created_at: "2024-01-01",
        space: { name: "Galpão Z", city: "Rio de Janeiro" },
        storage_request: { product_type: "Peixes" }
      }
    ];

    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: mockProposals }
    });

    render(<MyProposals />);

    expect(screen.getByText("Carregando propostas...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Galpão Z")).toBeInTheDocument();
      expect(screen.getByText("Rio de Janeiro")).toBeInTheDocument();
      expect(screen.getByText("Peixes")).toBeInTheDocument();
      expect(screen.getByText("Respondido")).toBeInTheDocument();
    });
  });

  it("deve permitir aceitar uma proposta", async () => {
    const user = userEvent.setup();
    const mockProposals = [
      {
        id: 1,
        status: "Respondido",
        created_at: "2024-01-01",
        space: { name: "Galpão Aceitar", city: "SP" },
        storage_request: { product_type: "Geral" }
      }
    ];

    vi.spyOn(apiModule.default, "get").mockResolvedValue({ data: { data: mockProposals } });
    const putSpy = vi.spyOn(apiModule.default, "put").mockResolvedValue({});

    render(<MyProposals />);

    const acceptBtn = await screen.findByRole("button", { name: /Aceitar/i });
    await user.click(acceptBtn);

    expect(putSpy).toHaveBeenCalledWith("/quotes/1", { status: "Aceito" });
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Sucesso"
      }));
    });
  });

  it("não deve mostrar botões de ação se a proposta já estiver aceita", async () => {
    const mockProposals = [
      {
        id: 2,
        status: "Aceito",
        created_at: "2024-01-01",
        space: { name: "Galpão Fechado", city: "SP" },
        storage_request: { product_type: "Geral" }
      }
    ];

    vi.spyOn(apiModule.default, "get").mockResolvedValue({ data: { data: mockProposals } });

    render(<MyProposals />);

    await waitFor(() => {
      expect(screen.getByText("Proposta aceita! O fornecedor foi notificado.")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /Aceitar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Rejeitar/i })).not.toBeInTheDocument();
  });
});