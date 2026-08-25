# AURA Score V1

AURA Score V1 is an internal, deterministic heuristic product-ranking signal, not compatibility truth. It is shadow/offline only: no Dating Feed, Home, Likes, Meet, Chat, or recommendation ordering reads it.

## Contract and reproducibility

- Score version: `1` (immutable semantics).
- Required feature schema: Feature Snapshots V1 (`1`).
- Input: viewer user features, candidate user features, directional `viewer -> candidate` pair features, feature schema version, and one explicit `snapshotAt`.
- Output: integer total, six integer components, stable reason codes, relation flags, versions, and the unchanged timestamp.
- Formula: `clamp(20 + compatibility + interest + reciprocity + engagement + freshness + safety, 0, 100)`, followed by the cooldown cap when applicable.
- The pure core performs no database/network/time lookup and uses no randomness. Identical input produces structurally identical output.

## Exact components and weights

### Compatibility (`0..20`)

- Same city: +10 when explicitly true; false/null is 0.
- Absolute age difference: 0–2 +10, 3–5 +7, 6–10 +3, over 10 or null 0.
- Cap: 20. No preferred-age or gender assumptions are made.

### Interest (`0..25`)

- Prior viewer like: +10.
- Impressions: +1 when `impressions_30d > 0`, plus +1 when `impressions_7d > 1`; max +2. This uses the 30-day count as the base and the 7-day count only as a recency/density bonus.
- Opens: `min(6, opens_30d * 2)`, plus +1 if `opens_7d > 0`.
- Returns: `min(4, return_to_profile_30d * 2)`.
- Maximum dwell bucket: none/under 2s +0, 2–5s +1, 5–15s +3, 15–30s +5, 30s+ +7.
- Cap: 25. The cap provides diminishing returns and prevents correlated observation/open/return/dwell signals from dominating.

### Reciprocity (`0..20`)

- Prior candidate like: +12.
- Both directional like flags present: +4 mutual-like bonus.
- Shared Meets: `min(5, shared_meet_count_90d * 2)`.
- Directional creator/guest Meet relations: +1 each, max +2.
- Prior match contributes 0 and is exposed as a flag/reason. Rematch semantics belong to Dating Core.
- Cap: 20.

### Engagement (`0..15`)

Each user receives `0..6` bounded points:

- Active days in 30d: 0 days +0, 1–2 +1, 3–7 +2, 8+ +3.
- Active days in 7d: +1 at 2+ days.
- Any chat started or message metadata in 30d: +1 total (volume does not scale).
- Any Meet create/request/accept/participation in 30d: +1 total.

When both per-user values are at least 3, add +3. Component cap: 15. Message bodies are not inputs.

### Freshness (`0..10`)

- Latest directional impression: none/30d+ +0, 7–30d +1, 1–7d +2, 1–24h +3, under 1h +4.
- Each user's activity age: 30d+ +0, 7–30d +1, 3–7d +2, 1–3d or under 1d +3.
- Cap: 10.

### Safety (`-10..0`)

- Per user, `blocks_created_90d`: −1 each, capped at −3.
- Per user, `reports_created_90d`: −1 each, capped at −2.
- Combined cap: −10.

These fields mean actions the user created—not actions received and not guilt. V1 uses them only as a small 90-day stability/spam-like penalty. It does not expose a safety score to users, read report content, or assign a permanent label.

## Relation guards

- `cooldown_active`: returned as `cooldownActive`; total is capped at 55, but still computed. This does not determine eligibility.
- `current_cycle_status`: returned unchanged as metadata.
- `prior_match`: returned as `priorMatch`, with no contribution.
- `has_existing_direct_chat`: returned as `existingChat`, with no contribution.
- `prior_reject`: emits a zero-contribution reason; no Dating Core cooldown/rejection rule is duplicated.

## Stable reason codes

`SAME_CITY`, `AGE_CLOSE`, `AGE_COMPATIBLE`, `VIEWER_LIKED`, `CANDIDATE_LIKED`, `MUTUAL_LIKE`, `PROFILE_IMPRESSIONS`, `PROFILE_OPENS`, `REPEATED_PROFILE_OPEN`, `RETURNED_TO_PROFILE`, `LONG_DWELL`, `RECENT_INTERACTION`, `SHARED_MEET_ACTIVITY`, `BOTH_ACTIVE`, `LOW_RECENT_ACTIVITY`, `CREATED_BLOCK_ACTIVITY`, `CREATED_REPORT_ACTIVITY`, `COOLDOWN_ACTIVE`, `PRIOR_MATCH`, `EXISTING_CHAT`, `PREVIOUS_REJECT`.

Each emitted reason contains only `{code, component, contribution}`. Localization and user-facing copy are intentionally out of scope.

## Persistence and retention

`public.aura_match_score_snapshots` is directional, append-only, and idempotent on `(viewer_user_id, candidate_user_id, feature_schema_version, score_version, snapshot_at)`. Duplicate inserts read the existing row; historical rows are never updated. JSON type and score-range constraints are enforced in SQL.

RLS is enabled. `PUBLIC`, `anon`, and `authenticated` receive no privileges. `service_role` receives only `SELECT`, `INSERT`, and `DELETE`; never `UPDATE`. `cleanup_aura_match_score_snapshots` deletes bounded batches older than 180 days and has no cron.

The server-only orchestrator normalizes one timestamp once, builds all three feature sets with that timestamp, persists the feature snapshots, computes the pure score, and persists it.

## Privacy and limitations

V1 uses no raw message or report body, bio semantics, coordinates/address, embeddings, sensitive inference, or inferred sexuality, religion, politics, or health. Same-city equality and age difference are explicit profile fields already represented in Feature Snapshots V1.

Known limitations: hand-tuned weights are not calibrated probabilities; current profile age/city depend on the persisted feature snapshot for historical reproducibility; reports/blocks received are unavailable and are not invented; no preference-aware compatibility is inferred; the diagnostic distribution is fixture-based rather than production calibration.
