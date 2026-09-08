import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { axe } from "jest-axe";
import Guide from "@/routes/Guide";

function renderGuide() {
  return render(
    <MemoryRouter initialEntries={["/guide"]}>
      <Guide />
    </MemoryRouter>,
  );
}

describe("<Guide />", () => {
  it("walks from the intro through questions to grounded results", async () => {
    const user = userEvent.setup();
    renderGuide();

    await user.click(screen.getByRole("button", { name: /^start$/i }));

    // Q1 situation
    await screen.findByRole("heading", { name: /what's going on right now/i });
    await user.click(screen.getByRole("button", { name: /money, rent, or bills/i }));

    // Q2 need
    await screen.findByRole("heading", { name: /which of these is closest/i });
    await user.click(screen.getByRole("button", { name: /help paying rent/i }));

    // Q3 county
    await screen.findByRole("heading", { name: /which county/i });
    await user.selectOptions(
      screen.getByLabelText(/choose your county/i),
      "Tift",
    );
    await user.click(screen.getByRole("button", { name: /^next$/i }));

    // Q4 signals -> skip
    await screen.findByRole("heading", { name: /do any of these describe you/i });
    await user.click(screen.getByRole("button", { name: /i'm not sure \/ skip/i }));

    // Q5 channel
    await screen.findByRole("heading", { name: /how would you like to get help/i });
    await user.click(screen.getByRole("button", { name: /online/i }));

    // Results
    const heading = await screen.findByRole("heading", {
      name: /here's what we found for you/i,
    });
    const results = heading.closest("section") as HTMLElement;
    const cards = within(results).getAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
    // every recommendation has a "why this fits" line
    expect(within(results).getAllByText(/why this fits/i).length).toBe(
      cards.length,
    );
    // human hand-off is always offered
    expect(
      within(results).getByRole("link", { name: /chat or call for help/i }),
    ).toBeInTheDocument();
  });

  it("routes to crisis resources when the visitor types distress", async () => {
    const user = userEvent.setup();
    renderGuide();
    await user.click(screen.getByRole("button", { name: /^start$/i }));
    await screen.findByRole("heading", { name: /what's going on right now/i });

    await user.type(
      screen.getByLabelText(/tell us in your own words/i),
      "i want to hurt myself",
    );
    await user.click(screen.getByRole("button", { name: /continue/i }));

    const crisisHeading = await screen.findByRole("heading", {
      name: /connected to someone right now/i,
    });
    const panel = crisisHeading.closest("section") as HTMLElement;
    // 988 is offered inside the crisis panel (separate from the always-on
    // 988 line at the top of the page)
    expect(
      within(panel).getByRole("link", { name: /988/ }),
    ).toBeInTheDocument();
  });

  it("has no axe-detectable violations on the intro screen", async () => {
    const { container } = renderGuide();
    expect((await axe(container)).violations).toEqual([]);
  });
});
