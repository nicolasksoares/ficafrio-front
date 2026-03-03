import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchSpaces } from "../SearchSpaces";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Polyfills para Radix UI
// @ts-expect-error - Mocking ResizeObserver for JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

window.HTMLElement.prototype.scrollIntoView = vi.fn();
Object.defineProperty(window.HTMLElement.prototype, "hasPointerCapture", {
  writable: true,
  value: () => false,
});
Object.defineProperty(window.HTMLElement.prototype, "setPointerCapture", {
  writable: true,
  value: () => {},
});
Object.defineProperty(window.HTMLElement.prototype, "releasePointerCapture", {
  writable: true,
  value: () => {},
});

describe("SearchSpaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSpaces = [
    {
      id: "1",
      name: "Galpão A",
      city: "São Paulo",
      state: "SP",
      min_temperature_celsius: -20,
      max_temperature_celsius: -10,
      available_pallet_positions: 100,
      chamber_type: "congelada",
      has_anvisa_certification: true,
      has_iso_certification: false,
      has_temperature_monitoring: true,
      has_24h_security: true,
      photos: ["img1.jpg"]
    },
    {
      id: "2",
      name: "Galpão B",
      city: "Rio de Janeiro",
      state: "RJ",
      min_temperature_celsius: 0,
      max_temperature_celsius: 5,
      available_pallet_positions: 50,
      chamber_type: "resfriada",
      has_anvisa_certification: false,
      has_iso_certification: true,
      has_temperature_monitoring: false,
      has_24h_security: false,
      photos: []
    }
  ];

  it("deve carregar e listar espaços ao iniciar", async () => {
    const getSpy = vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: mockSpaces }
    });

    render(<SearchSpaces />);

    expect(screen.getByText("Buscando espaços...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Galpão A")).toBeInTheDocument();
      expect(screen.getByText("São Paulo, SP")).toBeInTheDocument();
      expect(screen.getByText("ANVISA")).toBeInTheDocument();
      
      expect(screen.getByText("Galpão B")).toBeInTheDocument();
      expect(screen.getByText("Rio de Janeiro, RJ")).toBeInTheDocument();
    });

    // Verifica se "qualquer" é mapeado para undefined (busca sem filtro de tipo)
    expect(getSpy).toHaveBeenCalledWith("/spaces", {
      params: {
        city: "",
        state: "",
        chamber_type: undefined,
        min_positions: undefined
      }
    });
  });

  it("deve filtrar por cidade e estado", async () => {
    const user = userEvent.setup({ delay: null });
    const getSpy = vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: [] }
    });

    render(<SearchSpaces />);

    const cityInput = screen.getByPlaceholderText("Cidade");
    const stateInput = screen.getByPlaceholderText("Estado (UF)");

    await user.type(cityInput, "Curitiba");
    await user.type(stateInput, "PR");

    const searchBtn = screen.getByRole("button", { name: /Buscar/i });
    await user.click(searchBtn);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith("/spaces", expect.objectContaining({
        params: expect.objectContaining({
          city: "Curitiba",
          state: "PR"
        })
      }));
    });
  });

  it("deve filtrar por tipo de câmara usando o Select", async () => {
    const user = userEvent.setup({ delay: null });
    const getSpy = vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: [] }
    });

    render(<SearchSpaces />);

    // Abre o Select
    await user.click(screen.getByRole("combobox"));
    
    // Seleciona a opção
    const option = await screen.findByRole("option", { name: "Congelada" });
    await user.click(option);

    const searchBtn = screen.getByRole("button", { name: /Buscar/i });
    await user.click(searchBtn);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith("/spaces", expect.objectContaining({
        params: expect.objectContaining({
          chamber_type: "congelada"
        })
      }));
    });
  });

  it("deve exibir mensagem quando nenhum espaço for encontrado", async () => {
    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: [] }
    });

    render(<SearchSpaces />);

    await waitFor(() => {
      expect(screen.getByText("Nenhum espaço encontrado com os filtros selecionados.")).toBeInTheDocument();
    });
  });

  it("deve tratar erro na busca", async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(apiModule.default, "get").mockRejectedValue(new Error("Erro API"));

    render(<SearchSpaces />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao buscar espaços");
    });

    consoleSpy.mockRestore();
  });
});