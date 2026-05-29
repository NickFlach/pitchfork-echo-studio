import { PageSEO } from "@/components/PageSEO";

interface SEOMeta {
  title: string;
  description: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const ROUTE_SEO: Record<string, SEOMeta> = {
  "/": {
    title: "Pitchfork Protocol — Decentralized Tools for Justice",
    description:
      "Build better DAOs with privacy-preserving ZK voting, AI-assisted governance, and tools that diffuse power instead of concentrating it.",
  },
  "/whitepaper": {
    title: "Fighting Back Whitepaper — Pitchfork Protocol",
    description:
      "The Fighting Back whitepaper: a blueprint for decentralized resistance, privacy-first identity, and accountable on-chain governance.",
    type: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Fighting Back: A Whitepaper for Decentralized Resistance",
      description:
        "Blueprint for decentralized resistance, privacy-first identity, and accountable on-chain governance.",
      author: { "@type": "Organization", name: "Pitchfork Protocol Team" },
      publisher: { "@type": "Organization", name: "Pitchfork Protocol" },
      mainEntityOfPage: "https://protocol.pitchforks.social/whitepaper",
    },
  },
  "/governance": {
    title: "Governance — Pitchfork Protocol",
    description:
      "Participate in on-chain governance: review proposals, cast ZK-private votes, and shape protocol direction with the community.",
  },
  "/decentralization": {
    title: "Decentralization Dashboard — Pitchfork Protocol",
    description:
      "Real-time metrics on power distribution, concentration, and diffusion across the Pitchfork Protocol ecosystem.",
  },
  "/consciousness": {
    title: "Consciousness Engine — Pitchfork Protocol",
    description:
      "Reflective, multiscale decision-making tools that combine pattern recognition and AI to deepen collective consciousness.",
  },
  "/leadership": {
    title: "Leadership Tools — Pitchfork Protocol",
    description:
      "Coordination, subscription, and strategy tools for movement leaders organizing on Pitchfork Protocol.",
  },
  "/enterprise-leadership": {
    title: "Enterprise Leadership — Pitchfork Protocol",
    description:
      "Enterprise-grade leadership coordination, analytics, and governance features for large organizations.",
  },
  "/funding": {
    title: "Fund Development — Pitchfork Protocol",
    description:
      "Support developers and public-goods work that keeps Pitchfork Protocol decentralized, audited, and free to use.",
  },
  "/organize": {
    title: "Organize Movements — Pitchfork Protocol",
    description:
      "Coordinate activists and movements with encrypted communication, planning, and on-chain accountability tools.",
  },
  "/identity": {
    title: "Privacy-First Identity — Pitchfork Protocol",
    description:
      "Wallet-based identity and reputation with zero-knowledge proofs — prove what you need without revealing who you are.",
  },
  "/verify": {
    title: "Verify Evidence — Pitchfork Protocol",
    description:
      "Verify on-chain credentials, documents, and witness evidence with cryptographic proofs anyone can audit.",
  },
  "/messages": {
    title: "Encrypted Messages — Pitchfork Protocol",
    description:
      "End-to-end encrypted messaging for activists, organizers, and DAO contributors building safer coordination.",
  },
  "/support": {
    title: "Support Campaigns — Pitchfork Protocol",
    description:
      "Browse active aid campaigns, donate transparently, and back the people fighting injustice on the ground.",
  },
  "/ai-settings": {
    title: "AI Settings — Pitchfork Protocol",
    description:
      "Configure the Lovable AI integration powering governance assistance, proposal analysis, and consciousness tools.",
  },
  "/provider-health": {
    title: "AI Provider Health — Pitchfork Protocol",
    description:
      "Live health and status dashboard for the AI providers powering Pitchfork Protocol features.",
  },
  "/performance": {
    title: "Performance Monitor — Pitchfork Protocol",
    description:
      "Real-time performance and Web Vitals monitoring for the Pitchfork Protocol application.",
  },
};

export const RouteSEO = ({ path }: { path: string }) => {
  const meta = ROUTE_SEO[path];
  if (!meta) return null;
  return (
    <PageSEO
      path={path}
      title={meta.title}
      description={meta.description}
      type={meta.type}
      jsonLd={meta.jsonLd}
    />
  );
};
