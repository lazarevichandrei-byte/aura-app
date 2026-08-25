# AURA Admin V1

AURA Admin V1 is a read-only internal operations surface for aggregate Event Foundation, Feature Snapshot, Score, shadow-ranking mode, and Outcome telemetry. It does not change ranking, eligibility, lifecycle, environment configuration, or product state.

## Access model

Set the server-only environment variable `AURA_ADMIN_TELEGRAM_IDS` to a comma-separated list of positive Telegram numeric IDs, for example `123456789,987654321`. Missing, empty, or malformed configuration produces an empty allowlist and denies everyone. Vercel configuration is not modified automatically.

`POST /api/admin/aura/overview` validates signed Telegram initData on the server and compares the validated identity with the allowlist. It never accepts a Telegram or admin identity field from the request body. Unauthorized requests receive a generic 404 response. The allowlist is never returned to the browser.

The `/admin/aura` page is not linked from BottomNav or public navigation. It requests only the protected aggregate API and shows a generic “Page not found” state when access is denied.

## Routes and response

- UI: `/admin/aura`
- API: `POST /api/admin/aura/overview`

The API accepts signed `initData`, a reporting timeframe (`24h`, `7d`, or `30d`, default `7d`), and a separate outcome horizon (`24h`, `7d`, or `30d`, default `24h`). Invalid filters fall back to defaults. It returns aggregate counts, timestamps, rates, buckets, and health states only—never IDs, feature payloads, event metadata arrays, or score reasons.

## Metrics and health thresholds

Events include last-hour/24-hour/reporting-window counts, latest receipt, and client/server split. Event health is `healthy` when the latest receipt is within 15 minutes, `stale` otherwise, and `empty` with no data.

Features include user/pair snapshots in 24 hours and their latest timestamp. Scores include 24-hour/reporting-window totals and fixed score buckets. Feature and score health are `healthy` when their latest snapshot is within 36 hours, `stale` when older, and `empty` with no data. These explicit thresholds are operational heuristics, not product-quality judgments.

Outcomes include totals per horizon, selected-window count, latest evaluation, null score links, and materialization coverage. For each horizon, coverage is materialized outcomes divided by completed eligible impression anchors within the reporting timeframe. Selected outcome health is `healthy` with eligible anchors and no gap, `gap` when completed anchors are missing, and `empty` when none are eligible.

## Score and outcome analysis

Score distribution uses `0-19`, `20-39`, `40-59`, `60-79`, and `80-100` buckets with counts and percentages. Score-to-outcome rows contain outcome count plus observed open, like, pass, match, chat-start, Meet-activity, block, and report rates for the selected completed outcome horizon.

All score/outcome analysis is explicitly labelled **Observational**. It does not measure accuracy and cannot establish that a score caused an exposure or outcome.

Ranking visibility shows the server interpretation of `AURA_RANKING_MODE`: only exact `enabled` enables it; missing/invalid values display `shadow`. V1 does not change the value. Phase 4 shadow diagnostics exist only in logs and are not persisted, so the page states that no historical diagnostics are available.

## Audit log and retention

Every successfully returned overview first inserts `AURA_ADMIN_OVERVIEW_VIEW` into `public.aura_admin_audit_log`. The row stores the validated Telegram ID, optional internal user FK, action, and only the selected timeframe/outcome-window filters. If audit insertion fails, the API does not return internal metrics.

The audit table has RLS enabled. Browser roles have no access. `service_role` has `SELECT`, `INSERT`, and `DELETE` for bounded 365-day cleanup; no `UPDATE`. No cleanup cron is created.

## Query performance and privacy

Aggregation is performed by the narrowly scoped service-role-only `get_aura_admin_overview_v1` RPC with a maximum 30-day reporting filter. Existing timestamp indexes serve events, features, and scores. V1 adds `(window_type, evaluated_at DESC)` for bounded outcome reporting plus the audit retention index.

The browser never directly reads internal tables. The overview contains no user/candidate UUIDs, message or report content, coordinates, raw features, score components/reasons, or arbitrary metadata. Pair debug is intentionally not included in Admin V1.

## Empty and failure states

Zero-valued distributions, coverage, and outcome rows are normal supported states. The UI distinguishes loading, unavailable metrics, denied access, and empty pipeline data without exposing server errors or stack traces.
