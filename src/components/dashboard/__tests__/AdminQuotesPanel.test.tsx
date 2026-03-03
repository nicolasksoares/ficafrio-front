import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminQuotesPanel } from "../AdminQuotesPanel";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1, type: "admin" } }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("AdminQuotesPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve exibir abas Pendentes, Aprovadas e Rejeitadas", () => {
    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, from: null, to: null },
    });

    render(<AdminQuotesPanel />);

    expect(screen.getByRole("tab", { name: /Pendentes/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Aprovadas/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Rejeitadas/i })).toBeInTheDocument();
  });

  it("deve carregar e listar propostas pendentes", async () => {
    const mockQuotes = [
      {
        id: 1,
        status: "em_analise_admin",
        price: 1500,
        valid_until: "2025-12-31",
        is_expired: false,
        created_at: "2025-01-01",
        storage_request: {
          id: 1,
          quantity: 100,
          demandante: { trade_name: "Cliente A" },
        },
        space: {
          id: 1,
          name: "Camara A",
          city: "SP",
          state: "SP",
          ofertante: { trade_name: "Parceiro B" },
        },
      },
    ];

    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: {
        data: mockQuotes,
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
        from: 1,
        to: 1,
      },
    });

    render(<AdminQuotesPanel />);

    await waitFor(() => {
      expect(screen.getByText("Camara A")).toBeInTheDocument();
      expect(screen.getByText("Cliente A")).toBeInTheDocument();
    });
  });
});
