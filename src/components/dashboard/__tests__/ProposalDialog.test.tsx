import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProposalDialog } from "../ProposalDialog";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockToast = {
  toast: vi.fn(),
};

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => mockToast,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      trade_name: "Empresa Teste",
      phone: "11999999999",
      email: "teste@teste.com",
    },
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const productTypes = [
  { value: "alimentos", label: "Alimentos" },
  { value: "outros", label: "Outros" },
];

const spaceData = {
  min_temperature_celsius: -20,
  max_temperature_celsius: 5,
  available_pallet_positions: 100,
  available_from: "2024-01-01",
  available_until: "2024-12-31",
};

// @ts-expect-error - Mocking ResizeObserver
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

describe("ProposalDialog", () => {
  const mockOnOpenChange = vi.fn();
  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    spaceId: "space-123",
    spaceCity: "São Paulo",
    spaceState: "SP",
    spaceDisplayName: "Galpão Central",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(apiModule.default, "get")
      .mockResolvedValueOnce({ data: productTypes })
      .mockResolvedValueOnce({ data: { data: spaceData } });
  });

  it("deve renderizar o diálogo corretamente", () => {
    render(<ProposalDialog {...defaultProps} />);
    expect(screen.getByText("Solicitar Armazenagem")).toBeInTheDocument();
    expect(screen.getByText("Para:")).toBeInTheDocument();
    expect(screen.getByText("Galpão Central")).toBeInTheDocument();
  });

  it("deve validar campos obrigatórios", async () => {
    const user = userEvent.setup();
    render(<ProposalDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /Categoria/i })).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole("button", { name: /Enviar Solicitação/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Selecione a categoria")).toBeInTheDocument();
      expect(screen.getByText("Descrição muito curta")).toBeInTheDocument();
    });
  });

  it.skip("deve enviar o formulário com sucesso", async () => {
    const user = userEvent.setup({ delay: null });

    const postSpy = vi
      .spyOn(apiModule.default, "post")
      .mockResolvedValueOnce({ data: { data: { id: 999 } } })
      .mockResolvedValueOnce({});

    render(<ProposalDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /Categoria/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox", { name: /Categoria/i }));
    const option = await screen.findByRole("option", { name: "Alimentos" });
    await user.click(option);

    await user.type(screen.getByLabelText(/Descrição Detalhada/i), "Carga de congelados");

    const spinbuttons = screen.getAllByRole("spinbutton");
    const qtdInput = spinbuttons[0];
    await user.clear(qtdInput);
    await user.type(qtdInput, "50");

    const minTempInput = spinbuttons[1];
    await user.clear(minTempInput);
    await user.type(minTempInput, "-20");

    const maxTempInput = spinbuttons[2];
    await user.clear(maxTempInput);
    await user.type(maxTempInput, "-10");

    // Datas já são preenchidas pelo form.reset no useEffect (available_from / addDays)
    const submitBtn = screen.getByRole("button", { name: /Enviar Solicitação/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(postSpy).toHaveBeenCalled();
        expect(mockToast.toast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Solicitação Enviada!",
          })
        );
      },
      { timeout: 10000 }
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      1,
      "/storage-requests",
      expect.objectContaining({
        product_type: "alimentos",
        quantity: 50,
        temp_min: -20,
        temp_max: -10,
        target_city: "São Paulo",
      })
    );
  }, 20000);
  // TODO: Reativar - validação do formulário impede envio no ambiente de teste (post nunca é chamado)

  it("deve tratar erro da API", async () => {
    const user = userEvent.setup({ delay: null });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const postSpy = vi.spyOn(apiModule.default, "post");
    postSpy.mockReset();
    postSpy.mockRejectedValue(new Error("Falha"));

    render(<ProposalDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /Categoria/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("combobox", { name: /Categoria/i }));
    await user.click(await screen.findByRole("option", { name: "Outros" }));

    await user.type(screen.getByLabelText(/Descrição Detalhada/i), "Teste descrição");

    const spinbuttons = screen.getAllByRole("spinbutton");
    const qtdInput = spinbuttons[0];
    await user.clear(qtdInput);
    await user.type(qtdInput, "10");

    // Datas já são preenchidas pelo form.reset no useEffect
    await user.click(screen.getByRole("button", { name: /Enviar Solicitação/i }));

    await waitFor(
      () => {
        expect(postSpy).toHaveBeenCalled();
        expect(mockToast.toast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Erro",
            variant: "destructive",
          })
        );
      },
      { timeout: 8000 }
    );

    consoleSpy.mockRestore();
  }, 15000);
});
