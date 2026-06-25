#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const CASINOS = [
  {
    name: "Stake.com",
    slug: "stake",
    welcome_bonus: "200% up to $1,000",
    welcome_amount: 1000,
    wagering: "40x",
    wagering_multiplier: 40,
    free_spins: 0,
    no_deposit: false,
    crypto: ["BTC", "ETH", "LTC", "DOGE", "XRP", "TRX", "EOS", "BNB"],
    min_deposit: "$20",
    sports_betting: true,
    license: "Curaçao",
    rating: 9.2,
    pros: ["Huge game library", "Original Stake games", "Sports betting", "Fast payouts"],
    cons: ["High wagering on bonus", "Not available in all countries"],
    url: "https://stake.com",
  },
  {
    name: "BC.Game",
    slug: "bcgame",
    welcome_bonus: "300% up to $20,000 over 4 deposits",
    welcome_amount: 20000,
    wagering: "40x",
    wagering_multiplier: 40,
    free_spins: 0,
    no_deposit: false,
    crypto: ["BTC", "ETH", "DOGE", "SOL", "BNB", "USDT", "TRX", "MATIC"],
    min_deposit: "$10",
    sports_betting: true,
    license: "Curaçao",
    rating: 9.0,
    pros: ["Massive welcome bonus", "80+ cryptos accepted", "Provably fair games"],
    cons: ["Complex bonus structure", "Withdrawal limits on bonus"],
    url: "https://bc.game",
  },
  {
    name: "Cloudbet",
    slug: "cloudbet",
    welcome_bonus: "100% up to 5 BTC",
    welcome_amount: 5,
    wagering: "No wagering on sports",
    wagering_multiplier: 0,
    free_spins: 0,
    no_deposit: false,
    crypto: ["BTC", "ETH", "USDT", "BCH", "LTC", "DOGE", "LINK", "DAI"],
    min_deposit: "0.001 BTC",
    sports_betting: true,
    license: "Curaçao",
    rating: 8.8,
    pros: ["Up to 5 BTC bonus", "No wagering on sports bets", "Since 2013"],
    cons: ["Bonus released in increments", "Limited live chat hours"],
    url: "https://cloudbet.com",
  },
  {
    name: "BitStarz",
    slug: "bitstarz",
    welcome_bonus: "5 BTC + 180 Free Spins",
    welcome_amount: 5,
    wagering: "40x",
    wagering_multiplier: 40,
    free_spins: 180,
    no_deposit: true,
    crypto: ["BTC", "ETH", "LTC", "DOGE", "BCH", "USDT", "XRP"],
    min_deposit: "0.0001 BTC",
    sports_betting: false,
    license: "Curaçao",
    rating: 9.1,
    pros: ["No deposit bonus available", "180 free spins", "Award-winning casino"],
    cons: ["No sports betting", "Country restrictions"],
    url: "https://bitstarz.com",
  },
  {
    name: "mBit Casino",
    slug: "mbit",
    welcome_bonus: "5 BTC + 300 Free Spins",
    welcome_amount: 5,
    wagering: "35x",
    wagering_multiplier: 35,
    free_spins: 300,
    no_deposit: false,
    crypto: ["BTC", "ETH", "LTC", "DOGE", "BCH", "USDT", "XRP", "ADA"],
    min_deposit: "0.0003 BTC",
    sports_betting: false,
    license: "Curaçao",
    rating: 8.5,
    pros: ["300 free spins", "Low wagering 35x", "2,000+ games"],
    cons: ["No sports betting", "Slow verification"],
    url: "https://mbitcasino.com",
  },
  {
    name: "FortuneJack",
    slug: "fortunejack",
    welcome_bonus: "6 BTC + 250 Free Spins",
    welcome_amount: 6,
    wagering: "30x",
    wagering_multiplier: 30,
    free_spins: 250,
    no_deposit: true,
    crypto: ["BTC", "ETH", "LTC", "DOGE", "ZEC", "DASH", "XMR", "USDT"],
    min_deposit: "0.001 BTC",
    sports_betting: true,
    license: "Curaçao",
    rating: 8.7,
    pros: ["Lowest wagering (30x)", "No deposit bonus", "Sports + casino"],
    cons: ["Dated interface", "Limited customer support"],
    url: "https://fortunejack.com",
  },
  {
    name: "Wild.io",
    slug: "wild",
    welcome_bonus: "10 BTC + 300 Free Spins",
    welcome_amount: 10,
    wagering: "40x",
    wagering_multiplier: 40,
    free_spins: 300,
    no_deposit: false,
    crypto: ["BTC", "ETH", "LTC", "DOGE", "USDT", "BNB", "SOL", "XRP"],
    min_deposit: "$20",
    sports_betting: false,
    license: "Curaçao",
    rating: 8.3,
    pros: ["Massive 10 BTC bonus", "Modern interface", "VIP program"],
    cons: ["High wagering", "Newer casino"],
    url: "https://wild.io",
  },
  {
    name: "Metaspins",
    slug: "metaspins",
    welcome_bonus: "100% up to 1 BTC",
    welcome_amount: 1,
    wagering: "30x",
    wagering_multiplier: 30,
    free_spins: 0,
    no_deposit: false,
    crypto: ["BTC", "ETH", "USDT", "SOL", "DOGE", "LTC"],
    min_deposit: "$10",
    sports_betting: false,
    license: "Curaçao",
    rating: 8.0,
    pros: ["Simple bonus", "Low wagering", "Provably fair"],
    cons: ["Smaller game selection", "No sports"],
    url: "https://metaspins.com",
  },
];

const server = new McpServer({
  name: "casino-bonus",
  version: "1.0.0",
});

server.tool(
  "get_bonuses",
  "Get current crypto casino welcome bonuses",
  {
    sort_by: z.enum(["rating", "bonus_amount", "wagering", "free_spins"]).optional().default("rating").describe("Sort by: rating, bonus_amount, wagering, free_spins"),
    crypto: z.string().optional().describe("Filter by supported cryptocurrency (e.g. 'BTC', 'ETH', 'SOL')"),
    no_deposit_only: z.boolean().optional().default(false).describe("Only show casinos with no-deposit bonuses"),
    sports: z.boolean().optional().describe("Only show casinos with sports betting"),
    limit: z.number().optional().default(5).describe("Max results (default 5)"),
  },
  async ({ sort_by, crypto, no_deposit_only, sports, limit }) => {
    let results = [...CASINOS];

    if (crypto) {
      results = results.filter((c) =>
        c.crypto.some((cc) => cc.toLowerCase() === crypto.toLowerCase())
      );
    }
    if (no_deposit_only) {
      results = results.filter((c) => c.no_deposit);
    }
    if (sports !== undefined) {
      results = results.filter((c) => c.sports_betting === sports);
    }

    // Sort
    switch (sort_by) {
      case "bonus_amount":
        results.sort((a, b) => b.welcome_amount - a.welcome_amount);
        break;
      case "wagering":
        results.sort((a, b) => a.wagering_multiplier - b.wagering_multiplier);
        break;
      case "free_spins":
        results.sort((a, b) => b.free_spins - a.free_spins);
        break;
      default:
        results.sort((a, b) => b.rating - a.rating);
    }

    results = results.slice(0, limit || 5);

    const lines = results.map(
      (c) =>
        `### ${c.rating >= 9 ? "⭐" : "🎰"} ${c.name} — ${c.rating}/10\n` +
        `💰 **${c.welcome_bonus}**\n` +
        `🔄 Wagering: ${c.wagering}${c.free_spins ? ` | 🎰 ${c.free_spins} Free Spins` : ""}${c.no_deposit ? " | 🆓 No Deposit Bonus" : ""}${c.sports_betting ? " | ⚽ Sports" : ""}\n` +
        `💳 Min Deposit: ${c.min_deposit} | License: ${c.license}\n` +
        `🪙 Crypto: ${c.crypto.join(", ")}\n` +
        `✅ ${c.pros.join(" • ")}\n` +
        `❌ ${c.cons.join(" • ")}\n`
    );

    return {
      content: [
        {
          type: "text",
          text: `🎰 **Top ${results.length} Crypto Casino Bonuses**\n\n${lines.join("\n")}`,
        },
      ],
    };
  }
);

server.tool(
  "compare_casinos",
  "Compare two or more crypto casinos side by side",
  {
    casinos: z.array(z.string()).describe("Casino names or slugs to compare (e.g. ['stake', 'bcgame', 'bitstarz'])"),
  },
  async ({ casinos }) => {
    const found = casinos
      .map((name) => {
        const lower = name.toLowerCase().trim();
        return CASINOS.find(
          (c) => c.slug === lower || c.name.toLowerCase().includes(lower)
        );
      })
      .filter(Boolean);

    if (found.length === 0) {
      const available = CASINOS.map((c) => c.slug).join(", ");
      return {
        content: [
          {
            type: "text",
            text: `❌ No matching casinos found. Available: ${available}`,
          },
        ],
      };
    }

    // Build comparison table
    const headers = ["Feature", ...found.map((c) => c.name)];
    const rows = [
      ["Rating", ...found.map((c) => `${c.rating}/10`)],
      ["Welcome Bonus", ...found.map((c) => c.welcome_bonus)],
      ["Wagering", ...found.map((c) => c.wagering)],
      ["Free Spins", ...found.map((c) => c.free_spins ? `${c.free_spins}` : "None")],
      ["No Deposit", ...found.map((c) => c.no_deposit ? "✅ Yes" : "❌ No")],
      ["Min Deposit", ...found.map((c) => c.min_deposit)],
      ["Sports Betting", ...found.map((c) => c.sports_betting ? "✅ Yes" : "❌ No")],
      ["Cryptos", ...found.map((c) => `${c.crypto.length} supported`)],
      ["License", ...found.map((c) => c.license)],
    ];

    const table = [
      `| ${headers.join(" | ")} |`,
      `| ${headers.map(() => "---").join(" | ")} |`,
      ...rows.map((r) => `| ${r.join(" | ")} |`),
    ].join("\n");

    // Find the winner
    const winner = found.reduce((best, c) => (c.rating > best.rating ? c : best));

    return {
      content: [
        {
          type: "text",
          text: `📊 **Casino Comparison**\n\n${table}\n\n🏆 **Best Overall: ${winner.name}** (${winner.rating}/10)\n\n⚠️ Gambling involves risk. Only bet what you can afford to lose. Please gamble responsibly.`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
