# AURA Ranking V1

AURA Ranking V1 is a conservative, server-only ordering layer over the existing Dating Core feed. It does not determine eligibility and it does not change lifecycle, cooldown, like, pass, or match behavior.

## Existing feed dependency

Home requests 30 candidates from `POST /api/discovery`. The route authenticates Telegram init data and calls `get_dating_feed`. That RPC remains the sole owner of onboarding/profile visibility, reciprocal preferences, distance, block, explicit exclusions, cycle state, and cooldown eligibility. Its existing order prioritizes an incoming pending cycle, then never-interacted candidates, then eligible prior cycles, with a daily-stable hash inside those groups.

Only the already-eligible RPC result is passed to AURA Ranking. Ranking neither reads nor creates candidates.

## Formula and bounds

At most the first 20 candidates are scored. The base list is divided into fixed consecutive windows of five. Candidates never cross their original window boundary.

Inside each window:

```text
existingOrderSignal = ((windowSize - 1 - position) / max(1, windowSize - 1)) * 100
finalRankSignal = 0.65 * existingOrderSignal + 0.35 * auraScore
```

Descending `finalRankSignal` determines the order. The original position is the deterministic tie-breaker. No randomness is used. A candidate can move at most four positions, and candidates after the 20-candidate bound remain untouched.

If any candidate in the bounded batch lacks a score, pure ranking returns the entire original order. This atomic behavior prevents partially scored lists from producing unstable ranking.

## Scoring execution

One request creates one `rankingSnapshotAt`. The service builds viewer features once, then builds one candidate snapshot and one directional pair snapshot per candidate. It computes Score V1 in memory and does not persist snapshots on the latency-critical Home path. For the current Home response of 30 this is exactly 1 viewer build, up to 20 candidate builds, and up to 20 pair builds; the final 10 retain their base order.

The enrichment has a 1500ms server-side timeout. An exception, contract mismatch, missing score, or timeout returns the original RPC order. Persistence is not required for the response.

## Shadow mode

Environment variable: `AURA_RANKING_MODE`.

- Missing, invalid, or `shadow`: calculate the proposed order but return the original feed order.
- `enabled`: return the bounded blended order.

Shadow logs contain only candidate/scored/failed counts, maximum and average absolute rank delta, and a latency bucket. Failure logs contain only candidate count, latency bucket, and a technical error category. No IDs, feature payloads, score components/reasons, safety values, init data, or profile data are logged.

## API and UI privacy

The discovery response shape is unchanged. It does not include AURA Score, components, reasons, feature snapshots, or safety data. The browser makes no score requests and performs no score calculation. Feature and score database grants remain service-role-only.

## State and performance assumptions

Home session caching, `consumedIds`, queue merge, refill-at-15 behavior, current card, photo index, impressions, swipe actions, match modal, empty state, and skeletons are unchanged. The service operates only on the bounded existing response rather than the user table or the full eligible population.

V1 uses parallel candidate/pair builds for the bounded batch and an atomic fallback. It does not cancel already-started database calls after the local timeout. It intentionally has no cross-request cache or batch RPC; those are future optimizations if production latency warrants them.
