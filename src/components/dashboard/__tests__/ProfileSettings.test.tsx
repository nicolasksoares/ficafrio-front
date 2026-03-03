import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileSettings } from "../ProfileSettings";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockToastFn = vi.fn();

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToastFn }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1, name: "Test User" } }),
}));

describe("ProfileSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar os dados do perfil e preencher o formulário corretamente", async () => {
    const mockProfileData = {
      id: 10,
      trade_name: "Empresa Teste LTDA",
      cnpj: "12.345.678/0001-99",
      phone: "11999998888",
      email: "contato@teste.com", 
      address_street: "Rua das Flores",
      address_number: "123",
      district: "Centro",
      city: "São Paulo",
      state: "SP"
    };

    const getSpy = vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: mockProfileData },
    });

    render(<ProfileSettings />);

    expect(screen.getByText("Carregando informações...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText(/Nome da Empresa/i)).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("Empresa Teste LTDA")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12.345.678/0001-99")).toBeInTheDocument();
    expect(screen.getByDisplayValue("contato@teste.com")).toBeInTheDocument(); // email -> corporate_email
    
    expect(screen.getByDisplayValue(/Rua das Flores, 123, Centro, São Paulo, SP/i)).toBeInTheDocument();

    expect(getSpy).toHaveBeenCalledWith("/me");
  });

  it("deve enviar as alterações com o mapeamento correto de campos", async () => {
    const user = userEvent.setup();
    
    const mockProfileData = {
      id: 55,
      trade_name: "Empresa Original",
      cnpj: "00.000.000/0001-00",
      email: "original@email.com",
      phone: "1100000000",
      address: "Rua A"
    };

    vi.spyOn(apiModule.default, "get").mockResolvedValue({ data: mockProfileData });
    const putSpy = vi.spyOn(apiModule.default, "put").mockResolvedValue({});

    render(<ProfileSettings />);

    await waitFor(() => {
        expect(screen.getByDisplayValue("Empresa Original")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Nome da Empresa/i);
    const emailInput = screen.getByLabelText(/E-mail Corporativo/i);

    await user.clear(nameInput);
    await user.type(nameInput, "Empresa Alterada S.A.");

    await user.clear(emailInput);
    await user.type(emailInput, "novo@email.com");

    const saveBtn = screen.getByRole("button", { name: "Salvar Alterações" });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith("/companies/55", expect.objectContaining({
        trade_name: "Empresa Alterada S.A.", 
        name: "Empresa Alterada S.A.",       
        email: "novo@email.com",
        phone: "1100000000"
      }));

      expect(mockToastFn).toHaveBeenCalledWith(expect.objectContaining({
        title: "Dados atualizados"
      }));
    });
  });

  it("deve exibir erro se falhar ao carregar o perfil", async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.spyOn(apiModule.default, "get").mockRejectedValue(new Error("Erro Fetch"));

    render(<ProfileSettings />);

    await waitFor(() => {
      expect(mockToastFn).toHaveBeenCalledWith(expect.objectContaining({
        title: "Erro",
        description: "Não foi possível carregar os dados da empresa.",
        variant: "destructive"
      }));
    });

    expect(screen.queryByText("Carregando informações...")).not.toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it("deve exibir erro se falhar ao salvar", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.spyOn(apiModule.default, "get").mockResolvedValue({ 
        data: { id: 1, trade_name: "Teste", cnpj: "11111111111111", phone: "1111111111", email: "a@a.com", address: "Rua A" } 
    });
    
    vi.spyOn(apiModule.default, "put").mockRejectedValue(new Error("Erro Update"));

    render(<ProfileSettings />);

    await waitFor(() => {
        expect(screen.getByDisplayValue("Teste")).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole("button", { name: "Salvar Alterações" });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockToastFn).toHaveBeenCalledWith(expect.objectContaining({
        title: "Erro ao atualizar",
        variant: "destructive"
      }));
    });

    consoleSpy.mockRestore();
  });
});