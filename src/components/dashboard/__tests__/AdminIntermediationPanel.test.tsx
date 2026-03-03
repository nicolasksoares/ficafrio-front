import { render, screen } from "@testing-library/react";
import { AdminIntermediationPanel } from "../AdminIntermediationPanel";
import { describe, it, expect } from "vitest";

describe("AdminIntermediationPanel", () => {
  it("deve renderizar a mensagem de área restrita corretamente", () => {
    render(<AdminIntermediationPanel />);

    expect(screen.getByText("Intermediação Admin")).toBeInTheDocument();
    expect(screen.getByText("Área Restrita")).toBeInTheDocument();
    expect(screen.getByText(/Este painel requer permissões elevadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Conecte-se com uma conta de nível Admin/i)).toBeInTheDocument();
  });
});