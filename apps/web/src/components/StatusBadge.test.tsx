import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders the status label", () => {
    render(<StatusBadge status="OFFER" />);
    expect(screen.getByText("OFFER")).toBeInTheDocument();
  });
});
