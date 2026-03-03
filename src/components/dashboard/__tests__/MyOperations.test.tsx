import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyOperations } from "../MyOperations";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockToastFn = vi.fn();
const stableToastReturn = { toast: mockToastFn };

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => stableToastReturn,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1, name: "Test User" } }),
}));

describe("MyOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar e listar espaços e demandas corretamente", async () => {
    const user = userEvent.setup();
    
    const mockSpaces = [
      { id: 1, name: "Galpão Alpha", city: "São Paulo", state: "SP", type: "Refrigerado", capacity: 100, active: true, created_at: "2024-01-01" }
    ];
    const mockNeeds = [
      { id: 1, product_type: "Carnes", quantity: 500, status: "Pendente", created_at: "2024-01-02" }
    ];

    vi.spyOn(apiModule.default, "get").mockImplementation((url) => {
      if (url === "/spaces") return Promise.resolve({ data: { data: mockSpaces } });
      if (url === "/storage-requests") return Promise.resolve({ data: { data: mockNeeds } });
      return Promise.reject(new Error("Not found"));
    });

    render(<MyOperations />);

    await waitFor(() => {
        expect(screen.queryByText("Carregando operações...")).not.toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText("Minhas Operações")).toBeInTheDocument();

    expect(screen.getByText("Galpão Alpha")).toBeInTheDocument();
    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument();

    const demandsTab = screen.getByRole("tab", { name: /Demandas/i });
    await user.click(demandsTab);

    expect(await screen.findByText("Carnes")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("deve exibir estados vazios quando não houver dados", async () => {
    const user = userEvent.setup();
    vi.spyOn(apiModule.default, "get").mockResolvedValue({ data: { data: [] } });

    render(<MyOperations />);

    await waitFor(() => {
        expect(screen.queryByText("Carregando operações...")).not.toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText("Nenhum espaço cadastrado")).toBeInTheDocument();
    
    const demandsTab = screen.getByRole("tab", { name: /Demandas/i });
    await user.click(demandsTab);

    expect(await screen.findByText("Nenhuma demanda cadastrada")).toBeInTheDocument();
  });

  it("deve exibir toast de erro se a API falhar", async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.spyOn(apiModule.default, "get").mockRejectedValue(new Error("Erro API"));

    render(<MyOperations />);

    await waitFor(() => {
      expect(mockToastFn).toHaveBeenCalledWith(expect.objectContaining({
        title: "Erro",
        variant: "destructive"
      }));
    });
    
    consoleSpy.mockRestore();
  });
});