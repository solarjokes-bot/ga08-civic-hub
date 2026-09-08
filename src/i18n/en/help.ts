/**
 * User-facing copy for the Live Support hub (/help, Phase 4).
 * Externalised for translation; react-i18next lands in Phase 6.
 * Reading level target: grade 6–8.
 *
 * IMPORTANT: this service is AI self-service only — there are no human
 * agents. Nothing here may promise, imply, or hint that a person will
 * join the chat or answer the call. Where someone wants a human, point
 * them at lines that really are staffed: 2-1-1, 988, or the agency's own
 * number.
 */
export const helpStrings = {
  title: "Chat or call for help",
  intro:
    "Ask our automated guide by text or voice — free, no phone number to dial, and no account needed. It searches the same directory as the rest of this site and points you to real programs.",
  crisisNote:
    "In a crisis or feeling unsafe? Call or text 988 any time, or call 911 for an emergency.",
  automated: {
    heading: "This is an automated guide",
    body: "There is no call centre behind this service — you're talking to software, any time of day. It can look things up and explain them, but it can't decide whether you qualify or act on your behalf.",
    wantAPerson:
      "Want to talk to a real person? Dial 2-1-1 — a free, confidential Georgia helpline answered 24 hours a day — or call the agency for the program you need directly. Their numbers are on every resource page.",
  },
  whatToExpect: {
    heading: "What to expect",
    items: [
      "The guide asks what you need and points you to real services.",
      "It will not ask for your name, Social Security number, or immigration status.",
      "It can't tell you whether you qualify — only the agency can do that.",
      "If you're in distress, it will give you crisis numbers straight away.",
    ],
  },
  chat: {
    heading: "Chat by text",
    start: "Start a chat",
    starting: "Starting your chat…",
    connected: "You're connected. Type your message below.",
    ended: "This chat has ended.",
    inputLabel: "Type your message",
    sendLabel: "Send message",
    endLabel: "End chat",
    agentTyping: "The guide is typing…",
    restart: "Start a new chat",
    transcriptLabel: "Chat messages",
    you: "You",
    guide: "Guide",
  },
  voice: {
    heading: "Call from your browser",
    start: "Call the guide from your browser",
    startHint: "Uses your device's microphone. No phone number needed.",
    requestingMic:
      "Allow microphone access when your browser asks, so we can hear you.",
    connecting: "Connecting your call…",
    ringing: "Connecting you to the guide…",
    connected: "Connected",
    ended: "Call ended.",
    callAgain: "Call again",
    muteLabel: "Mute my microphone",
    unmuteLabel: "Unmute my microphone",
    hangUpLabel: "End call",
    timerLabel: "Call length",
    micDeniedHelp:
      "Your browser is blocking the microphone. Open the site permissions (the icon in the address bar), allow the microphone, and try again — or use chat instead.",
  },
  unavailable: {
    offline:
      "The guide isn't connected in this preview. Once the site is fully set up it'll work here. In the meantime, call 2-1-1 (dial 211) to reach a person who can help you find local services, or use “Find a Resource”.",
    notConfigured:
      "The guide isn't switched on yet. In the meantime, call 2-1-1 (dial 211), or use “Find a Resource”.",
    startFailed:
      "Something went wrong starting that. Please try again in a moment, or call 2-1-1 (dial 211).",
  },
} as const;
