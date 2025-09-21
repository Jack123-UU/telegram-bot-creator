#!/usr/bin/env python3
# List full repository contents using the GitHub Trees API (recursive)
# Usage:
#   GITHUB_TOKEN=ghp_xxx python3 scripts/list_repo_contents.py --owner Jack123-UU --repo telegram-bot-creator --branch main
# Output: ./all_contents.json (and a short summary printed to stdout)

import os
import sys
import argparse
import json
from urllib.parse import quote_plus

try:
    import requests
except ImportError:
    print('requests not installed. Install with: pip install requests')
    sys.exit(2)

API_TEMPLATE = 'https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1'


def fetch_tree(owner: str, repo: str, branch: str, token: str | None):
    url = API_TEMPLATE.format(owner=quote_plus(owner), repo=quote_plus(repo), branch=quote_plus(branch))
    headers = {'Accept': 'application/vnd.github.v3+json'}
    if token:
        headers['Authorization'] = f'token {token}'
    resp = requests.get(url, headers=headers)
    return resp


def main():
    p = argparse.ArgumentParser(description='List repo contents via GitHub git/trees recursive API')
    p.add_argument('--owner', required=True)
    p.add_argument('--repo', required=True)
    p.add_argument('--branch', default='main')
    p.add_argument('--out', default='all_contents.json')
    args = p.parse_args()

    token = os.environ.get('GITHUB_TOKEN') or os.environ.get('GH_TOKEN')
    resp = fetch_tree(args.owner, args.repo, args.branch, token)

    if resp.status_code == 200:
        data = resp.json()
        tree = data.get('tree', [])
        truncated = data.get('truncated', False)
        result = {
            'owner': args.owner,
            'repo': args.repo,
            'branch': args.branch,
            'truncated': truncated,
            'count': len(tree),
            'tree': tree,
        }
        with open(args.out, 'w', encoding='utf-8') as fh:
            json.dump(result, fh, ensure_ascii=False, indent=2)
        print(f"Wrote {len(tree)} entries to {args.out}. truncated={truncated}")
        if truncated:
            print('Warning: result was truncated by GitHub. For very large repositories consider using the GraphQL API with pagination or fetching directories recursively using the contents API.')
        else:
            print('Repository listing complete.')
        return

    # handle common errors with helpful tips
    if resp.status_code == 404:
        print('Error: repository or branch not found. Check owner/repo/branch values.')
        print('API URL used:', API_TEMPLATE.format(owner=args.owner, repo=args.repo, branch=args.branch))
        sys.exit(3)

    if resp.status_code == 403:
        # rate limit or token-required
        print('Error: access forbidden (HTTP 403). This may be due to rate limits or missing/insufficient token.')
        print('Set GITHUB_TOKEN to increase rate limits and access private repos:')
        print('  export GITHUB_TOKEN=your_token')
        print('You can create a token at https://github.com/settings/tokens (no scopes required for public repos).')
        sys.exit(4)

    # fallback
    print(f'Unexpected response: HTTP {resp.status_code}')
    try:
        print(resp.json())
    except Exception:
        print(resp.text)
    sys.exit(5)


if __name__ == '__main__':
    main()