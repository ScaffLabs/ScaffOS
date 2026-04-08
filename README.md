# ScaffOS

```
   ____        __  ______  ____
  / __/______ / _// _/ __ \/ __/
 _\ \/ __/ _ `/ _// _/ /_/ /\ \
/___/\__/\_,_/_/ /_/ \____/___/
```

```
CA: AZdAxdrzan6dQLqrd4UijsptUUz5YrycekhbvWFkWgiy
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

After the initial build completes, ScaffOS enters an endless improvement cycle. Two agents work in parallel each round, cycling through improvement categories:

```
┌─────────────────────────────────────────────────────┐
│              Improvement Cycle (∞)                   │
│                                                     │
│  ┌─ implementation ── error-handling ── testing ─┐  │
│  │                                               │  │
│  │  wiring ── config ── types ── data-layer      │  │
│  │                                               │  │
│  │  api-completeness ── logging ── resilience    │  │
│  │                                               │  │
│  └─ security ── documentation ── implementation ─┘  │
│                    (loops forever)                   │
│                                                     │
│  Each cycle:                                        │
│  • Pick 2 agents + 2 random services                │
│  • Review existing code                             │
│  • Generate production-quality improvements          │
│  • Write changes to disk                            │
│  • Commit + push to GitHub                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## The Ecosystem

This repository is the live output of ScaffOS building a crypto trading ecosystem. The following services are being built and continuously improved:

| Service | Agent | Dependencies | Description |
|---------|-------|-------------|-------------|
| `price-aggregator` | Forge | — | Multi-exchange price feeds with VWAP calculation |
| `event-bus` | Wire | — | Pub/sub message backbone for inter-service communication |
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

## Commit Convention

```
feat(service-name): initial implementation — N files
implementation(service-name): replace stubs with working logic
error-handling(service-name): production-grade error handling
testing(service-name): comprehensive unit tests with Jest
wiring(service-name): real inter-service HTTP communication
config(service-name): environment variables, Docker, compose
types(service-name): Zod schemas, branded types, zero any
data-layer(service-name): proper CRUD with in-memory storage
api-completeness(service-name): pagination, filtering, status codes
logging(service-name): structured logging with pino/winston
resilience(service-name): health checks, circuit breakers, graceful shutdown
security(service-name): input sanitization, CORS, rate limiting
documentation(service-name): README, API docs, setup instructions
```

---

## Live Instance

The live demo runs at [scaffos.dev](https://scaffos.dev) — four agents building and continuously improving this exact repository in real-time. Every commit you see here was made by an autonomous agent.

---

Built by agents. Improved by agents. Forever.

```
   ____        __  ______  ____
  / __/______ / _// _/ __ \/ __/
 _\ \/ __/ _ `/ _// _/ /_/ /\ \
/___/\__/\_,_/_/ /_/ \____/___/

  One prompt. Every tool. All interoperable.
```
