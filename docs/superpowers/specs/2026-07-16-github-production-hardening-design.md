# GitHub Production Hardening Design

## Objective

Make the current site safe to integrate into `main` and deploy to production while preserving a workable solo-maintainer flow. The change covers repository protection, automated validation, dependency security, and the final production promotion of PR #2.

## Current State

- `main` is 53 commits and 239 files behind the current publication branch.
- PR #2 is a draft and is blocked because the only repository collaborator cannot approve their own pull request.
- The active ruleset requires one approval but does not require automated status checks.
- The repository has no GitHub Actions workflows.
- The current checkout builds successfully, but the main test run has 11 failing tests plus one suite import failure, and lint reports 20 errors and one warning.
- `npm audit --omit=dev` reports 13 vulnerabilities, including five high-severity findings.
- Dependabot alerts and security updates are disabled. Secret scanning and push protection are enabled.
- The current commit has a successful Vercel Preview deployment, while Production still points to the old `main` commit.

## Repository Protection Design

Keep the pull-request requirement on the default branch, but set the required human approval count to zero because this is currently a solo-maintainer repository. Preserve deletion and non-fast-forward protections.

After the new CI workflow has run successfully at least once and its check name exists on GitHub, update the ruleset to require that CI check before merge. The ruleset change must not leave `main` temporarily open to direct unvalidated changes: PRs remain mandatory throughout.

## Continuous Integration Design

Add one GitHub Actions workflow for pull requests and pushes to `main`. It will:

1. Check out the repository.
2. Install the supported Node.js version with npm caching.
3. Run `npm ci`.
4. Run the full repository test command.
5. Run lint.
6. Run the production build.

The workflow will use least-privilege read permissions and concurrency cancellation for superseded runs. A single stable job/check name will be used by the branch ruleset.

CI must reflect a fresh GitHub checkout. Local ignored worktrees are not part of the workflow and therefore cannot pollute test discovery.

## Existing Quality Failures

Fix only failures that block the new CI. Changes must preserve the current visible behavior unless a test is demonstrably stale. Production-code corrections require regression tests written and observed failing first. Test-only expectation updates require evidence that the shipped behavior is intentional and already covered elsewhere.

The missing `navigationOrigin` import must be resolved explicitly rather than hidden by excluding its suite. Lint configuration may be corrected for legitimate Node/test globals, but real React hook, purity, undefined-variable, and unused-code errors must be fixed in code.

## Dependency Security Design

Update vulnerable dependencies with the smallest compatible set of changes:

- Upgrade direct dependencies such as `react-router-dom`, `postcss`, and `mathjs` to patched releases.
- Accept the required `mathjs` major upgrade only after its actual usage in `GradualBlur.jsx` is covered by tests and verified.
- Refresh transitive dependencies through the lockfile without broad unrelated framework migrations.
- Run `npm audit --omit=dev` after updating and record any remaining findings with their applicability.

Enable GitHub vulnerability alerts, Dependabot security updates, and a weekly Dependabot configuration for npm and GitHub Actions. Dependabot PR volume must be grouped where practical to avoid noise.

## Pull Request and Deployment Flow

All code and configuration changes remain on the existing publication branch and PR #2. The PR description will be updated with the final validation results.

Promotion sequence:

1. Push the hardening changes to PR #2.
2. Wait for GitHub CI and Vercel Preview to succeed.
3. Add the stable CI check to the default-branch ruleset.
4. Mark PR #2 ready for review.
5. Merge PR #2 with a merge commit to preserve the accumulated history.
6. Monitor the Vercel Production deployment until the merged `main` commit succeeds.
7. Confirm the production URL serves the new commit and key public routes respond successfully.

If CI, Preview, merge, or Production deployment fails, stop promotion and report the failure. Do not bypass a failed required check.

## Out of Scope

- New visual features or redesigns.
- Rate limiting, authentication, CAPTCHA, or other endpoint hardening identified in the broader audit.
- Repository image/LFS cleanup.
- General README or community-profile improvements.
- Major dependency upgrades unrelated to an active security finding.

## Acceptance Criteria

- PR #2 can be merged by the solo maintainer without another human approval.
- Pull requests to `main` require the new CI status check.
- Tests, lint, and production build pass in a fresh GitHub Actions environment.
- Dependabot alerts/security updates and scheduled dependency updates are enabled.
- High-severity production dependency findings are resolved, or any exception is explicitly documented with evidence.
- PR #2 is merged into `main` only after CI and Preview succeed.
- Vercel Production successfully deploys the merged `main` commit.

