import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpaceFormDialog } from "../SpaceFormDialog";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockToast = {
  toast: vi.fn(),
};

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => mockToast,
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();
Object.defineProperty(window.HTMLElement.prototype, "hasPointerCapture", {
  writable: true,
  value: () => false,
});

describe("SpaceFormDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();
  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    companyId: "123",
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o formulário corretamente", () => {
    render(<SpaceFormDialog {...defaultProps} />);
    expect(screen.getByText("Cadastrar Novo Espaço")).toBeInTheDocument();
    expect(screen.getByText("Informações Básicas")).toBeInTheDocument();
  });

  it("deve validar campos obrigatórios", async () => {
    const user = userEvent.setup({ delay: null });
    render(<SpaceFormDialog {...defaultProps} />);

    const submitBtn = screen.getByRole("button", { name: /Salvar Espaço/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Mínimo 3 caracteres")).toBeInTheDocument();
      expect(screen.getByText("Rua obrigatória")).toBeInTheDocument();
      expect(screen.getByText("Selecione um tipo")).toBeInTheDocument();
    });
  });

  it("deve exibir erro de validação se a temperatura mínima for maior que a máxima", async () => {
    const user = userEvent.setup({ delay: null });
    render(<SpaceFormDialog {...defaultProps} />);

    const minTemp = screen.getByLabelText(/Temp. Mín/i);
    const maxTemp = screen.getByLabelText(/Temp. Máx/i);

    await user.clear(minTemp);
    await user.clear(maxTemp);
    await user.type(minTemp, "10");
    await user.type(maxTemp, "5");

    await user.click(screen.getByRole("button", { name: /Salvar Espaço/i }));

    await waitFor(() => {
      expect(screen.getByText(/A temperatura mínima não pode ser maior que a máxima/i)).toBeInTheDocument();
    });
  });

  it("deve tratar erros de API e exibir a mensagem do servidor", async () => {
    const user = userEvent.setup({ delay: null });
    vi.spyOn(console, "error").mockImplementation(() => {});

    vi.spyOn(apiModule.default, "post").mockRejectedValue({
      response: {
        status: 422,
        data: { message: "Este nome já está em uso em sua conta." },
      },
    });

    render(<SpaceFormDialog {...defaultProps} />);

    // Preenchimento mínimo para chegar ao submit (evita validação client-side)
    await user.type(screen.getByLabelText(/Nome do Espaço/i), "Câmara Teste");
    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: /Resfriado/i }));
    await user.type(screen.getByLabelText(/^Rua$/i), "Avenida Teste");
    await user.type(screen.getByLabelText(/^Nº$/i), "100");
    await user.type(screen.getByLabelText(/^Bairro$/i), "Centro");
    await user.type(screen.getByLabelText(/^CEP$/i), "01310100");
    await user.type(screen.getByLabelText(/^Cidade$/i), "São Paulo");
    await user.type(screen.getByLabelText(/^UF$/i), "SP");
    await user.type(screen.getByLabelText(/Total de Paletes/i), "100");
    await user.type(screen.getByLabelText(/Disponíveis Agora/i), "50");
    await user.type(screen.getByLabelText(/^Nome$/i), "Contato Teste");
    await user.type(screen.getByLabelText(/^Telefone$/i), "11999999999");
    await user.type(screen.getByLabelText(/^E-mail$/i), "teste@teste.com");

    await user.click(screen.getByRole("button", { name: /Salvar Espaço/i }));

    await waitFor(
      () => {
        expect(mockToast.toast).toHaveBeenCalledWith(
          expect.objectContaining({
            variant: "destructive",
            title: "Erro",
            description: "Este nome já está em uso em sua conta.",
          })
        );
      },
      { timeout: 8000 }
    );
  });
});
