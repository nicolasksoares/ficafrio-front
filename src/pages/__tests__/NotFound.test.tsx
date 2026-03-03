import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import NotFound from "../NotFound";
import { vi, describe, it, expect } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Página 404", () => {
  it("deve renderizar a mensagem de erro e permitir voltar", async () => {
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Página não encontrada")).toBeInTheDocument();

    const backButton = screen.getByRole("button", { name: /Voltar para o Início/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});