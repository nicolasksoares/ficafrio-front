import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Buscar from "../Buscar";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockUser = { id: 1, name: "Teste User" };
const mockUseAuth = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({ state: null }),
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Página de Busca", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: mockUser, isLoading: false });
  });

  it("não deve permitir busca se o formulário estiver vazio/inválido", async () => {
    const user = userEvent.setup();
    const getSpy = vi.spyOn(apiModule.default, "get");

    render(
      <BrowserRouter>
        <Buscar />
      </BrowserRouter>
    );

    const btnBuscar = screen.getByRole("button", { name: /Buscar/i });
    
    expect(btnBuscar).not.toBeDisabled();

    const inputTemp = screen.getByPlaceholderText("Ex: -18");
    await user.type(inputTemp, "-90");

    expect(btnBuscar).toBeDisabled();
    
    await user.click(btnBuscar);
    expect(getSpy).not.toHaveBeenCalled();
  });

  it("deve chamar a API com os parâmetros corretos ao preencher filtros", async () => {
    const user = userEvent.setup();
    const getSpy = vi.spyOn(apiModule.default, "get").mockResolvedValue({
      data: { data: [] }
    });

    render(
      <BrowserRouter>
        <Buscar />
      </BrowserRouter>
    );

    const inputLocal = screen.getByPlaceholderText("Cidade, Estado");
    await user.type(inputLocal, "São Paulo, SP");

    const inputTemp = screen.getByPlaceholderText("Ex: -18");
    await user.type(inputTemp, "-18");

    const btnBuscar = screen.getByRole("button", { name: /Buscar/i });
    expect(btnBuscar).not.toBeDisabled();
    
    await user.click(btnBuscar);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith("/api/spaces", expect.objectContaining({
        params: expect.objectContaining({
          city: "São Paulo",
          state: "SP",
          temp_min: -18
        })
      }));
    });
  });
});