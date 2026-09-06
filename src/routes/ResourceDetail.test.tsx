import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { axe } from "jest-axe";
import ResourceDetail from "@/routes/ResourceDetail";

function renderSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/resources/${slug}`]}>
      <Routes>
        <Route path="/resources/:slug" element={<ResourceDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("<ResourceDetail />", () => {
  it("renders a known resource with its contact channels", async () => {
    renderSlug("georgia-gateway");

    expect(
      await screen.findByRole("heading", { level: 1, name: /georgia gateway/i }),
    ).toBeInTheDocument();

    // official-site link points at the real agency URL
    expect(
      screen.getByRole("link", { name: /go to the official website/i }),
    ).toHaveAttribute("href", "https://gateway.ga.gov");

    // phone rendered as a tel: link with digits only
    const telLink = screen.getAllByRole("link", { name: /1-877-423-4746/ })[0];
    expect(telLink).toHaveAttribute("href", "tel:18774234746");

    // trust requirement: a "last checked / confirm with the agency" note
    expect(
      screen.getByText(/confirm hours, eligibility, and contact information/i),
    ).toBeInTheDocument();
  });

  it("shows a friendly not-found state for an unknown slug", async () => {
    renderSlug("does-not-exist");
    expect(
      await screen.findByText(/couldn't find that resource/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /find a resource/i }),
    ).toBeInTheDocument();
  });

  it("has no axe-detectable accessibility violations", async () => {
    const { container } = renderSlug("georgia-legal-services-program");
    await screen.findByRole("heading", { level: 1 });
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
