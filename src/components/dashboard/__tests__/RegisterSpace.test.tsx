import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterSpace } from "../RegisterSpace";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockToast = {
  toast: vi.fn(),
};

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => mockToast,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "123", name: "Empresa Teste" } }),
}));

vi.mock("../SpaceFormDialog", () => ({
  SpaceFormDialog: ({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess: () => void }) =>
    open ? (
      <div role="dialog" aria-label="Formulário de cadastro de espaço">
        <p>Mock Dialog Content</p>
        <button onClick={() => onSuccess()}>Simular Sucesso</button>
        <button onClick={() => onOpenChange(false)}>Fechar</button>
      </div>
    ) : null,
}));

describe("RegisterSpace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o conteúdo principal", () => {
    render(<RegisterSpace />);

    expect(screen.getByText("Monetize sua")).toBeInTheDocument();
    expect(screen.getByText("Capacidade Ociosa")).toBeInTheDocument();
    expect(screen.getByText("Anunciar Nova Câmara Fria")).toBeInTheDocument();
    expect(screen.getByText("Parceiro FicaFrio")).toBeInTheDocument();
    expect(screen.getByText("Segurança Total")).toBeInTheDocument();
    expect(screen.getByText("Gestão de Demanda")).toBeInTheDocument();
    expect(screen.getByText("Ativação Rápida")).toBeInTheDocument();
  });

  it("deve abrir o modal ao clicar no card de adicionar", async () => {
    const user = userEvent.setup({ delay: null });

    render(<RegisterSpace />);

    expect(screen.queryByText("Mock Dialog Content")).not.toBeInTheDocument();

    const addCard = screen.getByText("Anunciar Nova Câmara Fria");
    await user.click(addCard);

    expect(screen.getByText("Mock Dialog Content")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("deve exibir toast de sucesso e fechar o modal ao cadastrar com sucesso", async () => {
    const user = userEvent.setup({ delay: null });

    render(<RegisterSpace />);

    await user.click(screen.getByText("Anunciar Nova Câmara Fria"));
    await user.click(screen.getByText("Simular Sucesso"));

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Espaço enviado para análise!",
          description: "Nossa equipe revisará os dados e ativará seu anúncio em breve.",
        })
      );
    });

    // Modal deve fechar após sucesso
    await waitFor(() => {
      expect(screen.queryByText("Mock Dialog Content")).not.toBeInTheDocument();
    });
  });
});
