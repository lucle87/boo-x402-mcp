// Catalog fleet x402/Base cua Boo -> tool MCP.
// Nguyen tac: gom theo CAU HOI cua agent, khong phoi 1-1 endpoint.
// Mot tool co the dinh tuyen sang nhieu server tuy `chain` (vd rugcheck).
const BOOAIP = "https://booaip.vercel.app";
const RUG_EVM = "https://base-rugcheck.vercel.app";
const RUG_SOL = "https://base-sol-rugcheck.vercel.app";
const MEME_EVM = "https://evm-meme-intel.vercel.app";
const MEME_SOL = "https://sol-meme-intel.vercel.app";
const WALLET = "https://wallet-intel-phi.vercel.app";
const PRED = "https://prediction-intel-tan.vercel.app";
const RH = "https://rh-chain-intel.vercel.app";
const EVM_CHAINS = ["eth", "bnb", "base"];
export const TOOLS = [
    // ============ SAFETY (gom 3 server thanh 1 tool) ============
    {
        key: "token_rugcheck",
        title: "Token rug check (any chain)",
        description: "Safety check a token BEFORE buying or swapping. Returns a GO/CAUTION/DANGER verdict. Covers EVM chains (eth, bnb, base: honeypot/sellability, buy & sell tax, mint authority, ownership, holder concentration), Solana (freeze/mint authority, transfer controls), and Robinhood Chain (holder concentration, burned %). Use this for ANY unfamiliar token, especially meme coins.",
        input: {
            token: { type: "string", required: true, desc: "Token contract address (0x... for EVM/Robinhood Chain, base58 mint for Solana)." },
            chain: { type: "string", required: true, desc: "Chain: eth, bnb, base, solana, or rhchain (Robinhood Chain).", enum: ["eth", "bnb", "base", "solana", "rhchain"] },
        },
        routeBy: "chain",
        routes: {
            eth: { url: `${RUG_EVM}/api/rugcheck`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: "eth" }) },
            bnb: { url: `${RUG_EVM}/api/rugcheck`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: "bnb" }) },
            base: { url: `${RUG_EVM}/api/rugcheck`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: "base" }) },
            solana: { url: `${RUG_SOL}/api/rugcheck`, priceUsd: 0.01, body: (a) => ({ token: a.token }) },
            rhchain: { url: `${RH}/api/rugcheck`, priceUsd: 0.01, body: (a) => ({ address: a.token }) },
        },
    },
    {
        key: "token_holders",
        title: "Token holder concentration",
        description: "Holder concentration for a token: top holder %, top-10 %, holder count. High concentration means a whale can dump on you. Works on EVM chains (eth, bnb, base), Solana, and Robinhood Chain.",
        input: {
            token: { type: "string", required: true, desc: "Token contract address / Solana mint." },
            chain: { type: "string", required: true, desc: "Chain: eth, bnb, base, solana, rhchain.", enum: ["eth", "bnb", "base", "solana", "rhchain"] },
        },
        routeBy: "chain",
        routes: {
            eth: { url: `${MEME_EVM}/api/holders`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: "eth" }) },
            bnb: { url: `${MEME_EVM}/api/holders`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: "bnb" }) },
            base: { url: `${MEME_EVM}/api/holders`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: "base" }) },
            solana: { url: `${MEME_SOL}/api/holders`, priceUsd: 0.01, body: (a) => ({ mint: a.token }) },
            rhchain: { url: `${RH}/api/rugcheck`, priceUsd: 0.01, body: (a) => ({ address: a.token }) },
        },
    },
    {
        key: "token_momentum",
        title: "Token price momentum",
        description: "Short-term price/volume momentum for a token: is it pumping or fading right now. Works on EVM chains (eth, bnb, base) and Solana.",
        input: {
            token: { type: "string", required: true, desc: "Token contract address / Solana mint." },
            chain: { type: "string", required: true, desc: "Chain: eth, bnb, base, solana.", enum: ["eth", "bnb", "base", "solana"] },
        },
        routeBy: "chain",
        routes: {
            eth: { url: `${MEME_EVM}/api/momentum`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: "eth" }) },
            bnb: { url: `${MEME_EVM}/api/momentum`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: "bnb" }) },
            base: { url: `${MEME_EVM}/api/momentum`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: "base" }) },
            solana: { url: `${MEME_SOL}/api/momentum`, priceUsd: 0.01, body: (a) => ({ mint: a.token }) },
        },
    },
    {
        key: "meme_discover",
        title: "Discover trending meme tokens",
        description: "Find meme tokens that are trending / newly launched right now on a chain. Use to see what is hot before picking a token to research.",
        input: {
            chain: { type: "string", required: true, desc: "Chain: eth, bnb, base, solana.", enum: ["eth", "bnb", "base", "solana"] },
            limit: { type: "number", desc: "Max results." },
        },
        routeBy: "chain",
        routes: {
            eth: { url: `${MEME_EVM}/api/discover`, priceUsd: 0.01, body: (a) => ({ chain: "eth", limit: a.limit }) },
            bnb: { url: `${MEME_EVM}/api/discover`, priceUsd: 0.01, body: (a) => ({ chain: "bnb", limit: a.limit }) },
            base: { url: `${MEME_EVM}/api/discover`, priceUsd: 0.01, body: (a) => ({ chain: "base", limit: a.limit }) },
            solana: { url: `${MEME_SOL}/api/discover`, priceUsd: 0.01, body: (a) => ({ limit: a.limit }) },
        },
    },
    {
        key: "meme_signal",
        title: "Meme token composite signal",
        description: "Composite BUY/HOLD/AVOID signal for a meme token, combining safety, momentum and holder concentration into one verdict. Costs more than a single check but replaces several calls.",
        input: {
            token: { type: "string", required: true, desc: "Token contract address / Solana mint." },
            chain: { type: "string", required: true, desc: "Chain: eth, bnb, base, solana.", enum: ["eth", "bnb", "base", "solana"] },
        },
        routeBy: "chain",
        routes: {
            eth: { url: `${MEME_EVM}/api/signal`, priceUsd: 0.02, body: (a) => ({ token: a.token, chain: "eth" }) },
            bnb: { url: `${MEME_EVM}/api/signal`, priceUsd: 0.02, body: (a) => ({ token: a.token, chain: "bnb" }) },
            base: { url: `${MEME_EVM}/api/signal`, priceUsd: 0.02, body: (a) => ({ token: a.token, chain: "base" }) },
            solana: { url: `${MEME_SOL}/api/signal`, priceUsd: 0.02, body: (a) => ({ mint: a.token }) },
        },
    },
    {
        key: "solana_bundle_check",
        title: "Solana bundle / sniper detection",
        description: "Solana only. Detects whether a token launch was bundled or sniped (insiders buying in the same block), a strong rug signal on new Solana meme coins.",
        input: { mint: { type: "string", required: true, desc: "Solana mint address (base58)." } },
        route: { url: `${MEME_SOL}/api/bundle`, priceUsd: 0.015, body: (a) => ({ mint: a.mint }) },
    },
    // ============ TOKEN DATA ============
    {
        key: "token_price",
        title: "Token price & liquidity",
        description: "Live price, liquidity, 24h volume, FDV and market cap for a token from DEX pairs.",
        input: {
            token: { type: "string", required: true, desc: "Token contract / mint address." },
            chain: { type: "string", desc: "Optional chain hint: eth, bnb, base, solana." },
        },
        route: { url: `${BOOAIP}/api/price`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: a.chain }) },
    },
    {
        key: "token_supply",
        title: "Token supply info",
        description: "Total supply, circulating supply and decimals for a token.",
        input: {
            token: { type: "string", required: true, desc: "Token contract address." },
            chain: { type: "string", required: true, desc: "Chain: eth, bnb, base, solana." },
        },
        route: { url: `${BOOAIP}/api/supply`, priceUsd: 0.01, body: (a) => ({ token: a.token, chain: a.chain }) },
    },
    {
        key: "token_snapshot",
        title: "Token snapshot (price + supply + safety)",
        description: "One-shot overview of a token: price, supply and safety flags combined. Cheaper than calling price, supply and rugcheck separately.",
        input: {
            token: { type: "string", required: true, desc: "Token contract address." },
            chain: { type: "string", required: true, desc: "Chain: eth, bnb, base, solana." },
        },
        route: { url: `${BOOAIP}/api/snapshot`, priceUsd: 0.015, body: (a) => ({ token: a.token, chain: a.chain }) },
    },
    // ============ WALLET ============
    {
        key: "wallet_risk",
        title: "Wallet reputation & risk",
        description: "Reputation check for an address: scam/phishing flags, age, activity. Use before sending funds to or trusting an unknown address.",
        input: {
            address: { type: "string", required: true, desc: "Wallet address." },
            chain: { type: "string", required: true, desc: "Chain: eth, bnb, base, solana." },
        },
        route: { url: `${WALLET}/api/address`, priceUsd: 0.01, body: (a) => ({ address: a.address, chain: a.chain }) },
    },
    {
        key: "wallet_sanctions",
        title: "OFAC sanctions screen",
        description: "Screens a wallet address against OFAC sanctions lists. Use for compliance before accepting funds from an address.",
        input: { address: { type: "string", required: true, desc: "Wallet address." } },
        route: { url: `${BOOAIP}/api/sanctions`, priceUsd: 0.01, body: (a) => ({ address: a.address }) },
    },
    {
        key: "contract_safety",
        title: "Contract safety scan",
        description: "Scans a smart contract for dangerous patterns: proxy/upgradeable, owner privileges, unverified source. Use before approving or interacting with an unknown contract.",
        input: {
            address: { type: "string", required: true, desc: "Contract address." },
            chain: { type: "string", required: true, desc: "Chain: eth, bnb, base." },
        },
        route: { url: `${WALLET}/api/contract`, priceUsd: 0.01, body: (a) => ({ address: a.address, chain: a.chain }) },
    },
    {
        key: "wallet_signal",
        title: "Wallet safety composite signal",
        description: "Composite SAFE/CAUTION/DANGER verdict for an address, combining reputation, contract checks and sanctions.",
        input: {
            address: { type: "string", required: true, desc: "Wallet or contract address." },
            chain: { type: "string", required: true, desc: "Chain: eth, bnb, base." },
        },
        route: { url: `${WALLET}/api/signal`, priceUsd: 0.02, body: (a) => ({ address: a.address, chain: a.chain }) },
    },
    // ============ MARKET / DEFI ============
    {
        key: "fear_greed",
        title: "Crypto Fear & Greed index",
        description: "Current Crypto Fear & Greed index (0-100) and its label. Use to gauge overall market sentiment. No input.",
        input: {},
        route: { url: `${BOOAIP}/api/feargreed`, priceUsd: 0.005, body: () => ({}) },
    },
    {
        key: "gas_oracle",
        title: "EVM gas oracle",
        description: "Current gas prices (slow/average/fast) on an EVM chain. Use to time a transaction or estimate cost.",
        input: { chain: { type: "string", desc: "Chain: eth, bnb, base (default eth)." } },
        route: { url: `${BOOAIP}/api/gas`, priceUsd: 0.005, body: (a) => ({ chain: a.chain }) },
    },
    {
        key: "ens_resolve",
        title: "ENS name resolver",
        description: "Resolve an ENS name to an address, or an address back to its ENS name.",
        input: { query: { type: "string", required: true, desc: "ENS name (vitalik.eth) or address (0x...)." } },
        route: { url: `${BOOAIP}/api/ens`, priceUsd: 0.005, body: (a) => ({ query: a.query }) },
    },
    {
        key: "defi_tvl",
        title: "DeFi protocol TVL",
        description: "Total value locked and recent change for a DeFi protocol.",
        input: { protocol: { type: "string", required: true, desc: "Protocol slug (aave, uniswap, lido...)." } },
        route: { url: `${BOOAIP}/api/tvl`, priceUsd: 0.01, body: (a) => ({ protocol: a.protocol }) },
    },
    {
        key: "defi_yields",
        title: "DeFi yield finder",
        description: "Find yield/farming opportunities, optionally filtered by token symbol, chain, or safety.",
        input: {
            symbol: { type: "string", desc: "Token symbol to filter (USDC, ETH...)." },
            chain: { type: "string", desc: "Chain to filter." },
            limit: { type: "number", desc: "Max results." },
            safeOnly: { type: "boolean", desc: "true to return only lower-risk pools." },
        },
        route: {
            url: `${BOOAIP}/api/yields`,
            priceUsd: 0.01,
            body: (a) => ({ symbol: a.symbol, chain: a.chain, limit: a.limit, safeOnly: a.safeOnly }),
        },
    },
    {
        key: "chain_tvl",
        title: "Chain TVL overview",
        description: "Total value locked per blockchain, or for one chain. Use to compare ecosystem size.",
        input: { chain: { type: "string", desc: "Optional chain name to filter." } },
        route: { url: `${BOOAIP}/api/chains`, priceUsd: 0.01, body: (a) => ({ chain: a.chain }) },
    },
    {
        key: "stablecoin_peg",
        title: "Stablecoin peg monitor",
        description: "Peg status and market cap of stablecoins. Use to detect a depeg event.",
        input: { symbol: { type: "string", desc: "Optional stablecoin symbol (USDC, USDT, DAI...)." } },
        route: { url: `${BOOAIP}/api/stablecoins`, priceUsd: 0.01, body: (a) => ({ symbol: a.symbol }) },
    },
    {
        key: "derivatives_funding",
        title: "Perp funding & open interest",
        description: "Funding rates and open interest for a perpetual across exchanges. Use to read leverage positioning.",
        input: { symbol: { type: "string", required: true, desc: "Asset symbol (BTC, ETH, SOL...)." } },
        route: { url: `${BOOAIP}/api/derivatives`, priceUsd: 0.01, body: (a) => ({ symbol: a.symbol }) },
    },
    {
        key: "trade_signal",
        title: "Trade signal & analysis",
        description: "Composite trade signal for a major asset, combining price, derivatives positioning and sentiment. NOT investment advice.",
        input: { symbol: { type: "string", required: true, desc: "Asset symbol (BTC, ETH, SOL...)." } },
        route: { url: `${BOOAIP}/api/signal`, priceUsd: 0.02, body: (a) => ({ symbol: a.symbol }) },
    },
    // ============ PREDICTION MARKETS ============
    {
        key: "prediction_markets",
        title: "Prediction market screener",
        description: "Browse active prediction markets, optionally filtered by tag and ordered by volume/liquidity.",
        input: {
            tag: { type: "string", desc: "Filter by tag (politics, crypto, sports...)." },
            limit: { type: "number", desc: "Max results." },
            order: { type: "string", desc: "Order by: volume, liquidity, newest." },
        },
        route: { url: `${PRED}/api/markets`, priceUsd: 0.008, body: (a) => ({ tag: a.tag, limit: a.limit, order: a.order }) },
    },
    {
        key: "prediction_search",
        title: "Search prediction markets",
        description: "Search prediction markets by keyword. Use to find the market for a specific event.",
        input: { query: { type: "string", required: true, desc: "Search text." } },
        route: { url: `${PRED}/api/search`, priceUsd: 0.005, body: (a) => ({ query: a.query }) },
    },
    {
        key: "prediction_market",
        title: "Prediction market detail",
        description: "Detail and current implied forecast for one prediction market.",
        input: { slug: { type: "string", required: true, desc: "Market slug (from screener or search)." } },
        route: { url: `${PRED}/api/market`, priceUsd: 0.008, body: (a) => ({ slug: a.slug }) },
    },
    {
        key: "prediction_history",
        title: "Prediction outcome price history",
        description: "Historical price series for one outcome token of a prediction market.",
        input: {
            tokenId: { type: "string", required: true, desc: "Outcome token id (from market detail)." },
            interval: { type: "string", desc: "Interval: 1h, 6h, 1d, 1w, max." },
            fidelity: { type: "number", desc: "Resolution in minutes." },
        },
        route: {
            url: `${PRED}/api/history`,
            priceUsd: 0.008,
            body: (a) => ({ tokenId: a.tokenId, interval: a.interval, fidelity: a.fidelity }),
        },
    },
    // ============ ROBINHOOD CHAIN (chain moi, khong ai khac phu) ============
    {
        key: "rhchain_health",
        title: "Robinhood Chain network health",
        description: "Live network health of Robinhood Chain (Ethereum L2 on Arbitrum Orbit, chain_id 4663, mainnet since July 2026): latest block, block time, gas, tx counts, ETH price. No input.",
        input: {},
        route: { url: `${RH}/api/health`, priceUsd: 0.005, body: () => ({}) },
    },
    {
        key: "rhchain_wallet",
        title: "Robinhood Chain wallet snapshot",
        description: "Wallet snapshot on Robinhood Chain: ETH balance (+USD), tx count, account type, scam/reputation flags, optionally token holdings (deep=true).",
        input: {
            address: { type: "string", required: true, desc: "Wallet address (0x...)." },
            deep: { type: "boolean", desc: "true to also return token holdings." },
        },
        route: { url: `${RH}/api/wallet`, priceUsd: 0.01, body: (a) => ({ address: a.address, deep: a.deep }) },
    },
    {
        key: "rhchain_wallet_score",
        title: "Robinhood Chain wallet activity score",
        description: "Activity score (0-100) and tier (dormant/low/moderate/active/very active) for a Robinhood Chain wallet.",
        input: { address: { type: "string", required: true, desc: "Wallet address (0x...)." } },
        route: { url: `${RH}/api/score`, priceUsd: 0.01, body: (a) => ({ address: a.address }) },
    },
    {
        key: "rhchain_token_screener",
        title: "Robinhood Chain token screener",
        description: "Screen tokens on Robinhood Chain by holders: tokenized Stock Tokens (NVDA, TSLA, MSTR, GME...) and community/meme tokens. Filter with stockOnly, or search by name/symbol.",
        input: {
            query: { type: "string", desc: "Name or symbol to search." },
            stockOnly: { type: "boolean", desc: "true for only tokenized Stock Tokens." },
            limit: { type: "number", desc: "Max results." },
        },
        route: {
            url: `${RH}/api/tokens`,
            priceUsd: 0.008,
            body: (a) => ({ query: a.query, stockOnly: a.stockOnly, limit: a.limit }),
        },
    },
    {
        key: "rhchain_token_detail",
        title: "Robinhood Chain token detail",
        description: "Detail for one token on Robinhood Chain: symbol, name, holders, supply, price, market cap, 24h volume, and whether it is a Robinhood Stock Token.",
        input: { address: { type: "string", required: true, desc: "Token contract address (0x...)." } },
        route: { url: `${RH}/api/token`, priceUsd: 0.008, body: (a) => ({ address: a.address }) },
    },
    {
        key: "rhchain_tx",
        title: "Robinhood Chain transaction lookup",
        description: "Look up a transaction on Robinhood Chain by hash: status, method, from/to, value, fee, block, timestamp.",
        input: { hash: { type: "string", required: true, desc: "Transaction hash (0x...)." } },
        route: { url: `${RH}/api/tx`, priceUsd: 0.005, body: (a) => ({ hash: a.hash }) },
    },
    {
        key: "rhchain_trending",
        title: "Robinhood Chain trending tokens",
        description: "Trending tokens on Robinhood Chain by 24h volume: meme/community tokens pumping now. Stock Tokens excluded unless includeStock=true.",
        input: {
            limit: { type: "number", desc: "Max results." },
            includeStock: { type: "boolean", desc: "true to include tokenized Stock Tokens." },
        },
        route: { url: `${RH}/api/trending`, priceUsd: 0.008, body: (a) => ({ limit: a.limit, includeStock: a.includeStock }) },
    },
    {
        key: "rhchain_burn",
        title: "Robinhood Chain token burn stats",
        description: "Burn stats for a token on Robinhood Chain: amount sent to burn addresses (0x0, 0x...dEaD) and % of total supply burned. Use to verify deflationary claims.",
        input: { address: { type: "string", required: true, desc: "Token contract address (0x...)." } },
        route: { url: `${RH}/api/burn`, priceUsd: 0.005, body: (a) => ({ address: a.address }) },
    },
];
/** Lay route + gia cho mot lan goi tool. */
export function resolveRoute(tool, args) {
    if (tool.route)
        return tool.route;
    if (tool.routeBy && tool.routes) {
        const k = String(args[tool.routeBy] ?? "").toLowerCase();
        const r = tool.routes[k];
        if (!r) {
            const valid = Object.keys(tool.routes).join(", ");
            throw new Error(`Unsupported ${tool.routeBy}: "${k}". Supported: ${valid}.`);
        }
        return r;
    }
    throw new Error(`Tool ${tool.key} has no route configured.`);
}
/** Gia hien thi (cao nhat trong cac route) de ghi vao description. */
export function displayPrice(tool) {
    if (tool.route)
        return tool.route.priceUsd;
    if (tool.routes)
        return Math.max(...Object.values(tool.routes).map((r) => r.priceUsd));
    return 0;
}
