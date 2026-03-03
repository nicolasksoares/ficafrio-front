import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Dashboard from "../Dashboard";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
const mockUseAuth = vi.fn();
const mockSignOut = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
    useSearchParams: () => [new URLSearchParams("?section=home"), mockSetSearchParams],
  };
});

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/components/NavBar", () => ({ NavBar: () => <div data-testid="navbar" /> }));
vi.mock("@/components/dashboard/DashboardHome", () => ({ DashboardHome: () => <div>Home Content</div> }));
vi.mock("@/components/dashboard/AdminIntermediationPanel", () => ({ AdminIntermediationPanel: () => <div>Admin Panel Content</div> }));

// Evita Unhandled Rejection: lazy-loaded components que fazem fetch no mount/preload
vi.mock("@/pages/PaymentHistory", () => ({ default: () => <div>Payment History</div> }));
vi.mock("@/components/dashboard/NotificationsMenu", () => ({ NotificationsMenu: () => <div data-testid="notifications" /> }));
vi.mock("@/components/dashboard/MyProposals", () => ({ MyProposals: () => <div>My Proposals</div> }));

describe("Página Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve redirecionar para /auth se o usuário não estiver logado", () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith("/auth", { replace: true });
  });

  it("deve exibir opções de Admin apenas para usuários administradores", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: "Admin User", email: "admin@test.com", type: "admin" },
      isLoading: false,
      signOut: mockSignOut,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Admin vê itens exclusivos: Relatórios Gerais, Aprovar Espaços, etc.
    expect(screen.getAllByText("Relatórios Gerais").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aprovar Espaços").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aprovar Propostas").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Gerenciar Pagamentos").length).toBeGreaterThan(0);
  });

  it("NÃO deve exibir opções de Admin para usuários comuns", () => {
    mockUseAuth.mockReturnValue({
      user: { id: 2, name: "Common User", email: "user@test.com", type: "parceiro" },
      isLoading: false,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.queryByText("Relatórios Gerais")).not.toBeInTheDocument();
  });
  
  it("deve permitir logout", async () => {
    const user = userEvent.setup();
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: "User", type: "parceiro" },
      isLoading: false,
      signOut: mockSignOut,
    });

    render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
    );

    const btnSair = screen.getByTitle("Sair");
    await user.click(btnSair);

    expect(mockSignOut).toHaveBeenCalled();
  });
});