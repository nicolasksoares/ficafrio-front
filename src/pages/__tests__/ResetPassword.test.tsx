import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import ResetPassword from "../ResetPassword";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as apiModule from "@/lib/api";

const mockNavigate = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockSearchParams],
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/NavBar", () => ({ 
  NavBar: () => <div data-testid="navbar">NavBar</div> 
}));

describe("Página de Redefinição de Senha", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams(); 
  });

  it("deve mostrar erro se o link for inválido (sem token/email)", () => {
    mockSearchParams = new URLSearchParams({}); 

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    expect(screen.getByText("Link Inválido")).toBeInTheDocument();
    expect(screen.getByText("Faltam informações de segurança no link de recuperação.")).toBeInTheDocument();
  });

  it("deve permitir alterar a senha com link válido", async () => {
    mockSearchParams = new URLSearchParams({ token: "valid-token", email: "test@example.com" });
    const user = userEvent.setup();
    const postSpy = vi.spyOn(apiModule.default, "post").mockResolvedValue({});

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    expect(screen.getByText("Redefinir Senha")).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/)).toBeInTheDocument();

    const inputs = screen.getAllByPlaceholderText("••••••••");
    
    await user.type(inputs[0], "SenhaNova123");
    await user.type(inputs[1], "SenhaNova123");

    const submitBtn = screen.getByRole("button", { name: "Alterar Senha" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/api/reset-password", {
        token: "valid-token",
        email: "test@example.com",
        password: "SenhaNova123",
        password_confirmation: "SenhaNova123"
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });
});