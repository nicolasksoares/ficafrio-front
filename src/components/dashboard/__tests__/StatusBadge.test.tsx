import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/dashboard/StatusBadge"; // Ajuste o import se necessário
import { describe, it, expect } from "vitest";

describe("StatusBadge", () => {
  it("deve renderizar o rótulo correto para status conhecidos", () => {
    const scenarios = [
      { status: "pending", expected: "Pendente" },
      { status: "active", expected: "Ativo" },
      { status: "rejected", expected: "Recusado" },
      { status: "payment_pending", expected: "Pagamento Pendente" },
      { status: "em_revisao", expected: "Em Revisão" },
    ];

    scenarios.forEach(({ status, expected }) => {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it("deve normalizar o status (case insensitive)", () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText("Pendente")).toBeInTheDocument();
  });

  it("deve lidar com status desconhecidos usando fallback", () => {
    render(<StatusBadge status="status_estranho" />);
    expect(screen.getByText("status_estranho")).toBeInTheDocument();
  });

  it("deve aplicar classes customizadas", () => {
    const { container } = render(<StatusBadge status="active" className="classe-extra" />);
    expect(container.firstChild).toHaveClass("classe-extra");
  });

  it("deve renderizar corretamente se o status for nulo ou vazio", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render(<StatusBadge status={null as any} />);
    
    const badge = document.querySelector(".bg-gray-100");
    expect(badge).toBeInTheDocument();
  });
});