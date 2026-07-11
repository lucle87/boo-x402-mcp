# boo-x402-mcp

One MCP server giving AI agents **pay-per-call** access to crypto/web3 ground-truth data across **5 chains**: Ethereum, BNB Chain, Base, Solana, and **Robinhood Chain** (chain_id 4663).

Paid in **USDC on Base via x402**. No API key. No signup. No subscription. Built-in spend caps.

## Why

Agents cannot sign up for API keys. x402 lets your agent pay per call with a signature. This server wraps a fleet of data APIs behind one install, routes each question to the right backend, and enforces a spending limit before the wallet ever signs.

## Tools (34 paid + 2 free)

Call `x402_list_paid_tools` (FREE) first to see everything with live prices.

**Safety (use before you buy)**
| Tool | Price | Chains |
|---|---|---|
| `token_rugcheck` | $0.01 | eth, bnb, base, solana, rhchain |
| `token_holders` | $0.01 | eth, bnb, base, solana, rhchain |
| `contract_safety` | $0.01 | eth, bnb, base |
| `wallet_risk` | $0.01 | eth, bnb, base, solana |
| `wallet_sanctions` | $0.01 | OFAC screen |
| `wallet_signal` | $0.02 | composite verdict |
| `solana_bundle_check` | $0.015 | solana (sniper/bundle detection) |

**Meme tokens**
| Tool | Price |
|---|---|
| `meme_discover` | $0.01 |
| `token_momentum` | $0.01 |
| `meme_signal` | $0.02 (composite) |

**Token data**
| Tool | Price |
|---|---|
| `token_price` | $0.01 |
| `token_supply` | $0.01 |
| `token_snapshot` | $0.015 (price + supply + safety) |

**Market & DeFi**
| Tool | Price |
|---|---|
| `fear_greed` | $0.005 |
| `gas_oracle` | $0.005 |
| `ens_resolve` | $0.005 |
| `defi_tvl` | $0.01 |
| `defi_yields` | $0.01 |
| `chain_tvl` | $0.01 |
| `stablecoin_peg` | $0.01 |
| `derivatives_funding` | $0.01 |
| `trade_signal` | $0.02 |

**Prediction markets**
| Tool | Price |
|---|---|
| `prediction_markets` | $0.008 |
| `prediction_search` | $0.005 |
| `prediction_market` | $0.008 |
| `prediction_history` | $0.008 |

**Robinhood Chain** (new L2, not covered by other providers)
| Tool | Price |
|---|---|
| `rhchain_health` | $0.005 |
| `rhchain_wallet` | $0.01 |
| `rhchain_wallet_score` | $0.01 |
| `rhchain_token_screener` | $0.008 |
| `rhchain_token_detail` | $0.008 |
| `rhchain_tx` | $0.005 |
| `rhchain_trending` | $0.008 |
| `rhchain_burn` | $0.005 |

**Free**: `x402_list_paid_tools`, `x402_spend_status`

## Install

```json
{
  "mcpServers": {
    "boo-x402": {
      "command": "npx",
      "args": ["-y", "boo-x402-mcp"],
      "env": {
        "WALLET_PRIVATE_KEY": "0x...",
        "MAX_USD_PER_CALL": "0.05",
        "MAX_USD_TOTAL": "5"
      }
    }
  }
}
```

Works with Claude Desktop, Claude Code (`claude mcp add`), Cursor, and any MCP client.

## Wallet

You need a wallet holding **USDC on Base**. No ETH needed for gas: x402 uses EIP-3009, so your wallet only signs, and the facilitator pays gas.

Your private key stays **on your machine**, in your MCP config. It is never transmitted. Payments are signed locally, per call.

The free tools work with no wallet at all.

## Spend caps

x402 wallets are unlimited by default. This server is not:

- `MAX_USD_PER_CALL` (default `0.05`) - rejects any single payment above this, before signing
- `MAX_USD_TOTAL` (default `5`) - rejects further calls once session spend reaches this

Restart the server to reset the session total.

## Data

Public, verifiable sources (Blockscout, RPC, DEX pairs, DefiLlama, GoPlus). Read-only.

**NOT investment advice.**

## License

MIT
