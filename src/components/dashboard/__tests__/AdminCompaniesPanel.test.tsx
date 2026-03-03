import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminCompaniesPanel } from "../AdminCompaniesPanel";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminCompaniesPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar e listar empresas", async () => {
    const mockCompanies = [
      {
        id: 1,
        trade_name: "Empresa Teste",
        legal_name: "Empresa Teste Ltda",
        cnpj: "00.000.000/0001-00",
        type: "cliente",
        email: "empresa@teste.com",
        phone: "11999999999",
        city: "SP",
        state: "SP",
        active: true,
        created_at: "2025-01-01",
        spaces_count: 2,
        storage_requests_count: 1,
      },
    ];

    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: {
        data: mockCompanies,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 1,
      },
    });

    render(<AdminCompaniesPanel />);

    await waitFor(() => {
      expect(screen.getByText("Empresa Teste")).toBeInTheDocument();
      expect(screen.getByText("Empresa Teste Ltda")).toBeInTheDocument();
    });
  });

  it("deve exibir botão Ver propostas em cada empresa", async () => {
    const mockCompanies = [
      {
        id: 1,
        trade_name: "Empresa A",
        legal_name: "Empresa A Ltda",
        cnpj: "11.111.111/0001-11",
        type: "cliente",
        email: "a@a.com",
        phone: null,
        city: null,
        state: null,
        active: true,
        created_at: "2025-01-01",
        spaces_count: 0,
        storage_requests_count: 0,
      },
    ];

    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: {
        data: mockCompanies,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 1,
      },
    });

    render(<AdminCompaniesPanel />);

    await waitFor(() => {
      expect(screen.getByText("Empresa A")).toBeInTheDocument();
    });

    const verPropostasBtn = screen.getByRole("button", { name: /Ver propostas/i });
    expect(verPropostasBtn).toBeInTheDocument();
  });

  it("deve abrir sheet ao clicar em Ver propostas", async () => {
    const user = userEvent.setup();
    const mockCompanies = [
      {
        id: 1,
        trade_name: "Empresa B",
        legal_name: "Empresa B Ltda",
        cnpj: "22.222.222/0001-22",
        type: "cliente",
        email: "b@b.com",
        phone: null,
        city: null,
        state: null,
        active: true,
        created_at: "2025-01-01",
        spaces_count: 0,
        storage_requests_count: 0,
      },
    ];

    vi.spyOn(apiModule.default, "get")
      .mockResolvedValueOnce({
        data: {
          data: mockCompanies,
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 1,
        },
      })
      .mockResolvedValueOnce({
        data: { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 },
      });

    render(<AdminCompaniesPanel />);

    await waitFor(() => {
      expect(screen.getByText("Empresa B")).toBeInTheDocument();
    });

    const verPropostasBtn = screen.getByRole("button", { name: /Ver propostas/i });
    await user.click(verPropostasBtn);

    await waitFor(() => {
      expect(screen.getByText("Propostas da empresa")).toBeInTheDocument();
      expect(apiModule.default.get).toHaveBeenCalledWith("/admin/companies/1/quotes");
    });
  });
});
