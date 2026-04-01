# ScaffOS

```
   ____        __  ______  ____
  / __/______ / _// _/ __ \/ __/
 _\ \/ __/ _ `/ _// _/ /_/ /\ \
/___/\__/\_,_/_/ /_/ \____/___/
```

**Ecosystem generation framework. One prompt, every tool a domain needs, all interoperable.**

ScaffOS takes a single natural-language prompt and autonomously builds an entire interconnected software ecosystem — not one application, but every application a domain requires, all wired together and deployed.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   "Build a complete crypto trading ecosystem"                   │
│                                                                 │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    │
│   │  Forge   │    │  Wire   │    │ Shield  │    │  Lens   │    │
│   │infra     │    │connect  │    │security │    │interface│    │
│   └────┬─────┘    └────┬────┘    └────┬────┘    └────┬────┘    │
│        │               │              │              │         │
│        ▼               ▼              ▼              ▼         │
│   ┌─────────────────────────────────────────────────────┐      │
│   │              12 interconnected services              │      │
│   │         Real TypeScript code on disk                 │      │
│   │         Continuously improving forever               │      │
│   └─────────────────────────────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## How it works

### 1. Domain Decomposition

ScaffOS analyzes your prompt and identifies every service the domain needs. It builds a dependency graph — a DAG (directed acyclic graph) — that determines build order.

```
                    ┌──────────────────┐
                    │   Orchestrator   │
                    │  "crypto trading │
                    │   ecosystem"     │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  price-  │  │  event-  │  │  auth-   │
        │aggregator│  │   bus    │  │  layer   │
        │ (no deps)│  │ (no deps)│  │(event-bus)│
        └─────┬────┘  └─────┬────┘  └──────────┘
              │              │
     ┌────────┼─────┐       │
     ▼        ▼     ▼       ▼
 ┌───────┐┌──────┐┌─────┐┌──────────┐
 │ order ││back- ││risk ││portfolio │
 │engine ││tester││mgr  ││ tracker  │
 └───┬───┘└──────┘└──┬──┘└─────┬────┘
     │               │         │
     └───────┬───────┘         │
             ▼                 ▼
     ┌──────────────┐  ┌──────────────┐
     │   trading    │  │  analytics   │
     │  dashboard   │  │    panel     │
     └──────────────┘  └──────────────┘
```

### 2. Four Specialized Agents

Each agent has a fundamentally different cognitive architecture — different system prompts, different priorities, different reasoning patterns.

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  FORGE — Core Infrastructure                             │
│  ─────────────────────────────                           │
│  Builds the foundational services: data pipelines,       │
│  engines, state machines, storage layers. Thinks in      │
│  data structures, algorithms, and system design.         │
│                                                          │
│  Builds: price-aggregator, order-engine,                 │
│          portfolio-tracker, backtester                    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  WIRE — Service Interconnection                          │
│  ──────────────────────────────                          │
│  Builds the communication layer: event buses, API        │
│  gateways, message routing, service discovery.           │
│  Thinks in message schemas, pub/sub patterns,            │
│  and failure modes.                                      │
│                                                          │
│  Builds: event-bus, alert-system                         │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  SHIELD — Security & Monitoring                          │
│  ──────────────────────────────                          │
│  Builds authentication, authorization, rate limiting,    │
│  encryption, health checks, and audit logging.           │
│  Thinks in threat models and attack surfaces.            │
│                                                          │
│  Builds: auth-layer, risk-manager, monitoring            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  LENS — Interfaces & Dashboards                          │
│  ──────────────────────────────                          │
│  Builds the human-facing layer: dashboards, control      │
│  panels, visualizations, admin tools. Thinks in          │
│  components, data bindings, and user workflows.          │
│                                                          │
│  Builds: trading-dashboard, analytics-panel,             │
│          admin-console                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3. Parallel Execution

All four agents work simultaneously. During the initial build, independent services (no dependencies) are built in parallel across agents. Dependent services wait until their requirements are met, then build immediately.

```
Timeline ──────────────────────────────────────────────────▶

Forge:   [price-aggregator]──[order-engine]──[portfolio]──[backtester]
Wire:    [event-bus]─────────────────────────[alert-system]
Shield:  ─────────[auth-layer]──[risk-mgr]──[monitoring]
Lens:    ──────────────────────────[dashboard]──[analytics]──[admin]

         ◀─── Phase 1 ───▶◀──────── Phase 2+ ────────────▶
         (no dependencies)  (dependency-ordered)
```

### 4. Continuous Improvement

After the initial build completes, ScaffOS enters an endless improvement cycle. Two agents work in parallel each round, cycling through 12 improvement categories:

```
┌─────────────────────────────────────────────────────┐
│              Improvement Cycle (∞)                   │
│                                                     │
│  ┌─ refactor ──── error-handling ──── testing ─┐    │
│  │                                             │    │
│  │  performance ── logging ── types ── feature │    │
│  │                                             │    │
│  │  config ── docs ── security ── integration  │    │
│  │                                             │    │
│  └─ monitoring ──────────────────── refactor ──┘    │
│                    (loops forever)                   │
│                                                     │
│  Each cycle:                                        │
│  • Pick 2 agents + 2 random services                │
│  • Review existing code                             │
│  • Generate targeted improvements                   │
│  • Write changes to disk                            │
│  • Commit + push to GitHub                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5. Real Code on Disk

Every file is real TypeScript written to the filesystem. Every change is committed to this repository. You can:

- Browse the file tree on the live page
- Click any file to read the generated source
- Watch the repository grow in real-time
- See the git log for a complete history of every decision

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ScaffOS Server                         │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Orchestrator │  │  Agent Pool  │  │   File Writer    │   │
│  │             │──▶│              │──▶│                  │   │
│  │ DAG solver  │  │ Forge        │  │ ecosystem/       │   │
│  │ Task queue  │  │ Wire         │  │ ├── service-a/   │   │
│  │ Phase mgmt  │  │ Shield       │  │ ├── service-b/   │   │
│  │             │  │ Lens         │  │ └── ...          │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                │                    │             │
│         ▼                ▼                    ▼             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  WebSocket  │  │  OpenAI API  │  │   Git + GitHub   │   │
│  │  broadcast  │  │  gpt-4o-mini │  │   auto-commit    │   │
│  │  to clients │  │  per agent   │  │   auto-push      │   │
│  └──────┬──────┘  └──────────────┘  └──────────────────┘   │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐
│  Browser Client  │
│                  │
│  ┌────┐┌──────┐ │
│  │Tree││Agents│ │
│  │    ││ Logs │ │
│  ├────┤├──────┤ │
│  │File││Stats │ │
│  │View││      │ │
│  └────┘└──────┘ │
└─────────────────┘
```

---

## The Ecosystem

This repository is the live output of ScaffOS building a crypto trading ecosystem. The following services are being built and continuously improved:

| Service | Agent | Dependencies | Description |
|---------|-------|-------------|-------------|
| `price-aggregator` | Forge | — | Multi-exchange price feeds with VWAP calculation |
| `event-bus` | Wire | — | Redis-backed pub/sub message backbone |
| `order-engine` | Forge | price-aggregator | Limit, market, and stop order matching |
| `auth-layer` | Shield | event-bus | JWT auth, API keys, rate limiting |
| `risk-manager` | Shield | price-aggregator, order-engine | Position limits, drawdown circuit breakers |
| `portfolio-tracker` | Forge | order-engine, event-bus | Real-time PnL and allocation tracking |
| `backtester` | Forge | price-aggregator | Historical strategy replay engine |
| `alert-system` | Wire | price-aggregator, risk-manager | Threshold alerts via webhook and websocket |
| `monitoring` | Shield | event-bus | Health checks, latency tracking, uptime |
| `trading-dashboard` | Lens | price-aggregator, portfolio-tracker, order-engine | Unified trading interface |
| `analytics-panel` | Lens | backtester, portfolio-tracker | Performance and strategy analysis |
| `admin-console` | Lens | monitoring, auth-layer, alert-system | System health and configuration |

---

## Running ScaffOS

### Prerequisites

- Node.js 18+
- OpenAI API key

### Setup

```bash
git clone https://github.com/ScaffLabs/ScaffOS.git
cd ScaffOS
npm install
```

### Configuration

Set your OpenAI API key in `server.js` or via environment variable:

```bash
export OPENAI_API_KEY=sk-...
```

### Start

```bash
node server.js
```

Open `http://localhost:3000` to watch the agents build.

---

## Framework Source

```
scaffos/
  server.js         — orchestrator, agents, file writer, git integration
  public/
    index.html      — live dashboard with file tree, agent logs, file viewer
  ecosystem/        — generated output (this repository)
    price-aggregator/
    event-bus/
    order-engine/
    auth-layer/
    risk-manager/
    portfolio-tracker/
    backtester/
    alert-system/
    monitoring/
    trading-dashboard/
    analytics-panel/
    admin-console/
```

---

## How Agents Think

Each agent has a unique system prompt shaping its cognitive style. When given a task, the agent:

1. **Analyzes** requirements and dependencies
2. **Reasons** through architecture decisions (visible in the thinking logs)
3. **Generates** real TypeScript files with proper types, imports, and error handling
4. **Writes** files to disk one at a time
5. **Commits** changes to git with descriptive messages
6. **Pushes** to GitHub automatically

During improvement cycles, agents:

1. **Read** all existing files for a service
2. **Identify** a specific improvement (refactoring, testing, security, etc.)
3. **Generate** targeted changes (1-3 files)
4. **Write** updated or new files
5. **Commit + push** with improvement-type-prefixed messages

---

## Commit Convention

```
feat(service-name): initial implementation — N files
refactor(service-name): description of refactoring
error-handling(service-name): added try/catch and validation
testing(service-name): unit tests for core logic
performance(service-name): caching and algorithm optimization
security(service-name): input sanitization and hardening
feature(service-name): new endpoint or capability
docs(service-name): README and inline documentation
```

---

## Live Instance

The live demo runs at [scaffos.dev](https://scaffos.dev) — four agents building this exact repository in real-time. Every commit you see here was made by an autonomous agent.

---

## Stats

These update in real-time on the live page:

- **Phase** — `building` (initial) or `improving` (continuous cycle)
- **Services** — how many of the 12 services are deployed
- **Files** — total files written to disk
- **Commits** — total git commits pushed
- **Changes** — number of file modifications (not new files)
- **Uptime** — how long the current session has been running

---

Built by agents. Improved by agents. Forever.

```
   ____        __  ______  ____
  / __/______ / _// _/ __ \/ __/
 _\ \/ __/ _ `/ _// _/ /_/ /\ \
/___/\__/\_,_/_/ /_/ \____/___/

  One prompt. Every tool. All interoperable.
```
