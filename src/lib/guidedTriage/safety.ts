/**
 * Distress / crisis detection for free-text answers in the guided flow.
 *
 * Project rule: emotionally distressed visitors must be routed to human
 * and crisis resources (988), NOT counseled by the assistant. This is a
 * deliberately BROAD, high-recall keyword screen — a false positive just
 * means we show 988 to someone who didn't strictly need it, which is an
 * acceptable trade. Both the offline engine and the Bedrock Lambda run
 * this before anything else; the Lambda's system prompt enforces the
 * same rule independently.
 *
 * Import-light so the Lambda can share it without the "@/" alias.
 */

const CRISIS_PATTERNS: RegExp[] = [
  /\bkill (myself|him|her|them|us)\b/i,
  /\b(kill|hurt|harm|cut) (myself|my ?self)\b/i,
  /\b(hurting|harming|cutting) myself\b/i,
  /\bsuicid(e|al)\b/i,
  /\bend (my|it all|my life)\b/i,
  /\b(want|going|plan(ning)?) to die\b/i,
  /\bi (don'?t|do not) want to (be here|live|wake up)\b/i,
  /\bno reason to (live|go on)\b/i,
  /\bbetter off (dead|without me)\b/i,
  /\boverdos(e|ed|ing)\b/i,
  /\b(take|took|taking) (all|a bunch of) (my|the) pills\b/i,
  /\bself[-\s]?harm\b/i,
  /\bhopeless\b/i,
  /\bcan'?t (go on|do this anymore|keep going)\b/i,
  // Immediate-danger / abuse signals — also route to a person now.
  /\b(being|getting) (beaten|abused|hit|attacked|hurt) (by|at)\b/i,
  /\b(he|she|they|my (husband|wife|partner|boyfriend|girlfriend|mom|dad|parent)) (hits|beats|hurts|threatens|is hurting|is threatening) me\b/i,
  /\b(i am|i'?m) (not safe|in danger|scared for my life|being threatened)\b/i,
  /\bdomestic (violence|abuse)\b/i,
  /\bhuman traffick/i,
];

export interface DistressScan {
  crisis: boolean;
  /** The pattern-source strings that matched — for debugging/tests only. */
  matched: string[];
}

/** Scan one or more free-text fragments for crisis language. */
export function scanForDistress(
  fragments: Array<string | undefined | null>,
): DistressScan {
  const matched: string[] = [];
  for (const frag of fragments) {
    if (!frag) continue;
    for (const re of CRISIS_PATTERNS) {
      if (re.test(frag)) matched.push(re.source);
    }
  }
  return { crisis: matched.length > 0, matched };
}
