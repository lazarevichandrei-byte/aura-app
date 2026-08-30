# AURA Shadow Evaluation V1

## Purpose

Compare production Score V2 with Shadow Score V3 against the same completed real-world outcomes without allowing V3 to affect ranking.

## Pairing rule

An outcome is eligible only when it links to a persisted Score V2 snapshot and a Score V3 snapshot exists for the same viewer, candidate and `snapshot_at`. This prevents comparing models on different recommendation moments.

## Windows

Evaluation is reported independently for `24h`, `7d`, and `30d` completed outcome windows.

## Quality and risk signals

V1 quality success is intentionally conservative and observable: `matched OR chat_started OR shared_meet_activity`.

Risk is `blocked OR reported`.

No raw message text is used by the evaluator.

## Comparison

For each model, rows are sorted by score. The evaluator compares the quality rate in the top score quartile against the bottom score quartile. The difference is `qualityUplift`. It also measures risk rate in the top quartile.

The evaluator additionally reports mean signed and absolute V3−V2 score deltas.

## Guardrails

- Fewer than 40 paired outcomes: `INSUFFICIENT_DATA`.
- V3 can be marked `SHADOW_BETTER` only if its quality uplift beats V2 by at least 3 percentage points and its top-quartile risk rate is no more than 1 point worse.
- V3 is marked `ACTIVE_BETTER` if uplift is at least 3 points worse or top-quartile risk is at least 2 points worse.
- Otherwise: `INCONCLUSIVE`.
- Verdicts are diagnostic only. No endpoint in this feature changes production ranking, score versions, weights or feature flags.

## Promotion policy

Promotion of V3 requires manual review across mature windows, sufficient sample size, stable data coverage, no material safety regression, and a separate controlled rollout change. A shadow-evaluation verdict by itself is never a production switch.
