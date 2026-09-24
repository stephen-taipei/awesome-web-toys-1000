# HTTP CI follow-up

Date: 2026-09-24

This supplements [the initial audit](audit-2026-09-24.md).

The first full HTTP project-subpath run on commit `be8292342ad08aed232cb9e3fe22a0f27d5d41e1`, GitHub Actions run `35965095047`, passed static checks, four source tests and all 83 browser interaction regressions. Its all-toy startup sweep visited all 1,005 pages and failed on `069-theremin` only. Environment: Node.js 22.23.2, Python 3.12.3, Playwright 1.57.0, Chromium 143.0.7499.4.

The hover-triggered audio initialization can set `isPlaying` before the first frequency update. Initial `currentFreq = 0` then generates `hsla(-Infinity, ...)`, which `CanvasGradient.addColorStop` rejects. The browser event timing was different from the initial inline sweep, demonstrating why HTTP CI is retained as an independent gate.

## Additional repair

Initialize current/target frequency to the configured minimum and use a bounded, finite logarithmic coordinate helper for guides, trails and the indicator. The helper also handles zero/non-finite frequency and the valid slider boundary where both limits equal 500 Hz. Note-name conversion handles non-finite input and a normalized modulo.

Two deterministic source regressions execute the real script with a strict Canvas gradient double. Both fail against the unpatched source and pass against the repair. The source regression suite now contains six tests. The browser interaction matrix remains 83 cases, and the full startup sweep still covers all 1,005 toys.

The primary audit's local metrics describe its original tested snapshot. HTTP results are recorded in each workflow artifact. A first-run failure or a pending rerun must not be reported as successful. No test was skipped or relaxed to handle this finding.
