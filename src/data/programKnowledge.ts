import type { CivicResource } from "../lib/resourceTypes";

/**
 * Deeper, program-specific knowledge merged into the catalog.
 *
 * WHY THIS EXISTS
 * The chat/voice guide is AI self-service — there is no human to escalate
 * to — so it has to be able to answer the follow-up questions a person
 * would otherwise ask an agent: how do I apply, what do I bring, what
 * does it cost, how long does it take. The base catalog entry only
 * describes *what a program is*; this adds *how to use it*.
 *
 * SOURCING RULE — read before adding anything
 * Every fact here must come from an official source. An EMPTY field is
 * always better than a guessed one: the guide is instructed to say "ask
 * the agency" when a detail is missing, but it will repeat a wrong detail
 * as fact. Do not infer income limits, dollar amounts, deadlines, or
 * document lists from similar programs.
 *
 * COVERAGE
 * Deliberately partial. The programs below are the highest-traffic ones
 * whose details were checked against the agency's own pages. Everything
 * else falls back to its `description` + `eligibilitySummary`, which the
 * guide already receives. Adding a program here is purely additive.
 *
 * // VERIFY: figures that change annually (income thresholds, premiums,
 * open-enrollment dates) need a re-check before a production launch —
 * they are marked inline.
 */
export const PROGRAM_KNOWLEDGE: Record<
  string,
  Pick<
    CivicResource,
    "howToApply" | "documentsNeeded" | "costNote" | "commonQuestions"
  >
> = {
  "georgia-gateway": {
    howToApply: [
      "Go to gateway.ga.gov and create an account, or sign in if you already have one.",
      "Pick the programs you want to apply for — one application can cover several.",
      "Fill in your household and income details, then upload or mail any documents they ask for.",
      "Check your account for messages; they will tell you if anything is missing.",
    ],
    costNote: "It is free to apply. There is no charge to use Georgia Gateway.",
    commonQuestions: [
      {
        question: "Can I apply for more than one program at once?",
        answer:
          "Yes. One Georgia Gateway application can cover SNAP (food stamps), Medicaid, PeachCare for Kids, TANF cash assistance, WIC, and child care help.",
      },
      {
        question: "Do I have to apply online?",
        answer:
          "No. You can also apply by phone at 1-877-423-4746, by mail, or in person at your county Division of Family and Children Services office.",
      },
      {
        question: "Can I check my application status?",
        answer:
          "Yes — sign in to your Georgia Gateway account to see your status, view notices, report changes, and renew benefits.",
      },
    ],
  },

  "liheap-energy-assistance": {
    howToApply: [
      "Find your local Community Action Agency — georgiacaa.org lists them by county, or call 1-877-423-4746.",
      "Contact that agency to ask how they take applications; some take appointments and some take walk-ins.",
      "Bring your documents to the appointment.",
      "If you are approved, the payment goes straight to your energy company, not to you.",
    ],
    documentsNeeded: [
      "Proof of income for everyone in the household for the past 30 days",
      "Social Security numbers for each person in the household",
      "Your most recent gas and electric bills",
      "Proof of citizenship or eligible immigration status",
    ],
    costNote: "There is no fee to apply.",
    commonQuestions: [
      {
        question: "When can I apply for heating help?",
        answer:
          "The heating program opens the first working day of December for people aged 65 and older or who are medically homebound. Everyone else can apply starting January 2. A separate cooling program opens in the spring.",
      },
      {
        question: "Do I have to own my home?",
        answer:
          "No. Renters can apply too, as long as you are the one responsible for paying the home's energy bill.",
      },
      {
        question: "Who decides if I get help?",
        answer:
          "Your local Community Action Agency decides, based on your household income and the funds they have left. Income generally has to be at or below 60% of Georgia's median income.",
      },
    ],
  },

  "georgia-legal-services-program": {
    howToApply: [
      "Start the online intake form at glsp.org/need-help, or call 1-833-457-7529.",
      "Answer their questions about your income, household, and legal problem.",
      "They will tell you whether they can take your case, or refer you elsewhere if not.",
    ],
    costNote:
      "Free. Georgia Legal Services is a nonprofit law firm and does not charge clients.",
    commonQuestions: [
      {
        question: "What kinds of problems do they help with?",
        answer:
          "Civil (non-criminal) problems — eviction and housing conditions, domestic violence and family safety, being denied public benefits, consumer and debt problems, and disaster recovery. They do not handle criminal cases.",
      },
      {
        question: "Do they cover my county?",
        answer:
          "They serve the 154 Georgia counties outside metro Atlanta. They do not take clients in Clayton, Cobb, DeKalb, Fulton, or Gwinnett — Atlanta Legal Aid covers those.",
      },
      {
        question: "Do I have to be low income?",
        answer:
          "Generally yes — households at or below 200% of the federal poverty level. People aged 60 and older may qualify regardless. They confirm when you apply.",
      },
    ],
  },

  "peachcare-for-kids": {
    howToApply: [
      "Apply through Georgia Gateway at gateway.ga.gov, or call 1-877-427-3224.",
      "You will need to show your child's citizenship or eligible immigration status and your household income.",
      "Verification of income is required at application and again each year at renewal.",
    ],
    // // VERIFY: income threshold is a percentage of the federal poverty
    // guidelines and is updated annually — re-check before launch.
    commonQuestions: [
      {
        question: "How old can my child be?",
        answer:
          "PeachCare covers children age 18 and under; coverage continues until their 19th birthday.",
      },
      {
        question: "How long does a decision take?",
        answer:
          "Processing can take up to 45 days, so it is worth applying as early as you can.",
      },
      {
        question: "What if my child might qualify for Medicaid instead?",
        answer:
          "PeachCare is for children who are not eligible for Medicaid. The same Georgia Gateway application checks both, so you do not need to guess which one to apply for.",
      },
    ],
  },

  "housing-choice-voucher": {
    howToApply: [
      "Check dca.georgia.gov/housing-choice-voucher to see whether a waiting list is currently open — they only open at certain times.",
      "Apply while the list is open; you cannot apply when it is closed.",
      "If you are selected from the list, the agency contacts you to verify income and household size.",
      "Once you have a voucher, you find your own place with a landlord who accepts it.",
    ],
    costNote:
      "You generally pay about 30% of your household income toward rent, and the voucher covers the rest up to a limit.",
    commonQuestions: [
      {
        question: "How long is the wait?",
        answer:
          "Waiting lists are common and can be long, and they are often closed to new applications. The agency cannot usually tell you an exact wait time.",
      },
      {
        question: "Who runs it where I live?",
        answer:
          "In most of Georgia the Department of Community Affairs runs it, but some cities and counties have their own housing authority with a separate list.",
      },
      {
        question: "Can I use it on any apartment?",
        answer:
          "Only with a landlord who accepts vouchers, and the unit has to pass an inspection and meet rent limits.",
      },
    ],
  },

  "georgia-211": {
    howToApply: [
      "Dial 2-1-1 from any phone, or search online at unitedwayga.org/ga211.",
      "Tell the specialist what you need — food, rent, utilities, health care, child care and more.",
      "They give you specific local referrals, including places this directory may not list.",
    ],
    costNote: "Free and confidential.",
    commonQuestions: [
      {
        question: "Do I have to give my name?",
        answer:
          "No. The service is confidential and you do not have to identify yourself.",
      },
      {
        question: "Is someone there at night?",
        answer:
          "2-1-1 is answered 24 hours a day in most of Georgia, and bilingual specialists are available.",
      },
    ],
  },

  "988-suicide-and-crisis-lifeline": {
    howToApply: [
      "Call or text 988 from any phone, or chat online at 988lifeline.org.",
      "You will reach a trained counselor. In Georgia, 988 is answered by the Georgia Crisis & Access Line.",
    ],
    costNote: "Free. No insurance needed.",
    commonQuestions: [
      {
        question: "Do I have to be suicidal to call?",
        answer:
          "No. 988 is for any kind of emotional distress, a mental health or substance use crisis, or if you are worried about someone else.",
      },
      {
        question: "Will they send police?",
        answer:
          "Most contacts are resolved by talking. Emergency services are only involved when there is an imminent risk to life.",
      },
      {
        question: "Is it available in Spanish?",
        answer: "Yes, and it is available 24 hours a day, every day.",
      },
    ],
  },

  "georgia-crisis-and-access-line": {
    howToApply: [
      "Call 1-800-715-4225 any time, day or night.",
      "Describe what is happening; they can talk you through it, help you find a counselor or treatment opening, or send a mobile crisis team to you.",
    ],
    costNote: "Free to call.",
    commonQuestions: [
      {
        question: "What is a mobile crisis team?",
        answer:
          "Trained staff who can come to where you are to help in person during a behavioral health crisis, rather than you having to travel.",
      },
      {
        question: "Is this the same as 988?",
        answer:
          "They are connected — 988 calls, texts and chats from Georgia are answered by this same crisis line.",
      },
    ],
  },

  "free-tax-preparation-vita": {
    howToApply: [
      "Use the IRS site locator or call 1-800-906-9887 to find a nearby site.",
      "Most sites run from late January through April and many need an appointment.",
      "Bring your documents; a certified volunteer prepares and files the return with you.",
    ],
    documentsNeeded: [
      "Photo ID",
      "Social Security cards or ITIN letters for everyone on the return",
      "All income forms, such as W-2s and 1099s",
      "Bank account and routing numbers if you want direct deposit",
    ],
    costNote: "Free. Volunteers are certified by the IRS and do not charge.",
    commonQuestions: [
      {
        question: "Who can use it?",
        answer:
          // // VERIFY: the income figure is set by the IRS each year.
          "VITA generally serves people making about $67,000 a year or less, people with disabilities, and people with limited English. A related program, Tax Counseling for the Elderly, focuses on people aged 60 and older.",
      },
      {
        question: "Can they check if I qualify for tax credits?",
        answer:
          "Yes — volunteers can check credits such as the Earned Income Tax Credit while preparing your return.",
      },
    ],
  },

  "georgia-department-of-veterans-service": {
    howToApply: [
      "Find your nearest Veterans Field Service Office at veterans.georgia.gov, or call 1-404-656-2300.",
      "Schedule an appointment with a Veterans Service Officer online.",
      "Bring your discharge paperwork and any medical records related to your claim.",
    ],
    costNote:
      "Free. Veterans Service Officers do not charge for claims assistance.",
    commonQuestions: [
      {
        question: "Can they help with an appeal?",
        answer:
          "Yes — they help with filing claims and with the appeals process if a claim is denied.",
      },
      {
        question: "Can family members get help?",
        answer:
          "Yes. They assist veterans, their families, caregivers, and survivors.",
      },
    ],
  },

  "georgia-my-voter-page": {
    howToApply: [
      "Go to mvp.sos.ga.gov to check your registration, find your polling place, or view your sample ballot.",
      "To register or update your address, use registertovote.sos.ga.gov.",
    ],
    costNote: "Free.",
    commonQuestions: [
      {
        question: "Who can register to vote in Georgia?",
        answer:
          "You must be a U.S. citizen and a Georgia resident, at least 17 and a half years old to register (18 to vote), and not serving a sentence for a felony conviction.",
      },
      {
        question: "How do I find where I vote?",
        answer:
          "My Voter Page shows your Election Day polling place and your county's early voting locations once you look up your registration.",
      },
    ],
  },

  "social-security-administration": {
    howToApply: [
      "Apply online at ssa.gov/apply, call 1-800-772-1213, or visit a local Social Security office.",
      "Creating a free 'my Social Security' account lets you handle most business online.",
    ],
    costNote:
      "Free to apply. Social Security never charges to file a claim — be wary of anyone who asks for a fee.",
    commonQuestions: [
      {
        question: "What is the difference between SSDI and SSI?",
        answer:
          "Social Security Disability Insurance is based on a qualifying disability plus recent work history. Supplemental Security Income is based on age or disability plus strict income and asset limits, and does not require a work history.",
      },
    ],
  },
};

/** Slugs that have been enriched — handy for coverage reporting. */
export const ENRICHED_SLUGS = Object.keys(PROGRAM_KNOWLEDGE);
