# Fleet Ops
**Source:** [[Professional Agentic Product Engineering Guide]]
**Created:** 2026-07-04

Tier 7 of [[The Eight Tiers]]. **Operate your agents as a fleet, so long runs don't die on you.**

**Reach for this tier when** runs die because your laptop slept, parallel agents collide, or you want to drive them from your phone. Get this right and a run survives your laptop closing and keeps going while you're away.

Once you're running more than one agent, or runs longer than you'll sit and watch, **where and how you run them** becomes its own engineering problem. This is the operations layer of agentic work, one step up from [[Orchestration]].

## API-bound, not compute-bound

Claude Code is **API-bound, not compute-bound** — inference runs on Anthropic's servers; your machine just holds the thread. So a box that doesn't sleep keeps the agent moving, and the hardware bar is modest: a 4 GB VPS handles one agent, but budget **16 GB+** for dynamic workflows or many parallel subagents (heavy orchestration OOM-kills small boxes and takes the tmux session with it).

## The five tips

- **7.1 Manage parallel agents in an agent-aware terminal — so you see which one is blocked.**
  > ❌ Instead of: a dozen plain terminal tabs where you lose track of which agent is blocked.
  > ✅ Prefer: a terminal built for agents (Warp) — panes per agent, notifications when one needs input, a built-in diff/review panel.
  - Claude Code runs inside Warp. One tab per repo; `Cmd+D` splits a pane per agent. A session needing input is flagged; the rest run in the background. `Cmd+Shift++` opens the code-review panel to diff changes and send inline comments back.

- **7.2 Isolate parallel agents with worktrees + one session each.**
  > ❌ Instead of: two agents editing the same working copy and clobbering each other.
  > ✅ Prefer: one git worktree + branch + session per agent.
  - `git worktree add ../feat-auth feat-auth` gives each agent a separate dir + branch; run one agent in each, in its own tmux/Warp session — no collisions. Bonus: run the same task with Claude Code in one worktree and Codex in another, then diff the two approaches.

- **7.3 Host long runs on a box that doesn't sleep; persist with tmux.**
  > ❌ Instead of: a run that dies the moment your laptop sleeps or wifi drops.
  > ✅ Prefer: run on a small always-on server and wrap each agent in tmux.
  - `tmux new -s claude-auth`, run the agent inside, detach with `Ctrl+b` then `d` (keeps running on the server), reattach later from any device with `tmux attach`. Caveat: tmux survives disconnects, not crashes or reboots.

- **7.4 Drive the fleet from your phone — clear blockers from anywhere.**
  > ❌ Instead of: being chained to a desk to answer one permission prompt.
  > ✅ Prefer: SSH in from a mobile client and clear decision points from anywhere.
  - Tailscale for a private network, Termius/Blink as the SSH client, `tmux attach` to look in and unblock. For unattended runs, give an explicit **stopping condition** ("work until the tests pass, then stop and notify") and consider a Telegram/notification bridge. (Claude Code's built-in Remote Control still runs on your local machine — the server + tmux setup is the only true close-the-laptop persistence.)

- **7.5 Secure the agent server like production.**
  > ❌ Instead of: root login and API keys in a committed file on an internet-facing box.
  > ✅ Prefer: non-root sudo user, SSH-keys-only, firewall, secrets in env / a secrets manager.
  - Disable password and root SSH login, UFW-allow only SSH, keep `ANTHROPIC_API_KEY` in the environment (never committed). If you run unattended with `--dangerously-skip-permissions`, put it behind a `PreToolUse` guard hook that blocks destructive commands — the layer the model can't talk its way past.

The managed version of all this is the next level up ([[Agent Execution Layer]]): Warp's Oz and Claude Code's dynamic workflows run agents in the cloud on schedules/triggers with central tracking — the same fleet ideas, hosted.

## Related
- [[Orchestration]]
- [[Agent Execution Layer]]
- [[The Eight Tiers]]
