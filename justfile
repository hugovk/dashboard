# Fetch JSON data files for local testing
fetch:
    curl -O https://raw.githubusercontent.com/hugovk/dashboard/refs/heads/gh-pages/issues_by_dev.json
    curl -O https://raw.githubusercontent.com/hugovk/dashboard/refs/heads/gh-pages/needs_backport.json
    curl -O https://raw.githubusercontent.com/hugovk/dashboard/refs/heads/gh-pages/orphaned_backports.json
    curl -O https://raw.githubusercontent.com/hugovk/dashboard/refs/heads/gh-pages/potential_closeable_issues.json

# Start a local HTTP server
serve:
    python3 -m http.server
