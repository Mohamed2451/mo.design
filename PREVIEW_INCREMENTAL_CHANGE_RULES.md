# Mo Design — approved incremental-edit workflow (2026-10-21)

## Immutable reference commit
Original live baseline commit: `597aa3c85379fabdab8ffccc08adb36a60a1ffa6`.
Backup branch: `mo-design-baseline-preserved-20261021` (do not alter).
Working preview branch: `mo-design-small-edits-preview-20261021`.

## User's explicit instructions
- Preserve the original homepage, project pages, animations, identity and **original admin panel** as they are now.
- No redesign, no replacement landing page, no replacement admin panel, no demo data promoted to production.
- Apply only one narrowly scoped, explicitly requested visible adjustment at a time, on this working preview branch.
- Show the real preview before another change or merge.
- If user dislikes a change, revert preview to the baseline SHA or a prior approved edit.
- Never update `main`, production Supabase, or live content without explicit approval.
- Preview must not perform production CMS writes. Admin edits in preview can be browser-local demos; uploading a local preview file is not the same as publishing to the real site.
- Retain a clear change log and validate visual behavior on mobile and desktop.

## Return to baseline
Restore preview branch files from commit `597aa3c85379fabdab8ffccc08adb36a60a1ffa6`; leave the backup branch untouched. A later specific, explicitly approved production change should be delivered as a small PR from an approved commit.

## Current phase
No visual edits have been authorized or applied at the time of this document. Await user's choice of the first small section to change.
