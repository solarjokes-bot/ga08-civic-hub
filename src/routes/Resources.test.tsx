import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { axe } from "jest-axe";
import Resources from "@/routes/Resources";
import { RESOURCE_SEED } from "@/data/resources.seed";

function renderAt(path = "/resources") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Resources />
    </MemoryRouter>,
  );
}

describe("<Resources />", () => {
  it("lists the whole seed catalog once loaded", async () => {
    renderAt();
    expect(
      screen.getByRole("heading", { level: 1, name: /find a resource/i }),
    ).toBeInTheDocument();

    await screen.findByText(
      new RegExp(`${RESOURCE_SEED.length} resources found`, "i"),
    );
    expect(screen.getAllByRole("article")).toHaveLength(RESOURCE_SEED.length);
  });

  it("narrows results from a free-text search", async () => {
    const user = userEvent.setup();
    renderAt();
    await screen.findByText(/resources found/i);

    await user.type(screen.getByLabelText(/search by keyword/i), "veterans");

    const results = await screen.findByText(/resources? found/i);
    const shown = screen.getAllByRole("article");
    expect(shown.length).toBeLessThan(RESOURCE_SEED.length);
    expect(shown.length).toBeGreaterThan(0);
    // exact-string name => matches the card's title link, not the
    // "See details…: <name>" CTA link that merely contains it
    expect(
      screen.getByRole("link", {
        name: "Georgia Department of Veterans Service",
      }),
    ).toBeInTheDocument();
    // the live-region heading reflects the smaller count
    expect(results).toHaveTextContent(String(shown.length));
  });

  it("reads initial filters from the URL query string", async () => {
    renderAt("/resources?category=HOUSING");
    await screen.findByText(/resources? found/i);
    const housingCount = RESOURCE_SEED.filter(
      (r) => r.category === "HOUSING",
    ).length;
    expect(screen.getAllByRole("article")).toHaveLength(housingCount);
  });

  it("shows an empty state with a path to live help when nothing matches", async () => {
    renderAt("/resources?q=zzzznotathing");
    expect(
      await screen.findByText(/no resources match those filters/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /chat or call for help/i }),
    ).toBeInTheDocument();
  });

  it("has no axe-detectable accessibility violations", async () => {
    const { container } = renderAt();
    await screen.findByText(/resources found/i);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("associates the county filter list with its description", async () => {
    renderAt();
    await screen.findByText(/resources found/i);
    const countyLegend = screen.getByText("County", { selector: "legend" });
    const fieldset = countyLegend.closest("fieldset");
    expect(fieldset).not.toBeNull();
    expect(
      within(fieldset as HTMLElement).getByText(
        /counties in georgia's 8th district/i,
      ),
    ).toBeInTheDocument();
  });
});
