Mo Design V13 — Fix 01: Independent public content loading

Branch: mo-design-v13-dev
Replace only: assets/api.js

What changes:
- Loading of site_settings, projects, services, testimonials and learning_items is isolated.
- An error in one table does not block successfully loaded tables.
- Missing settings fall back to existing site defaults.
- Does NOT modify Supabase database or admin data.
- Does NOT fix every possible network or UI failure.
- Tested with four mocked scenarios and JavaScript syntax check.

Do not merge this branch into main before functional testing.
For GitHub web upload: extract this ZIP and upload assets/api.js INSIDE the repository's assets folder, on branch mo-design-v13-dev. Do not upload the ZIP itself to GitHub.
