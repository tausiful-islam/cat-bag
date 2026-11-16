#!/usr/bin/env python3
"""Apply a SQL migration file to the cat-bag Supabase project.

Splits SQL respecting $$ blocks, strings and comments, then executes
statements sequentially via the Supabase management API.
Stops at the first failing statement.
"""
import json, sys, urllib.request, urllib.error

REF = "gfjcxmcbwumzuwwubolj"
API = f"https://api.supabase.com/v1/projects/{REF}/database/query"
TOKEN_FILE = "/home/tausif/.openclaw-secrets/supabase_agent_token"

def get_token():
    with open(TOKEN_FILE) as f:
        return f.read().strip()

def split_sql(sql: str):
    stmts, buf = [], []
    i, n = 0, len(sql)
    in_s = in_d = in_line = in_block = False
    while i < n:
        c = sql[i]
        nxt = sql[i + 1] if i + 1 < n else ""
        if in_line:
            buf.append(c)
            if c == "\n":
                in_line = False
            i += 1
            continue
        if in_block:
            buf.append(c)
            if c == "*" and nxt == "/":
                buf.append(nxt); i += 2; continue
            i += 1
            continue
        if c == "-" and nxt == "-":
            in_line = True; buf.append(c); i += 1; continue
        if c == "/" and nxt == "*":
            in_block = True; buf.append(c); i += 1; continue
        if c == "$" and nxt == "$":
            j = sql.find("$$", i + 2)
            if j == -1:
                j = n
            buf.append(sql[i:j + 2])
            i = j + 2
            continue
        if c == "'":
            in_s = not in_s
        elif c == '"':
            in_d = not in_d
        elif c == ";" and not in_s and not in_d:
            stmts.append("".join(buf).strip())
            buf = []
            i += 1
            continue
        buf.append(c)
        i += 1
    tail = "".join(buf).strip()
    if tail:
        stmts.append(tail)
    # keep only statements with actual content (not just comments/whitespace)
    out = []
    for s in stmts:
        content = "\n".join(
            ln for ln in s.splitlines()
            if ln.strip() and not ln.strip().startswith("--")
        ).strip()
        if content:
            out.append(s)
    return out

def run(stmt):
    body = json.dumps({"query": stmt}).encode()
    req = urllib.request.Request(API, data=body, method="POST", headers={
        "Authorization": f"Bearer {get_token()}",
        "Content-Type": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, r.read().decode()[:200]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:500]

if __name__ == "__main__":
    path = sys.argv[1]
    stmts = split_sql(open(path).read())
    print(f"{path}: {len(stmts)} statements")
    for idx, s in enumerate(stmts, 1):
        first = next((ln for ln in s.splitlines() if ln.strip() and not ln.strip().startswith("--")), "")[:70]
        status, resp = run(s)
        ok = 200 <= status < 300
        print(f"  [{idx}/{len(stmts)}] {'OK ' if ok else 'ERR'} {status} :: {first}")
        if not ok:
            print("  RESPONSE:", resp)
            sys.exit(1)
    print("migration applied")
