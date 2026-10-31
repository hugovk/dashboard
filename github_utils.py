"""
Shared helpers for the dashboard scripts.
"""

from __future__ import annotations

import datetime as dt
import json
import logging
import os
import time
from typing import Any

from github import Auth, Github  # pip install PyGitHub
from github.GithubRetry import GithubRetry
from github.PullRequest import PullRequest
from github.Repository import Repository
from rich import print  # pip install rich

logging.basicConfig()
# Show GithubRetry's rate-limit waits in the CI log
logging.getLogger("github").setLevel(logging.INFO)

GITHUB_TOKEN = os.environ["GITHUB_TOOLS_TOKEN"]


class BackoffRetry(GithubRetry):
    """GithubRetry that really backs off on server errors.

    urllib3 sleeps for a response's Retry-After header instead of the
    exponential backoff when the header is present. GitHub sends a tiny one
    on 5xx, so a burst of 503s burned all retries in about 20 seconds. For
    server errors, sleep for whichever is longer. Rate limits (403/429) keep
    the default behaviour, which GithubRetry depends on.
    """

    def sleep(self, response=None) -> None:
        if response is not None and response.status >= 500:
            retry_after = self.get_retry_after(response) or 0
            backoff = max(retry_after, self.get_backoff_time())
            if backoff > 0:
                print(f"[yellow]HTTP {response.status}: retry in {backoff:g}s[/yellow]")
                time.sleep(backoff)
            return
        super().sleep(response)


def make_github() -> Github:
    """Client that sleeps out rate limits and retries transient errors.

    GithubRetry itself handles 403, sleeping until the rate limit resets,
    and appends it to status_forcelist. As well as server errors, retry 401:
    GitHub intermittently rejects a valid token with "Bad credentials" at a
    random point in a long request stream; it succeeds on resend.

    20 retries with backoff_factor=2 and urllib3's 120s cap means a sustained
    outage is tolerated for about 30 minutes before giving up.
    """
    retry = BackoffRetry(
        total=20,
        backoff_factor=2,
        status_forcelist=[401, 429, *range(500, 600)],
    )
    return Github(auth=Auth.Token(GITHUB_TOKEN), per_page=100, retry=retry)


def sort_by_to_sort_and_direction(sort_by: str) -> tuple[str, str]:
    sort = "created"
    direction = "desc"
    match sort_by:
        case "newest":
            sort = "created"
            direction = "desc"
        case "oldest":
            sort = "created"
            direction = "asc"
        case "most-commented":
            sort = "comments"
            direction = "desc"
        case "least-commented":
            sort = "comments"
            direction = "asc"
        case "recently-updated":
            sort = "updated"
            direction = "desc"
        case "least-recently-updated":
            sort = "updated"
            direction = "asc"

    return sort, direction


def save_json(data: Any, filename: str) -> None:
    # Put last_update at the start
    data = {"last_update": dt.datetime.now(dt.UTC).isoformat(), **data}
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        print(f"Saved to {filename}")


FAILING_CONCLUSIONS = ("failure", "timed_out")
FAILING_STATES = ("failure", "error")

# Aggregate check that just mirrors the other checks
IGNORED_CHECKS = ("All required checks pass",)


def get_failing_checks(repo: Repository, pr: PullRequest) -> list[str]:
    """Names of failing check runs and commit statuses for the PR's head commit."""
    commit = repo.get_commit(pr.head.sha)
    failing = set()

    for run in commit.get_check_runs():
        if run.conclusion in FAILING_CONCLUSIONS and run.name not in IGNORED_CHECKS:
            failing.add(run.name)

    for status in commit.get_combined_status().statuses:
        if status.state in FAILING_STATES:
            failing.add(status.context)

    return sorted(failing)
