import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.23.8";
import { buildCorsHeaders } from "../_shared/cors.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { analysisSchema, walletAddress } from '../_shared/proposal-wallet.ts';

// Called internally only after a one-use wallet signature is verified.
const Body = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(4000),
  priority: z.enum(["decentralization", "treasury", "community", "balanced"]).default("balanced"),
  risk: z.enum(["low", "medium", "high"]).default("medium"),
  wallet: walletAddress,
});

const tool = {
  type: "function",
  function: {
    name: "report",
    description: "Structured proposal analysis",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string", description: "2-3 sentence plain-language summary" },
        recommendation: { type: "string", enum: ["for", "against", "abstain"] },
        confidence: { type: "number", description: "0-100" },
        decentralizationImpact: { type: "string", enum: ["increases", "neutral", "decreases"] },
        captureRisk: { type: "string", enum: ["low", "medium", "high"] },
        pros: { type: "array", items: { type: "string" } },
        cons: { type: "array", items: { type: "string" } },
        reasoning: { type: "string" },
      },
      required: ["summary", "recommendation", "confidence", "decentralizationImpact", "captureRisk", "pros", "cons", "reasoning"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  const cors = buildCorsHeaders(req);
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { title, description, priority, risk } = parsed.data;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const storageUrl = Deno.env.get('SUPABASE_URL');
    if (!serviceKey || !storageUrl || req.headers.get('Authorization') !== `Bearer ${serviceKey}`) {
      return json({ error: 'Verify your wallet before analyzing a proposal' }, 401);
    }

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI is not configured" }, 500);

    const system = `You are a neutral DAO governance analyst following Vitalik Buterin's principles for better DAOs: robustness, capture resistance, privacy, reducing decision fatigue, and favoring decentralization. The voter prioritizes "${priority}" and has "${risk}" risk tolerance. Be concise, balanced, and concrete. Never invent facts not in the proposal.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Proposal title: ${title}\n\nProposal description:\n${description}` },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "report" } },
      }),
    });

    if (res.status === 429) return json({ error: "Too many requests right now, please try again shortly." }, 429);
    if (res.status === 402) return json({ error: "AI credits are used up. Please add credits to continue." }, 402);
    if (!res.ok) {
      console.error("gateway", res.status, await res.text());
      return json({ error: "AI analysis failed" }, 500);
    }
    const data = await res.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return json({ error: "AI returned no analysis" }, 500);
    const analysis = analysisSchema.parse(JSON.parse(args));
    const db = createClient(storageUrl, serviceKey);
    const { data: proposal, error: saveError } = await db.from('ai_proposal_analyses').insert({
      wallet_address: parsed.data.wallet, title, description, priority, risk, analysis,
    }).select().single();
    if (saveError) return json({ error: 'Analysis could not be saved. Please try again.' }, 500);
    return json({ proposal: { ...proposal, ai_proposal_votes: null } });
  } catch (e) {
    console.error(e);
    return json({ error: "Unexpected error" }, 500);
  }
});
