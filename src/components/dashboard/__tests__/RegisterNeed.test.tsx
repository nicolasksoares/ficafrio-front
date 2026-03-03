import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterNeed } from "../RegisterNeed";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockToast = {
  toast: vi.fn(),
};

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => mockToast,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "123", name: "Empresa Teste" } }),
}));

// Mock do componente filho complexo MatchedSpaces
vi.mock("../MatchedSpaces", () => ({
  MatchedSpaces: ({ needTitle }: { needTitle: string }) => (
    <div data-testid="matched-spaces">Matches para {needTitle}</div>
  ),
}));

// Mock do Dialog para controlar o sucesso do cadastro
vi.mock("../NeedFormDialog", () => ({
  NeedFormDialog: ({ open, onSuccess }: { open: boolean; onSuccess: () => void }) =>
    open ? (
      <div role="dialog">
        <button onClick={onSuccess}>Simular Cadastro Sucesso</button>
      </div>
    ) : null,
}));

describe("RegisterNeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar e listar as demandas corretamente", async () => {
    const mockNeeds = [
      {
        id: "1",
        title: "Demanda Frango",
        product_type: "Frango Congelado",
        quantity: 100,
        unit: "pallets",
        target_city: "São Paulo",
        target_state: "SP",
        status: "active",
        temp_min: -20,
        temp_max: -10,
        start_date: "2024-01-01",
        end_date: "2024-02-01",
      },
      {
        id: "2",
        title: "Demanda Peixe",
        product_type: "Peixe Fresco",
        quantity: 50,
        unit: "pallets",
        target_city: "Santos",
        target_state: "SP",
        status: "closed",
        temp_min: 0,
        temp_max: 5,
        start_date: "2024-03-01",
        end_date: "2024-03-31",
      },
    ];

    const getSpy = vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: mockNeeds },
    });

    render(<RegisterNeed />);

    await waitFor(() => expect(getSpy).toHaveBeenCalledWith("/storage-requests"));
    await waitFor(
      () => {
        expect(screen.getAllByText(/Demanda Frango/).length).toBeGreaterThan(0);
        expect(screen.getByText(/Frango Congelado/)).toBeInTheDocument();
        expect(screen.getByText(/São Paulo/)).toBeInTheDocument();
        expect(screen.getAllByText(/Demanda Peixe/).length).toBeGreaterThan(0);
        expect(screen.getByText(/Santos/)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  }, 8000);

  it("deve exibir MatchedSpaces para todas as demandas listadas", async () => {
    const mockNeeds = [
      {
        id: "1",
        title: "Demanda Ativa",
        product_type: "Teste",
        quantity: 10,
        unit: "pallets",
        target_city: "SP",
        target_state: "SP",
        status: "active",
        temp_min: 0,
        temp_max: 5,
        start_date: "2024-01-01",
        end_date: "2024-01-31",
      },
      {
        id: "2",
        title: "Demanda Inativa",
        product_type: "Teste",
        quantity: 10,
        unit: "pallets",
        target_city: "SP",
        target_state: "SP",
        status: "closed",
        temp_min: 0,
        temp_max: 5,
        start_date: "2024-01-01",
        end_date: "2024-01-31",
      },
    ];

    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: mockNeeds },
    });

    render(<RegisterNeed />);

    await waitFor(() => {
      expect(screen.getByText("Matches para Demanda Ativa")).toBeInTheDocument();
      expect(screen.getByText("Matches para Demanda Inativa")).toBeInTheDocument();
    });
  });

  it("deve recarregar a lista ao cadastrar uma demanda com sucesso", async () => {
    const user = userEvent.setup();
    const getSpy = vi.spyOn(apiModule.default, "get").mockResolvedValue({ data: [] });

    render(<RegisterNeed />);

    // 1. Verifica carga inicial
    await waitFor(() => expect(getSpy).toHaveBeenCalled());
    getSpy.mockClear();

    // 2. Clica no card de adicionar
    await user.click(screen.getByText("Solicitar Novo Armazenamento"));

    // 3. Simula o sucesso do formulário
    await user.click(screen.getByText("Simular Cadastro Sucesso"));

    // 4. Verifica recarga e toast
    await waitFor(() => {
      expect(getSpy).toHaveBeenCalled();
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Demanda cadastrada!",
          description: "Estamos buscando parceiros compatíveis para sua carga.",
        })
      );
    });
  });

  it("deve exibir toast de erro se falhar ao carregar demandas", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(apiModule.default, "get").mockRejectedValue(new Error("Erro API"));

    render(<RegisterNeed />);

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Erro",
          variant: "destructive",
        })
      );
    });

    consoleSpy.mockRestore();
  });
});
