/**
 * Minimal Amazon Lex V2 code-hook event/response types.
 *
 * Hand-written (not @types/aws-lambda) to keep the function's dependency
 * surface small. Covers only the fields this fulfillment hook reads and
 * writes. Verified against the Lex V2 "Lambda function input and response"
 * reference, 2026-09-08.
 */

export interface LexV2Slot {
  value?: {
    originalValue?: string;
    interpretedValue?: string;
    resolvedValues?: string[];
  };
}

export interface LexV2Intent {
  name: string;
  slots: Record<string, LexV2Slot | null>;
  state?: "InProgress" | "ReadyForFulfillment" | "Fulfilled" | "Failed";
  confirmationState?: "Confirmed" | "Denied" | "None";
}

export interface LexV2Event {
  sessionId: string;
  inputTranscript: string;
  invocationSource: "DialogCodeHook" | "FulfillmentCodeHook";
  inputMode?: "Text" | "Speech" | "DTMF";
  bot: { name: string; aliasId: string; localeId: string };
  sessionState: {
    sessionAttributes?: Record<string, string>;
    intent: LexV2Intent;
  };
  transcriptions?: Array<{ transcription: string; transcriptionConfidence?: number }>;
}

export interface LexV2Message {
  contentType: "PlainText" | "CustomPayload" | "SSML" | "ImageResponseCard";
  content?: string;
}

export interface LexV2Response {
  sessionState: {
    sessionAttributes?: Record<string, string>;
    dialogAction: {
      type: "Close" | "ElicitIntent" | "ElicitSlot" | "ConfirmIntent" | "Delegate";
      slotToElicit?: string;
    };
    intent: {
      name: string;
      state: "Fulfilled" | "Failed" | "InProgress";
    };
  };
  messages: LexV2Message[];
}

export function closeResponse(
  intentName: string,
  message: string,
  opts: {
    state?: "Fulfilled" | "Failed";
    sessionAttributes?: Record<string, string>;
  } = {},
): LexV2Response {
  return {
    sessionState: {
      sessionAttributes: opts.sessionAttributes,
      dialogAction: { type: "Close" },
      intent: { name: intentName, state: opts.state ?? "Fulfilled" },
    },
    messages: [{ contentType: "PlainText", content: message }],
  };
}
