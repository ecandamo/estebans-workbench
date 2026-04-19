#!/bin/bash

echo "
=== SESSION END CHECKLIST ===

Before finishing, make sure you have:

1. HANDOFF.md — Updated with:
   - Current Status
   - Last Session Changes
   - Files Touched
   - Open Issues
   - Next Best Step

2. Self-Improvement — Logged to .learnings/:
   - Any corrections or non-obvious fixes → LEARNINGS.md
   - Any errors or failed commands → ERRORS.md
   - Any missing capabilities → FEATURE_REQUESTS.md

If these are not done, do them now before stopping.
===========================" >&2

exit 0
