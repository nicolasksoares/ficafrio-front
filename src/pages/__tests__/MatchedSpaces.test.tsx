import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchedSpaces } from "@/components/dashboard/MatchedSpaces";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("MatchedSpaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar e listar os espaços compatíveis corretamente", async () => {
    const mockMatches = [
      { 
        id: 1, 
        name: "Galpão SP", 
        city: "São Paulo", 
        state: "SP", 
        temp_min: -20, 
        temp_max: -10, 
        type: "congelado", 
        capacity: 100 
      },
    ];

    const getSpy = vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: mockMatches },
    });

    render(<MatchedSpaces needId="123" needTitle="Demanda Urgente" />);

    expect(screen.getByText("Buscando espaços compatíveis...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Matches Sugeridos para: Demanda Urgente")).toBeInTheDocument();
      expect(screen.getByText("Espaço em São Paulo")).toBeInTheDocument();
      expect(screen.getByText("-20°C a -10°C")).toBeInTheDocument();
    });

    expect(getSpy).toHaveBeenCalledWith("/storage-requests/123/matches");
  });

  it("deve exibir mensagem quando não houver matches", async () => {
    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: [] },
    });

    render(<MatchedSpaces needId="999" needTitle="Demanda Sem Match" />);

    await waitFor(() => {
      expect(screen.getByText("Nenhum espaço compatível encontrado no momento")).toBeInTheDocument();
    });
  });

  it("deve permitir solicitar cotação para um match", async () => {
    const user = userEvent.setup();
    const mockMatches = [
      { id: 5, name: "Galpão Teste", city: "BH", state: "MG", temp_min: 0, temp_max: 5, type: "resfriado", capacity: 50 },
    ];

    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: mockMatches },
    });

    const postSpy = vi.spyOn(apiModule.default, "post").mockResolvedValue({});

    render(<MatchedSpaces needId="10" needTitle="Demanda Teste" />);

    const requestButton = await screen.findByRole("button", { name: "Solicitar Cotação" });
    await user.click(requestButton);

    expect(postSpy).toHaveBeenCalledWith("/quotes", {
      storage_request_id: "10",
      space_id: 5,
    });

    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Solicitação de cotação enviada!");
    });
  });
});