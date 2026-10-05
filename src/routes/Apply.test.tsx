import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { axe } from "jest-axe";
import Apply from "@/routes/Apply";
import { APPLY_SERVICES } from "@/i18n/en/apply";
import { RESOURCE_SEED } from "@/data/resources.seed";

function renderApply() {
  return render(
    <MemoryRouter initialEntries={["/apply"]}>
      <Apply />
    </MemoryRouter>,
  );
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/first name/i), "Jordan");
  await user.type(screen.getByLabelText(/last name/i), "Rivera");
  await user.type(screen.getByLabelText(/date of birth/i), "1980-04-12");
  await user.type(screen.getByLabelText(/street address/i), "129 Cherry Street");
  await user.type(screen.getByLabelText(/^city/i), "Warner Robins");
  await user.type(screen.getByLabelText(/^state/i), "ga");
  await user.type(screen.getByLabelText(/zip code/i), "31088");
  await user.type(screen.getByLabelText(/phone number/i), "478-555-0100");
  await user.type(screen.getByLabelText(/people in your household/i), "3");
  await user.selectOptions(
    screen.getByLabelText(/how soon/i),
    "Within the next few weeks",
  );
}

afterEach(() => vi.restoreAllMocks());

describe("<Apply />", () => {
  it("starts at 0 of 11 required fields and counts up as they are filled", async () => {
    const user = userEvent.setup();
    renderApply();
    expect(screen.getByText(/of 11 required field/i)).toHaveTextContent(
      "0 of 11 required fields completed",
    );
    await user.type(screen.getByLabelText(/first name/i), "Jordan");
    expect(screen.getByText(/of 11 required field/i)).toHaveTextContent(
      "1 of 11 required field completed",
    );
  });

  it("says plainly that nothing is sent or saved, and never claims otherwise", () => {
    const { container } = renderApply();
    expect(
      screen.getByText(/nothing you type here is sent or saved/i),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(
      /stored securely|shared only with program staff|submit (your )?application/i,
    );
  });

  it("makes no network request and writes no browser storage when summarizing", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    renderApply();

    await fillRequired(user);
    await user.click(screen.getByLabelText(/health coverage/i));
    await user.click(screen.getByRole("button", { name: /show my summary/i }));

    expect(
      await screen.findByRole("heading", { level: 1, name: /your summary/i }),
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(document.cookie).toBe("");
  });

  it("moves focus to the summary heading when the summary appears", async () => {
    const user = userEvent.setup();
    renderApply();
    await fillRequired(user);
    await user.click(screen.getByLabelText(/food assistance/i));
    await user.click(screen.getByRole("button", { name: /show my summary/i }));

    const heading = await screen.findByRole("heading", {
      level: 1,
      name: /your summary/i,
    });
    expect(heading).toHaveFocus();
  });

  it("links each chosen service to its verified catalog programs, apply link first", async () => {
    const user = userEvent.setup();
    renderApply();
    await fillRequired(user);
    await user.click(screen.getByLabelText(/health coverage/i));
    await user.click(screen.getByRole("button", { name: /show my summary/i }));

    const medicaid = RESOURCE_SEED.find((r) => r.slug === "georgia-medicaid")!;
    const where = await screen.findByRole("region", { name: /where to apply/i });
    const applyLinks = await within(where).findAllByRole("link", {
      name: new RegExp(`apply on the official site for ${medicaid.name}`, "i"),
    });
    expect(applyLinks[0]).toHaveAttribute(
      "href",
      medicaid.applicationUrl ?? medicaid.url,
    );
    expect(applyLinks[0]).toHaveAttribute("rel", "noreferrer");
  });

  it("lists a program shared by two services only once", async () => {
    const user = userEvent.setup();
    renderApply();
    await fillRequired(user);
    // aging-and-disability-resource-connection is under both of these.
    await user.click(screen.getByLabelText(/services for older adults/i));
    await user.click(screen.getByLabelText(/^disability services/i));
    await user.click(screen.getByRole("button", { name: /show my summary/i }));

    const adrc = RESOURCE_SEED.find(
      (r) => r.slug === "aging-and-disability-resource-connection",
    )!;
    const where = await screen.findByRole("region", { name: /where to apply/i });
    await within(where).findAllByRole("link", { name: /official site for/i });
    expect(within(where).getAllByText(adrc.name)).toHaveLength(1);
  });

  it("only maps services to programs that exist in the catalog", () => {
    const slugs = new Set(RESOURCE_SEED.map((r) => r.slug));
    const missing = APPLY_SERVICES.flatMap((s) =>
      s.slugs.filter((slug) => !slugs.has(slug)).map((slug) => `${s.id}:${slug}`),
    );
    expect(missing).toEqual([]);
  });

  it("keeps the answers when you go back to edit", async () => {
    const user = userEvent.setup();
    renderApply();
    await fillRequired(user);
    await user.click(screen.getByLabelText(/health coverage/i));
    await user.click(screen.getByRole("button", { name: /show my summary/i }));
    await user.click(
      await screen.findByRole("button", { name: /go back and edit/i }),
    );
    expect(screen.getByLabelText(/first name/i)).toHaveValue("Jordan");
    expect(screen.getByLabelText(/health coverage/i)).toBeChecked();
  });

  it("has no axe-detectable accessibility violations (form and summary)", async () => {
    const user = userEvent.setup();
    const { container } = renderApply();
    expect((await axe(container)).violations).toEqual([]);

    await fillRequired(user);
    await user.click(screen.getByLabelText(/health coverage/i));
    await user.click(screen.getByRole("button", { name: /show my summary/i }));
    await screen.findByRole("heading", { level: 1, name: /your summary/i });
    expect((await axe(container)).violations).toEqual([]);
  });
});
