#!/usr/bin/env node
// boo-x402-mcp: mot cua duy nhat cho toan bo fleet data API tra phi cua Boo.
// Agent cai bang npx, dat WALLET_PRIVATE_KEY, goi tool -> MCP tu tra USDC (x402/Base) -> tra data ve.
// Private key nam tren may agent, khong roi may.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TOOLS, resolveRoute, displayPrice } from "./lib/services.js";
import { callPaid, getSpend } from "./lib/x402.js";
const server = new McpServer({ name: "boo-x402-mcp", version: "0.2.0" });
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function fail(msg) {
    return {
        content: [{ type: "text", text: JSON.stringify({ error: msg }, null, 2) }],
        isError: true,
    };
}
/** Sinh zod schema tu dinh nghia input. */
function toZodShape(tool) {
    const shape = {};
    for (const [name, spec] of Object.entries(tool.input)) {
        let base;
        if (spec.type === "string") {
            base = spec.enum && spec.enum.length ? z.enum(spec.enum) : z.string();
        }
        else if (spec.type === "number") {
            base = z.number();
        }
        else {
            base = z.boolean();
        }
        const withDesc = base.describe(spec.desc);
        shape[name] = spec.required ? withDesc : withDesc.optional();
    }
    return shape;
}
/** Bo cac field undefined truoc khi gui (endpoint co the kho tinh voi null). */
function clean(o) {
    const out = {};
    for (const [k, v] of Object.entries(o))
        if (v !== undefined && v !== null)
            out[k] = v;
    return out;
}
for (const tool of TOOLS) {
    const price = displayPrice(tool);
    server.registerTool(tool.key, {
        title: tool.title,
        description: `${tool.description}\n\nPAID TOOL: up to $${price} USDC per call (x402 on Base). Paid automatically from your configured wallet.`,
        inputSchema: toZodShape(tool),
    }, async (args) => {
        try {
            const a = (args ?? {});
            const route = resolveRoute(tool, a);
            const body = clean(route.body(a));
            const data = await callPaid(route.url, body, route.priceUsd);
            return ok(data);
        }
        catch (e) {
            return fail(e instanceof Error ? e.message : "Unknown error");
        }
    });
}
// ===== Tool mien phi =====
server.registerTool("x402_list_paid_tools", {
    title: "List paid tools and prices",
    description: "FREE. Lists every paid tool in this server with its price in USDC. Call this FIRST to see what data is available and what it costs before spending anything.",
    inputSchema: {},
}, async () => ok(TOOLS.map((t) => ({
    tool: t.key,
    priceUsd: displayPrice(t),
    title: t.title,
    chains: t.routes ? Object.keys(t.routes) : undefined,
}))));
server.registerTool("x402_spend_status", {
    title: "Check x402 spend in this session",
    description: "FREE. Shows how much USDC has been spent this session and the configured spend caps (per call and total).",
    inputSchema: {},
}, async () => ok(getSpend()));
const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`boo-x402-mcp running (stdio) - ${TOOLS.length} paid tools + 2 free`);
