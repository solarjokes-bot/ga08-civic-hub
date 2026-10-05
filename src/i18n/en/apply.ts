/**
 * Copy for the /apply "application worksheet".
 *
 * Tone rules for this file: this page never sends, stores, or submits
 * anything, and the words must never suggest otherwise. No "your answers are
 * stored securely", no "shared with staff", no "submit your application" —
 * people may rely on those words when deciding how much to type.
 */
export const applyStrings = {
  eyebrow: "Apply",
  title: "Apply for government services",
  lede:
    "Get ready to apply. Fill in this worksheet by typing or by voice, and we'll show you where to apply for each service you pick.",
  privacy: {
    heading: "Nothing you type here is sent or saved",
    body:
      "This worksheet stays in your browser. It is not an application, and no one receives it. Closing or refreshing this page clears it. If you use the voice option, read the note under “Fill it out by voice” first. To actually apply, use the official links we show you at the end.",
  },
  progress_one: "{done} of {total} required field completed",
  progress_other: "{done} of {total} required fields completed",
  requiredMark: "required",

  sections: {
    about: "About you",
    address: "Your address",
    contact: "How to reach you",
    need: "What you need",
  },

  fields: {
    firstName: "First name",
    lastName: "Last name",
    dateOfBirth: "Date of birth",
    street: "Street address",
    unit: "Apt / unit (optional)",
    city: "City",
    state: "State",
    zip: "ZIP code",
    phone: "Phone number",
    email: "Email (optional)",
    householdSize: "People in your household",
    services: "What services do you need?",
    urgency: "How soon do you need help?",
    notes: "Anything else we should know? (optional)",
  },
  urgencyPlaceholder: "Choose one…",
  urgencyOptions: [
    "Right away — this is urgent",
    "Within the next few weeks",
    "Just planning ahead",
  ],
  submit: "Show my summary",

  voice: {
    heading: "Fill it out by voice",
    body:
      "Talk instead of type. The assistant asks one question at a time, you answer out loud, and your answer appears in the form on your screen. You can fix any answer by typing.",
    privacyHeading: "Before you start",
    // VERIFY: browser speech services differ. Chrome sends audio to Google's
    // servers; other browsers vary. Keep this wording "may", not "will".
    privacy:
      "Voice answers use your browser's built-in speech recognition. Depending on your browser, it may send what you say to the company that makes it (Chrome, for example, uses Google). This site never receives your voice and never saves your answers. If you'd rather not, just type.",
    commands: "Say “skip”, “repeat”, “go back”, or “stop” at any time.",
    start: "Start voice assistant",
    resume: "Continue voice assistant",
    again: "Start over with voice",
    stop: "Stop voice assistant",
    repeat: "Repeat question",
    skip: "Skip this question",
    readAloud: "Read the questions aloud",
    listening: "Listening — go ahead and answer.",
    heard: "We heard:",
    intro: "I'll ask one question at a time. Say skip, repeat, or stop any time.",
    stopped: "Voice assistant stopped. Your answers are still on the form.",
    paused:
      "I didn't hear anything, so I paused. Choose Continue when you're ready, or type your answers.",
    done: "That's everything I needed. Please check your answers, then choose Show my summary.",
    micBlocked:
      "Your browser is blocking the microphone. Allow it in the site permissions (the icon in the address bar) and try again, or type your answers.",
    noMic: "I couldn't find a microphone. Check that one is connected, or type your answers.",
    network:
      "Your browser's speech service couldn't be reached. Check your connection, or type your answers.",
    failed: "Voice isn't working right now. You can still fill in the form by typing.",
    unsupported:
      "This browser can't listen for voice answers. Try Chrome, Edge, or Safari — or fill in the form by typing.",
    guideLead: "Questions about a program?",
    guideCta: "Chat or call the guide",
  },

  summary: {
    title: "Your summary",
    privacyReminder:
      "This summary is only on this screen. Print it or save it as a PDF if you want to keep it — we don't keep a copy.",
    answersHeading: "Your answers",
    notAnswered: "Not answered",
    whereHeading: "Where to apply",
    whereIntro:
      "These are the official programs for the services you picked. Open a program to see what to bring, then apply on the agency's own site.",
    noServices:
      "You didn't pick a service, so there are no application links to show. Go back and choose at least one.",
    applyAt: "Apply on the official site",
    details: "What to bring and how it works",
    verified: "Last verified {date}",
    print: "Print or save as PDF",
    edit: "Go back and edit",
    confirm:
      "Always confirm details with the agency before you rely on them. This site is unofficial.",
  },
} as const;

/**
 * Service choices, each tied to catalog slugs. Slugs that aren't in the
 * catalog are dropped at render time, so a removed program can never become
 * a broken link — and nothing here is a program name or URL: those come from
 * the verified catalog records.
 */
export const APPLY_SERVICES: ReadonlyArray<{
  id: string;
  label: string;
  slugs: readonly string[];
}> = [
  {
    id: "health",
    label: "Health coverage (Medicaid, PeachCare)",
    slugs: ["georgia-medicaid", "peachcare-for-kids"],
  },
  {
    id: "food",
    label: "Food assistance (SNAP, WIC)",
    slugs: ["georgia-gateway", "georgia-wic"],
  },
  {
    id: "housing",
    label: "Housing or rent help",
    slugs: ["housing-choice-voucher", "georgia-housing-search"],
  },
  {
    id: "utilities",
    label: "Utility bill help (LIHEAP)",
    slugs: ["liheap-energy-assistance", "project-share-energy-help"],
  },
  {
    id: "jobs",
    label: "Jobs and training",
    slugs: ["georgia-department-of-labor", "worksource-georgia"],
  },
  {
    id: "veterans",
    label: "Veterans services",
    slugs: ["georgia-department-of-veterans-service", "carl-vinson-va-medical-center"],
  },
  {
    id: "family",
    label: "Child care or family services",
    slugs: ["dfcs-family-support"],
  },
  {
    id: "seniors",
    label: "Services for older adults",
    slugs: ["aging-and-disability-resource-connection", "social-security-administration"],
  },
  {
    id: "disability",
    label: "Disability services",
    slugs: ["georgia-vocational-rehabilitation-agency", "aging-and-disability-resource-connection"],
  },
  {
    id: "other",
    label: "Something else",
    slugs: ["georgia-211"],
  },
];
