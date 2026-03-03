import { render, screen } from "@testing-library/react";
import { ContactRequests } from "../ContactRequests";
import { describe, it, expect } from "vitest";

describe("ContactRequests", () => {
  it("deve renderizar o placeholder de solicitações de contato corretamente", () => {
    render(<ContactRequests />);

    expect(screen.getByText("Solicitações de Contato")).toBeInTheDocument();
    expect(screen.getByText("Gerencie suas comunicações diretas.")).toBeInTheDocument();
    
    expect(screen.getByText(/Funcionalidade de mensagens diretas em desenvolvimento/i)).toBeInTheDocument();
    expect(screen.getByText(/Utilize a aba "Minhas Propostas" para negociações/i)).toBeInTheDocument();
  });
});