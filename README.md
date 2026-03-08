# Community Guardian - Privacy-First Safety Digest

**Candidate Name:** Rohit Kannan
**Scenario Chosen:** Community Safety & Digital Wellness
**Estimated Time Spent:** 6 hours

---

## Problem Understanding

Individuals struggle to keep up with safety information scattered across news sites and social media, leading to alert fatigue and unnecessary anxiety without actionable steps. Community Guardian addresses this by:

1. Aggregating local safety reports into a single dashboard
2. Filtering noise: AI classifies, prioritizes by severity, and removes duplicate/irrelevant content
3. Reducing anxiety: alarmist reports are automatically rewritten into calm, factual language
4. Providing actionable steps: each incident includes recommended actions specific to its category
5. Enabling natural language queries: users ask questions instead of scrolling through incidents

### Target Audiences Served

| Audience | How Community Guardian Helps |
|---|---|
| **Neighborhood Groups** | Centralized incident feed without social media toxicity, with calm tone filtering |
| **Remote Workers** | Network security alerts (phishing, suspicious Wi-Fi) with defense checklists |
| **Elderly Users** | Simplified Q&A interface so they can ask a question instead of browsing complex feeds |

---

## Architecture and Design

```
src/
├── domain/incidents/          # Core types: Incident, Category, Severity
├── infrastructure/
│   ├── ai/                    # AIProvider interface + AnthropicAIProvider
│   ├── rules/                 # Rule-based fallback: classification, severity, actions, calm rewrite, Q&A
│   └── repositories/          # JSON file repository 
├── lib/
│   ├── aiFactory.ts           # Provider factory with ResilientAIProvider wrapper
│   └── validation.ts          # Zod schemas for input validation
├── app/
│   ├── api/incidents/         # REST API: GET, POST, PATCH
│   ├── api/ask/               # Natural language Q&A endpoint
│   └── page.tsx               # Dashboard UI
├── components/                # React components: form, list, filters, Q&A panel
└── __tests__/                 # Vitest test suite
```

### Key Design Decisions

**Layered architecture** - I split the codebase into domain, infrastructure, and API layers so that swapping parts out is straightforward. For example, the `IncidentRepository` is an interface. Right now it reads/writes JSON files, but switching to SQLite or Postgres would only touch one file. Same idea with the AI provider.

**Resilient AI with automatic fallback** - The challenge requires a fallback when AI is unavailable, so I built a `ResilientAIProvider` that wraps every Anthropic call in a try-catch. If Claude goes down or the API key expires, the app keeps working on the rule engine without any user-facing errors. I also added a `classifiedBy` field on each incident so it's transparent whether AI or the rule engine made the decision. Felt important for trust.

**JSON file storage over a database** - Given the 4-6 hour timebox, I went with a flat JSON file instead of setting up a database. It keeps the setup simple (no migrations, no Docker) and the repository interface means upgrading later is a clean swap.

**Zod for input validation** - I chose Zod over manual validation because it gives both runtime type checking and TypeScript type inference from the same schema. Every API endpoint validates inputs before anything else happens, so malformed data never reaches the classification or storage layers.

**Privacy by default** - The app makes zero external calls unless you explicitly set an API key. No user accounts, no cookies, no analytics. This felt like the right call for a safety app where the target audience needs to trust the platform.

**Rule engine as a first-class citizen** - Rather than treating the rule engine as a minimal stub, I built it out with 60+ keyword patterns, multi-factor severity scoring, tone-matching word replacement, and keyword-based Q&A. This way the app is genuinely useful even without an API key, and serves as a proper fallback when AI is unavailable.

---

## AI Integration

### Capabilities

| Feature | What It Does | Rule Fallback |
|---|---|---|
| **Classification** | Assigns category (10 types) + severity (4 levels) | Keyword scoring with confidence weighting |
| **Calm Tone Rewriting** | Rewrites alarmist reports into factual language | Strips punctuation, lowercases ALL CAPS, replaces alarmist words |
| **Natural Language Q&A** | Answers questions about incidents conversationally | Keyword matching + relevance scoring |
| **Recommended Actions** | Category-specific safety checklists | Template-based action lookup |

### AI Provider: Anthropic Claude

When `AI_PROVIDER=anthropic` is set with a valid API key:
- **Classification** uses structured JSON prompts with enum validation
- **Calm Rewriting** uses system instructions to produce natural, reassuring language
- **Q&A** provides conversational answers with relevant incident highlighting

### Fallback: Rule-Based Engine

When `AI_PROVIDER=rules` (default) or when the AI provider fails:
- **Classification**: Keyword patterns across 10 categories, weighted scoring
- **Severity**: Multi-factor scoring (keyword analysis + category base severity)
- **Calm Rewriting**: Text normalization that strips `!!!`, lowercases `ALL CAPS`, and replaces alarmist phrases
- **Q&A**: Keyword extraction + incident scoring, natural language response construction

The fallback is always available!

---

## Core Flow

The main user flow covers creating, viewing, updating, and searching incidents.

1. **Create**: Users submit an incident through the form with a title, description, and location. The AI (or rule engine) automatically classifies the category and severity, then generates a calmer version of the description.
2. **View**: The dashboard shows all incidents as cards with severity badges, category tags, descriptions (with a toggle to view the original wording), and recommended actions.
3. **Update**: The `PATCH /api/incidents/:id` endpoint lets you change status (open, investigating, resolved, dismissed), category, severity, or description.
4. **Search/Filter**: You can filter by category, severity, or do a free-text search across title, description, and location.
5. **Q&A**: There's a natural language question box at the top of the feed. Ask something and relevant incidents get highlighted.

---

## Security

I made sure every API endpoint validates its inputs before doing anything else.

- **Input validation**: All inputs go through Zod schemas with enforced length limits (title: 3-200 chars, description: 10-2000, location: 1-200) and enum-only values for category and severity. Invalid data gets a 400 response with clear error details.
- **No API keys in code**: Keys live in `.env.local` which is gitignored. The `.env.example` file shows what's needed without exposing anything.
- **No user data collection**: No accounts, no cookies, no analytics, no external tracking
- **Synthetic data only**: The seed dataset is 10 hand-crafted incidents, so no scraped or real personal data.
- **Graceful degradation**: AI failures never crash the app, since the `ResilientAIProvider` catches all errors and falls back to the rule engine.

---

## Tests

There are 11 tests in `src/__tests__/incidents.test.ts`, run with `npm test`.

**Happy path tests** check that the core flow works end-to-end:
- Validates and classifies a burglary report with the correct category, severity, and recommended actions
- Generates a calm rewrite that strips out alarmist language
- Answers a Q&A query using keyword matching and returns the right incident IDs

**Edge case tests** make sure bad input gets caught:
- Rejects titles shorter than 3 characters
- Rejects descriptions shorter than 10 characters
- Rejects empty locations
- Rejects invalid category and severity enum values
- Validates update schema with both valid and invalid status values
- Classifies unrecognizable text as OTHER with low confidence
- Handles an empty incidents array in Q&A without crashing

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Full-stack framework for both API routes and React UI |
| **TypeScript** | Type safety across domain, infrastructure, and UI |
| **Tailwind CSS** | Styling for the dashboard |
| **Zod** | Runtime input validation |
| **Anthropic Claude** | AI features|
| **Vitest** | Unit and integration testing |

---

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- (Optional) Anthropic API key for AI-powered features

### Run Commands
```bash
npm install
cp .env.example .env.local
# (Optional) Set AI_PROVIDER=anthropic and ANTHROPIC_API_KEY in .env.local
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Test Commands
```bash
npm test
```

---

## AI Disclosure

- **Did you use an AI assistant (Copilot, ChatGPT, etc.)?** Yes, I used an AI assistant!
- **How did you verify the suggestions?** Every change was verified through build checks, manual testing via the dashboard and curl, and automated tests (`npm test`). I reviewed AI-generated code for correctness and security before integrating it. I believe that the full use of AI leads to complete "Vibe-coding" and makes software prone to many errors (security and performance-wise). However, utilizing it as a supporting tool increased my productivity by planning different features, unit testing, and teaching me how some tech works!
- **Give one example of a suggestion you rejected or changed:** The initial suggestion for tone rewriting was to just do simple string replacement. I rejected that and went with a multi-pattern approach (all caps normalization, alarmist word substitution, punctuation cleanup) that works as a proper fallback, complemented by AI for proper rewriting.

---

## Tradeoffs and Prioritization

### What did you cut to stay within the 4-6 hour limit?
- **Database**: I used JSON file storage, since it was easy to implement and saved time.
- **Authentication**: Since there are no user accounts, a big part of security was cut, and that helped!
- **Real-time updates**: The dashboard requires a manual refresh for now.
- **Digest panel and similar incidents UI**: The backend methods exist (`generateDigest`, `findSimilar`) but I didn't have time to wire them into the UI.

### What would you build next if you had more time?
1. A safety digest panel with weekly/daily AI-generated trend summaries (This would be really cool since AI would find patterns in the user reports and can potentially send out notifs or alerts)
2. Similar incident detection to show related reports
3. A notification system for high-severity incidents
4. Encrypted "Safe Circles" for emergency status sharing between trusted contacts
5. Database migration to SQLite or Postgres for concurrent access

### Known Limitations
- JSON file storage doesn't support concurrent writes
- Location is free-text, not geocoded, so there are no proximity-based alerts
- The rule engine has limited accuracy for ambiguous reports (the AI provider handles these much better)
- No API rate limiting on endpoints

---

## Video Presentation

Link: https://youtu.be/FmUh00vYJEs?si=8g7EX111cYuxUxXz


