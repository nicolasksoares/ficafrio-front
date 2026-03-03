import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Suporte from "../Suporte";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/components/NavBar", () => ({ 
  NavBar: () => <div data-testid="navbar">NavBar</div> 
}));

describe("Página de Suporte", () => {
  it("deve renderizar os canais de atendimento e FAQ", () => {
    render(
      <BrowserRouter>
        <Suporte />
      </BrowserRouter>
    );

    expect(screen.getByText("Central de Suporte")).toBeInTheDocument();
    
    expect(screen.getByText("contato@ficafrioltda.com")).toBeInTheDocument();
    
    const phones = screen.getAllByText("(11) 99369-3710");
    expect(phones).toHaveLength(2);
    
    expect(screen.getByText("Perguntas Frequentes")).toBeInTheDocument();
    expect(screen.getByText("Como cadastrar minha empresa?")).toBeInTheDocument();
    expect(screen.getByText("Preciso de contrato?")).toBeInTheDocument();
  });
});