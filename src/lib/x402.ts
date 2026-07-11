// Lop x402: tu tra tien khi endpoint tra 402.
// Private key nam TREN MAY AGENT (env), khong bao gio roi may, khong gui di dau.
// Co spend cap vi x402 mac dinh KHONG gioi han chi tieu.

import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

const BASE_NETWORK = "eip155:8453"; // Base mainnet
const USDC_DECIMALS = 6;

/** Doc so tu env, fallback neu thieu/sai. */
function envNum(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// Gioi han chi tieu (agent tu chinh qua env).
const MAX_USD_PER_CALL = envNum("MAX_USD_PER_CALL", 0.05);
const MAX_USD_TOTAL = envNum("MAX_USD_TOTAL", 5);

// Tong da chi trong phien nay (reset khi MCP restart).
let spentUsd = 0;

export function getSpend() {
  return { spentUsd, maxUsdTotal: MAX_USD_TOTAL, maxUsdPerCall: MAX_USD_PER_CALL };
}

/** USD -> atomic units cua USDC (6 decimals). */
function usdToAtomic(usd: number): bigint {
  return BigInt(Math.round(usd * 10 ** USDC_DECIMALS));
}

let cachedFetch: ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) | null = null;

/** Tao fetch tu tra tien. Throw neu chua co private key. */
function getPayFetch() {
  if (cachedFetch) return cachedFetch;

  const pk = process.env.WALLET_PRIVATE_KEY;
  if (!pk) {
    throw new Error(
      "WALLET_PRIVATE_KEY is not set. These tools call paid APIs (USDC on Base via x402). " +
        "Set WALLET_PRIVATE_KEY in your MCP config to a wallet holding USDC on Base."
    );
  }
  const key = (pk.startsWith("0x") ? pk : "0x" + pk) as `0x${string}`;
  const account = privateKeyToAccount(key);

  const capAtomic = usdToAtomic(MAX_USD_PER_CALL);

  const client = new x402Client()
    .register(BASE_NETWORK, new ExactEvmScheme(account))
    // Spend cap: loai bo moi yeu cau thanh toan vuot tran mot lan goi.
    .registerPolicy((_version: unknown, reqs: any[]) =>
      reqs.filter((r) => {
        const amt = r?.amount ?? r?.value;
        if (amt === undefined) return false;
        try {
          return BigInt(amt) <= capAtomic;
        } catch {
          return false;
        }
      })
    );

  cachedFetch = wrapFetchWithPayment(globalThis.fetch, client);
  return cachedFetch;
}

/**
 * Goi mot endpoint tra phi. Tu tra tien qua x402 neu gap 402.
 * @param url URL day du cua endpoint
 * @param body body JSON gui di
 * @param priceUsd gia du kien (de kiem spend cap tong)
 */
export async function callPaid(url: string, body: unknown, priceUsd: number): Promise<unknown> {
  if (priceUsd > MAX_USD_PER_CALL) {
    throw new Error(
      `This call costs $${priceUsd} which exceeds MAX_USD_PER_CALL ($${MAX_USD_PER_CALL}). ` +
        `Raise MAX_USD_PER_CALL in the MCP config if you want to allow it.`
    );
  }
  if (spentUsd + priceUsd > MAX_USD_TOTAL) {
    throw new Error(
      `Session spend cap reached: already spent $${spentUsd.toFixed(4)} of MAX_USD_TOTAL ($${MAX_USD_TOTAL}). ` +
        `Raise MAX_USD_TOTAL or restart the MCP server to reset.`
    );
  }

  const payFetch = getPayFetch();
  const res = await payFetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upstream ${res.status}: ${text.slice(0, 300) || res.statusText}`);
  }

  // Thanh cong -> ghi nhan da chi.
  spentUsd += priceUsd;

  const data = await res.json();
  return data;
}
