import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NeedFormDialog } from "../NeedFormDialog";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockToast = {
  toast: vi.fn(),
};

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => mockToast,
}));

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

describe("NeedFormDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o formulário quando aberto", () => {
    render(
      <NeedFormDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    expect(screen.getByText("Solicitar Armazenamento")).toBeInTheDocument();
    expect(screen.getByText("Identificação da Demanda")).toBeInTheDocument();
  });

  it("deve validar campos obrigatórios ao tentar enviar vazio", async () => {
    const user = userEvent.setup();
    render(
      <NeedFormDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    const submitBtn = screen.getByRole("button", { name: "Cadastrar Demanda" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Título deve ter no mínimo 3 caracteres")).toBeInTheDocument();
      expect(screen.getByText("Produto é obrigatório")).toBeInTheDocument();
      expect(screen.getByText("Cidade é obrigatória")).toBeInTheDocument();
      expect(screen.getByText("Nome do responsável é obrigatório")).toBeInTheDocument();
    });
  });

  it("deve enviar o formulário com sucesso quando preenchido corretamente", async () => {
    const user = userEvent.setup({ delay: null });
    const postSpy = vi.spyOn(apiModule.default, "post").mockResolvedValue({});

    render(
      <NeedFormDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    await user.type(screen.getByLabelText(/Título \*/i), "Demanda Congelados");
    
    await user.click(screen.getByRole("combobox", { name: /Categoria/i }));
    const option = await screen.findByRole("option", { name: "Congelados" });
    await user.click(option);

    await user.type(screen.getByLabelText(/Produto \*/i), "Frango");
    await user.type(screen.getByLabelText(/Posições Paletes \*/i), "50");
    await user.type(screen.getByLabelText(/Temp. Mínima/i), "-20");
    await user.type(screen.getByLabelText(/Temp. Máxima/i), "-10");
    await user.type(screen.getByLabelText(/Cidade \*/i), "São Paulo");
    
    const startDateInput = screen.getByLabelText(/Data de Início/i);
    await user.type(startDateInput, "2024-12-01");

    await user.type(screen.getByLabelText(/Nome do Responsável \*/i), "João Silva");
    await user.type(screen.getByLabelText(/Telefone \*/i), "11999998888");
    await user.type(screen.getByLabelText(/E-mail \*/i), "joao@email.com");

    const submitBtn = screen.getByRole("button", { name: "Cadastrar Demanda" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/storage-requests", expect.objectContaining({
        title: "Demanda Congelados",
        category: "congelados",
        product: "Frango",
        quantity: 50,
        city: "São Paulo",
        contact_name: "João Silva",
        status: "pendente"
      }));
      
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Demanda cadastrada"
      }));
      
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    }, { timeout: 5000 });
  }, 15000);

  it("deve exibir erro se a API falhar", async () => {
    const user = userEvent.setup({ delay: null });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.spyOn(apiModule.default, "post").mockRejectedValue(new Error("Erro API"));

    render(
      <NeedFormDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onSuccess={mockOnSuccess} 
      />
    );

    await user.type(screen.getByLabelText(/Título \*/i), "Teste Erro");
    
    await user.click(screen.getByRole("combobox", { name: /Categoria/i }));
    const option = await screen.findByRole("option", { name: "Resfriados" });
    await user.click(option);

    await user.type(screen.getByLabelText(/Produto \*/i), "Teste");
    await user.type(screen.getByLabelText(/Posições Paletes \*/i), "10");
    await user.type(screen.getByLabelText(/Cidade \*/i), "Rio");
    
    const startDateInput = screen.getByLabelText(/Data de Início/i);
    await user.type(startDateInput, "2024-12-01");

    await user.type(screen.getByLabelText(/Nome do Responsável \*/i), "Teste");
    await user.type(screen.getByLabelText(/Telefone \*/i), "11999999999");
    await user.type(screen.getByLabelText(/E-mail \*/i), "teste@email.com");

    const submitBtn = screen.getByRole("button", { name: "Cadastrar Demanda" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Erro",
        variant: "destructive"
      }));
    });

    consoleSpy.mockRestore();
  }, 15000);
});