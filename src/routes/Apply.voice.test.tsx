import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { axe } from "jest-axe";
import Apply from "@/routes/Apply";

/** Stands in for the browser's speech recognizer; tests "speak" into it. */
class FakeRecognition {
  static instances: FakeRecognition[] = [];
  lang = "";
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  started = false;
  aborted = false;
  constructor() {
    FakeRecognition.instances.push(this);
  }
  start() {
    this.started = true;
  }
  abort() {
    this.aborted = true;
  }
}

const active = () => FakeRecognition.instances.filter((r) => r.started && !r.aborted).at(-1)!;

function hear(transcript: string) {
  act(() => active().onresult?.({ results: [[{ transcript }]] }));
}

function renderApply() {
  return render(
    <MemoryRouter initialEntries={["/apply"]}>
      <Apply />
    </MemoryRouter>,
  );
}

const question = () => screen.getByText(/^Question \d+ of 14\./);

beforeEach(() => {
  FakeRecognition.instances = [];
  vi.stubGlobal("SpeechRecognition", FakeRecognition);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("<Apply /> voice assistant", () => {
  it("says so plainly when the browser can't do speech recognition", () => {
    vi.unstubAllGlobals();
    renderApply();
    expect(screen.getByText(/can't listen for voice answers/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /start voice assistant/i }),
    ).not.toBeInTheDocument();
  });

  it("discloses that the browser's speech service may hear the audio, before starting", () => {
    renderApply();
    expect(screen.getByText(/may send what you say to the company/i)).toBeInTheDocument();
    expect(screen.getByText(/never receives your voice/i)).toBeInTheDocument();
    expect(FakeRecognition.instances).toHaveLength(0);
  });

  it("interviews you question by question and fills in the form", async () => {
    const user = userEvent.setup();
    renderApply();
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));

    expect(question()).toHaveTextContent("What is your first name?");
    expect(screen.getByRole("button", { name: /stop voice assistant/i })).toHaveFocus();

    hear("Jordan");
    hear("Rivera");
    hear("April 12th, 1980");
    hear("129 Cherry Street");
    hear("skip"); // unit is optional
    hear("Warner Robins");
    hear("Georgia");
    hear("3 1 0 8 8");
    hear("478 555 0100");
    hear("skip"); // email is optional
    hear("three");
    hear("health coverage and food");
    hear("within a few weeks");
    hear("skip"); // notes are optional

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Jordan");
    expect(screen.getByLabelText(/last name/i)).toHaveValue("Rivera");
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue("1980-04-12");
    expect(screen.getByLabelText(/street address/i)).toHaveValue("129 Cherry Street");
    expect(screen.getByLabelText(/^city/i)).toHaveValue("Warner Robins");
    expect(screen.getByLabelText(/^state/i)).toHaveValue("GA");
    expect(screen.getByLabelText(/zip code/i)).toHaveValue("31088");
    expect(screen.getByLabelText(/phone number/i)).toHaveValue("478-555-0100");
    expect(screen.getByLabelText(/people in your household/i)).toHaveValue(3);
    expect(screen.getByLabelText(/health coverage/i)).toBeChecked();
    expect(screen.getByLabelText(/food assistance/i)).toBeChecked();
    expect(screen.getByLabelText(/housing or rent/i)).not.toBeChecked();
    expect(screen.getByLabelText(/how soon/i)).toHaveValue("Within the next few weeks");

    expect(screen.getByText(/of 11 required field/i)).toHaveTextContent(
      "11 of 11 required fields completed",
    );
    expect(screen.getByText(/that's everything i needed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start over with voice/i })).toHaveFocus();
  });

  it("re-asks when an answer can't be understood, then gives up and moves on", async () => {
    const user = userEvent.setup();
    renderApply();
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));
    hear("Jordan");
    hear("Rivera");

    hear("sometime in spring");
    expect(screen.getByText(/couldn't understand that date/i)).toBeInTheDocument();
    hear("no idea");
    hear("whenever");
    // Third miss: leaves the field for the user to type and moves on.
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue("");
    expect(question()).toHaveTextContent(/street address/i);
  });

  it("will not skip a required question", async () => {
    const user = userEvent.setup();
    renderApply();
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));
    hear("skip");
    expect(screen.getByText(/that question is required/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toHaveValue("");
  });

  it("skips questions you already answered by typing", async () => {
    const user = userEvent.setup();
    renderApply();
    await user.type(screen.getByLabelText(/first name/i), "Jordan");
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));
    expect(question()).toHaveTextContent("What is your last name?");
  });

  it("goes back and repeats on command", async () => {
    const user = userEvent.setup();
    renderApply();
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));
    hear("Jordan");
    expect(question()).toHaveTextContent("last name");
    hear("go back");
    expect(question()).toHaveTextContent("first name");
    hear("repeat");
    expect(question()).toHaveTextContent("first name");
  });

  it("stops on command, keeps the answers, and can continue where it left off", async () => {
    const user = userEvent.setup();
    renderApply();
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));
    hear("Jordan");
    hear("stop");

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Jordan");
    expect(screen.getByText(/voice assistant stopped/i)).toBeInTheDocument();
    const resume = screen.getByRole("button", { name: /continue voice assistant/i });
    expect(resume).toHaveFocus();

    await user.click(resume);
    expect(question()).toHaveTextContent("What is your last name?");
  });

  it("pauses after repeated silence and tells you why", async () => {
    const user = userEvent.setup();
    renderApply();
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));
    for (let i = 0; i < 3; i++) {
      act(() => {
        const rec = active();
        rec.onerror?.({ error: "no-speech" });
        rec.onend?.();
      });
    }
    expect(screen.getByText(/i didn't hear anything, so i paused/i)).toBeInTheDocument();
  });

  it("explains a blocked microphone", async () => {
    const user = userEvent.setup();
    renderApply();
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));
    act(() => {
      const rec = active();
      rec.onerror?.({ error: "not-allowed" });
      rec.onend?.();
    });
    expect(screen.getByText(/browser is blocking the microphone/i)).toBeInTheDocument();
  });

  it("stops listening when you leave the page or open the summary", async () => {
    const user = userEvent.setup();
    const { unmount } = renderApply();
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));
    const rec = active();
    unmount();
    expect(rec.aborted).toBe(true);
  });

  it("adds no network request or storage write of its own", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    renderApply();
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));
    hear("Jordan");
    hear("Rivera");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(document.cookie).toBe("");
  });

  it("has no axe-detectable violations while idle or running", async () => {
    const user = userEvent.setup();
    const { container } = renderApply();
    expect((await axe(container)).violations).toEqual([]);
    await user.click(screen.getByRole("button", { name: /start voice assistant/i }));
    hear("Jordan");
    expect((await axe(container)).violations).toEqual([]);
  });
});
