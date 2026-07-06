# FRI - Fin Resolution Intelligence

A diagnostic tool that audits Fin AI agent conversations to separate genuine resolutions from assumed ones - and tells you exactly what to fix.

Built as a Day 30 deliverable prototype for the Intercom Senior FDE interview.

---

## The problem

Fin marks a conversation resolved when it ends without escalation. That's not the same as the customer's problem being solved. G2 reviews from Intercom customers confirm this repeatedly - "assumed resolved" conversations still cost $0.99 each, and there's no native tooling to tell you which ones failed or why.

FRI reads your conversation export, runs it through a 4-pass Claude analysis, and gives you:

- A genuine vs. reported resolution rate split
- Every failure categorised (KB gap, missing primitive, ambiguous query, instruction conflict, out-of-scope)
- A knowledge base health score
- A prioritised fix playbook with implementation sketches
- A deployment score (0–100) with a letter grade (heuristic weighting — see [How to read the numbers](#how-to-read-the-numbers))
- Product signal for missing Fin primitives, structured as R&D feedback

---

## Running locally

```bash
npm install
```

Create `.env.local` (copy `.env.example` and paste your real key):

```
ANTHROPIC_API_KEY=your-key-here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Usage

**Demo mode** - click "Load sample dataset" on the landing page. Runs through 20 pre-classified conversations instantly with no API call. Shows the full results dashboard including deployment score, ROI numbers, failure chart, KB health, and fix playbook.

**Live mode** - upload a CSV export of Fin conversations. Expected columns:

| Column | Description |
|---|---|
| `id` | Conversation ID |
| `transcript` | Full conversation text |
| `resolved` | `true` / `false` |
| `csat_score` | 1–5 or blank |
| `reopened` | `true` / `false` |
| `follow_up_within_24h` | `true` / `false` |

Maximum 100 conversations per run. Analysis takes ~60–90 seconds depending on volume.

---

## How analysis works

Four Claude passes run against the uploaded conversations:

1. **Classification** - each conversation is tagged with a failure category and a genuine/assumed resolution verdict
2. **KB health** - knowledge base gaps are scored and ranked by frequency
3. **Playbook** - fix actions are generated, ranked by impact vs. effort, with implementation sketches for missing-primitive items
4. **Roadmap signal** - missing Fin primitives are structured as R&D product feedback with estimated build complexity and customer impact

Passes 3 and 4 run in parallel once pass 2 completes.

---

## How to read the numbers

Be honest about what these metrics are and aren't:

- **Every quality metric is Claude-graded, with no labelled ground truth.** The genuine-vs-assumed resolution split, confidence scores, and KB health scores are all Claude's own judgement of Claude-adjacent output. Nothing here is validated against a human-labelled dataset, so treat them as *LLM-assessed signals*, not measured accuracy.
- **The deployment score is an uncalibrated heuristic.** It is a fixed-weight formula (`genuineRate·0.5 + kbHealth·0.3 + 20 − missingPrimitive%·25 − conflict%·20`, clamped to 0–100). The weights were chosen by hand, not fitted to outcomes — the letter grade is a directional summary, not a benchmark.
- **ROI figures are illustrative.** They assume the sample volume scales monthly, a flat $0.99/conversation, ~70% of wasted spend as recoverable, and a fixed ~40hr × £100/hr implementation cost. Change the assumptions and the numbers change.

---

## Stack

- Next.js 16 (App Router)
- Tailwind CSS
- Recharts
- Anthropic SDK (`claude-sonnet-4-20250514`)

---

## Deployment

Push this repository to GitHub, then deploy on Vercel. Add `ANTHROPIC_API_KEY` as an environment variable in the Vercel project settings.

No conversation data is persisted - everything is analysed in-memory and discarded when the session ends.
