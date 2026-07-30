# CKB Agent Instructions

Mint Gate is a DAO built on Nervos CKB. For CKB-related work, prefer official CKB documentation over model memory.

## Primary sources

Start with:

- https://docs.nervos.org/llms.txt
- https://docs.nervos.org/llms-full.txt
- https://ckb-ai.ckbdev.com/

Human docs entry points:

- https://docs.nervos.org/docs
- https://docs.nervos.org/docs/ai-agents/ai-resource

Treat official docs and LLM files as the source of truth. CKB AI MCP is useful for discovery, examples, Cell queries, RPC usage, debugging, and guidance, but it is still in active development. Verify important or version-sensitive answers against official docs, source repos, RFCs, or release notes.

## Cell Model (non-negotiable)

CKB uses the Cell Model, not an account model. Transactions consume live Cells and create new Cells. State changes happen through Cell replacement. Lock Scripts control spending; Type Scripts validate state rules; Scripts run in CKB-VM.

Before coding, determine whether the task is dApp integration, Script/smart contract development, or node/RPC work, then use the relevant official docs, maintained templates, and tooling.

## Defaults by scenario

- For on-chain Scripts, prefer Rust with `ckb-std`. Use C with `ckb-c-stdlib` only for low-level or legacy C workflows. Use JS with `ckb-js-vm` only when the task explicitly targets the JS VM and the target network supports it.
- For dApps, prefer CCC. Use `@ckb-ccc/shell` for general TypeScript transaction work and `@ckb-ccc/connector-react` for React wallet connection flows.
- For project scaffolding, prefer maintained `ckb-script-templates`. Use manual setup only when the template does not fit the task.
- For Script unit tests, prefer `ckb-testtool`. Use `ckb-debugger` CLI to reproduce VM execution, inspect failures, or debug exported transactions.
- For debugging, prefer `ckb-debugger` with GDB when step-through inspection is needed. Use `ckb_debug!` or debug prints for quick runtime traces.
- For local development, prefer OffCKB. Use a manually configured CKB node when the task depends on node behavior, RPC behavior, networking, or custom chain configuration.
- For Script deployment, prefer Type ID when upgradeability is required. Use direct data deployment only for immutable Scripts, simple examples, or cases where upgradeability is intentionally not needed.
- For serialization, use Molecule.
- For payment channels or high-frequency off-chain payments, consider Fiber Network (`fnn`).

## Testing and tooling

For Script/smart contract testing, find `script/script-testing-guide.md` in `llms-full.txt` and use it as the testing source of truth. Include both success and failure cases before treating generated Scripts as ready.

Use maintained CLI tools and templates to bootstrap projects. Do not hand-generate boilerplate when a maintained tool exists.

Do not guess version-sensitive behavior, including CKB node behavior, VM behavior, RPC schemas, SDK APIs, syscalls, deployed Scripts, network behavior, or OffCKB behavior. Verify before coding.

## Optional agent resources

See [AI Resources](https://docs.nervos.org/docs/ai-agents/ai-resource) for:

- `llms.txt` / `llms-full.txt` downloads
- Starter prompts for transfer dApps and Script work
- CKB Dev Skills (`ckb-dev-skills`) install notes
- CKB AI MCP (alpha): `https://mcp.ckbdev.com/ckbai`
