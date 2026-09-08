/**
 * User-facing copy for the Live Support hub (/help, Phase 4).
 * Externalised for translation; react-i18next lands in Phase 6.
 * Reading level target: grade 6–8.
 */
export const helpStrings = {
  title: "Chat or call for help",
  intro:
    "Talk to our guide by text or voice — free, no phone number to dial, and no account needed. The guide answers first and can connect you to a person during staffed hours.",
  crisisNote:
    "In a crisis or feeling unsafe? Call or text 988 any time, or call 911 for an emergency.",
  hours: {
    heading: "When a person is available",
    body: "The automated guide is available any time. A live person is available {weekdays}, {timezone}. {weekend}.",
  },
  whatToExpect: {
    heading: "What to expect",
    items: [
      "Our guide asks what you need and points you to real services.",
      "It will not ask for your name, Social Security number, or immigration status.",
      "You can say or type “talk to a person” at any point.",
      "If you're in distress, it will connect you to crisis support right away.",
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
    start: "Call for help from your browser",
    startHint: "Uses your device's microphone. No phone number needed.",
    requestingMic:
      "Allow microphone access when your browser asks, so we can hear you.",
    connecting: "Connecting your call…",
    ringing: "Ringing… waiting for someone to pick up.",
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
      "Live chat and calling aren't connected in this preview. Once the site is fully set up they'll work here. In the meantime, call 2-1-1 (dial 211) for help finding local services, or use “Find a Resource”.",
    notConfigured:
      "Live chat and calling aren't switched on yet. In the meantime, call 2-1-1 (dial 211), or use “Find a Resource”.",
    startFailed:
      "Something went wrong starting that. Please try again in a moment, or call 2-1-1 (dial 211).",
  },
} as const;
