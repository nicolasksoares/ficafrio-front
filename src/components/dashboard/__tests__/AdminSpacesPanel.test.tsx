import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminSpacesPanel } from "../AdminSpacesPanel";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockToast = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("AdminSpacesPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar e listar os espaços corretamente", async () => {
    const mockSpaces = [
      { id: 1, title: "Galpão A", city: "São Paulo", active: true },
      { id: 2, title: "Galpão B", city: "Rio de Janeiro", active: false },
    ];

    const getSpy = vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: mockSpaces,
    });

    render(<AdminSpacesPanel />);

    expect(await screen.findByText("Painel Admin - Espaços")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Galpão A")).toBeInTheDocument();
      expect(screen.getByText("Galpão B")).toBeInTheDocument();
      expect(screen.getByText("(São Paulo)")).toBeInTheDocument();
    });

    expect(getSpy).toHaveBeenCalledWith("/admin/spaces");
  });

  it("deve exibir mensagem quando não houver espaços", async () => {
    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: [],
    });

    render(<AdminSpacesPanel />);

    await waitFor(() => {
      expect(screen.getByText("Nenhum espaço cadastrado.")).toBeInTheDocument();
    });
  });

  it("deve permitir alterar o status de um espaço", async () => {
    const user = userEvent.setup();
    const mockSpaces = [
      { id: 1, title: "Galpão Teste", city: "BH", active: true },
    ];

    vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: mockSpaces,
    });

    const patchSpy = vi.spyOn(apiModule.default, "patch").mockResolvedValue({});

    render(<AdminSpacesPanel />);

    const toggleButton = await screen.findByText("Desativar");
    await user.click(toggleButton);

    expect(patchSpy).toHaveBeenCalledWith("/admin/spaces/1/toggle");
    
    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
            title: "Sucesso",
            description: "Status atualizado."
        }));
    });
  });
});