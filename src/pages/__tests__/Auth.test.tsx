import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import Auth from "../Auth";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

interface MockTurnstileProps {
  onSuccess: (token: string) => void;
}

vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onSuccess }: MockTurnstileProps) => (
    <div data-testid="turnstile-wrapper">
        <button type="button" data-testid="turnstile-mock" onClick={() => onSuccess("fake-token")}>
        I am human
        </button>
    </div>
  ),
}));

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Auth Page - Signup Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = vi.fn().mockResolvedValue({
        json: async () => [
            { id: 1, nome: "São Paulo" },
            { id: 2, nome: "Campinas" },
            { id: 3, nome: "Santos" }
        ],
    });
  });

  it("submits the signup form correctly with separated address fields", async () => {
    const user = userEvent.setup();

    const postSpy = vi.spyOn(apiModule.default, "post").mockResolvedValue({
      data: { 
        token: "fake-jwt-token", 
        user: { id: 1, trade_name: "Empresa Teste", type: "cliente" } 
      },
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Auth />
        </AuthProvider>
      </BrowserRouter>
    );

    const signupTab = screen.getByRole("tab", { name: /Criar Conta/i });
    await user.click(signupTab);

    const nomeEmpresaInput = await screen.findByLabelText(/Nome da Empresa/i);
    
    await user.type(nomeEmpresaInput, "Logística 10");
    await user.type(screen.getByLabelText(/CNPJ/i), "11.111.111/0001-11");
    await user.type(screen.getByLabelText(/Telefone/i), "11999999999");
    
    await user.type(screen.getByLabelText(/CEP/i), "01000-000");
    
    await user.selectOptions(screen.getByLabelText(/UF/i), "SP");
    
    await screen.findByText("São Paulo");
    await user.selectOptions(screen.getByLabelText(/Cidade/i), "São Paulo");

    await user.type(screen.getByLabelText(/Logradouro/i), "Av Paulista");
    await user.type(screen.getByLabelText(/Número/i), "1000");
    await user.type(screen.getByLabelText(/Bairro/i), "Bela Vista");

    await user.type(screen.getByLabelText(/Email Corporativo/i), "contato@log10.com");
    await user.type(screen.getByLabelText(/^Confirmar Email/i), "contato@log10.com");
    await user.type(screen.getByPlaceholderText("Insira sua Senha"), "SenhaForte123");
    await user.type(screen.getByPlaceholderText("Repita sua Senha"), "SenhaForte123");

    await user.click(screen.getByTestId("turnstile-mock"));

    const submitBtn = screen.getByRole("button", { name: /Finalizar Cadastro/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/companies", expect.objectContaining({
        trade_name: "Logística 10",
        state: "SP",
        email: "contato@log10.com",
        turnstile_token: "fake-token"
      }));
    });

    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });
});