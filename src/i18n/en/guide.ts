/**
 * User-facing copy for the AI Guided Help wizard (Phase 3).
 * Externalised for future translation (Spanish first). react-i18next
 * lands in Phase 6; components import this object directly for now.
 * Reading level target: grade 6–8.
 */
export const guideStrings = {
  intro: {
    title: "Not sure what you need? Let's figure it out together",
    body: "Answer a few quick questions — there are usually 4 or 5 — and we'll point you to real services that fit your situation. You don't have to give your name, and nothing you type is saved with your identity.",
    start: "Start",
    privacyNote:
      "This tool is anonymous. We keep a count of the kinds of questions people ask so we can improve it, but not who asked them.",
    disclaimer:
      "This is general information, not legal, medical, or financial advice. Only the agency can tell you if you qualify for a program.",
  },
  progress: {
    label: "Question {current} of about {total}",
  },
  actions: {
    next: "Next",
    back: "Back",
    skip: "I'm not sure / skip this",
    startOver: "Start over",
    seeAllResources: "Browse all resources instead",
    otherTextLabel: "Or tell us in your own words",
    otherTextPlaceholder: "For example: “I’m behind on rent and got a notice”",
    chooseCounty: "Choose your county",
    submitAnswer: "Continue",
  },
  thinking: "Finding resources that fit…",
  results: {
    title: "Here's what we found for you",
    subtitle:
      "Ordered by how well they match what you told us. Every one links to the official agency — check the details there before you rely on them.",
    whyThisFits: "Why this fits",
    noneTitle: "We couldn't find a strong match",
    noneBody:
      "That doesn't mean there's no help — it means this tool isn't sure. Dial 2-1-1 to reach a person who can help you look.",
    talkToPerson: "None of these? Try the guide, or reach a person",
    talkToPersonBody:
      "Ask our automated guide by chat or voice for something more specific. To talk to a real person, dial 2-1-1 - a free Georgia helpline answered 24 hours a day.",
    restart: "Start the questions over",
  },
  crisis: {
    title: "Let's get you connected to someone right now",
    stillSeeResources: "I still want to see other resources",
    call911: "If you are in immediate danger, call 911.",
  },
} as const;
