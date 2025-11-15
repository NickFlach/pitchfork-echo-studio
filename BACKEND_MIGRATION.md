# Backend Migration Status

## Overview
The Express backend (`server/`) is not deployed in production. This document tracks the migration of backend functionality to Supabase Edge Functions.

## Completed Migrations

### ✅ AI Credentials Endpoint
- **Old**: `GET /api/admin/ai-credentials`
- **New**: Edge Function `ai-credentials`
- **Status**: Deployed and working
- **Files Changed**:
  - Created `supabase/functions/ai-credentials/index.ts`
  - Updated `src/lib/queryClient.ts` to route requests
  - Updated `src/contexts/TierContext.tsx` to use new endpoint

### ✅ WebSocket Connection Handling
- **Old**: Connected to `ws://localhost:3001` in all environments
- **New**: Only connects in development, shows offline notice in production
- **Files Changed**:
  - Updated `src/components/consciousness/RealTimeCollaboration.tsx`

## Pending Migrations

The following backend endpoints are still used by the frontend but not available in production:

### Consciousness State API
- `GET /api/consciousness-states/:agentId`
- `POST /api/consciousness-states`

### Decision Records API
- `GET /api/decisions/:agentId`
- `POST /api/decisions`

### Reflection Logs API
- `GET /api/reflections/:agentId`
- `POST /api/reflections`

### Learning Cycles API
- `GET /api/learning-cycles/:agentId`
- `POST /api/learning-cycles`

### Complexity Maps API
- `GET /api/complexity-maps`
- `POST /api/complexity-maps`

### Decision Synthesis API
- `POST /api/consciousness/process-decision`
- `POST /api/consciousness/reflect`
- `POST /api/consciousness/learn`
- `POST /api/consciousness/handle-crisis`
- `POST /api/multiscale-decision`

### Strategic Intelligence API
- `POST /api/leadership/analyze-decision`
- `POST /api/leadership/optimize-resources`
- `POST /api/leadership/analyze-opposition`
- `POST /api/leadership/coordinate-movements`

### Enterprise Leadership API
- `GET/POST/PUT /api/enterprise/executive-assessments`
- `GET/POST/PUT /api/enterprise/strategic-plans`
- `GET/POST/PUT /api/enterprise/team-assessments`
- `GET/POST/PUT /api/enterprise/leadership-development`
- `GET/POST/PUT /api/enterprise/analytics`

## Migration Strategy

### Option 1: Edge Functions (Recommended)
Convert Express routes to Supabase Edge Functions one-by-one as features are needed.

**Pros:**
- Serverless, scales automatically
- Integrated with Supabase
- No separate deployment needed

**Cons:**
- Requires rewriting each endpoint
- Time-consuming for many endpoints

### Option 2: Deploy Express Backend
Deploy the Express backend to a separate service (Railway, Render, Fly.io).

**Pros:**
- All endpoints work immediately
- Minimal code changes

**Cons:**
- Requires managing separate infrastructure
- Additional cost
- Not integrated with Lovable deployment

### Option 3: Hybrid Approach (Current)
- Critical endpoints → Edge Functions
- Complex logic endpoints → Keep in Express, deploy separately
- Frontend gracefully handles unavailable endpoints

## Current Production Behavior

### Working Features:
- ✅ AI configuration detection
- ✅ Wallet connection and NEO X integration
- ✅ Basic UI and navigation

### Degraded Features:
- ⚠️ Consciousness state tracking (data not persisted)
- ⚠️ Decision synthesis (AI features unavailable)
- ⚠️ Real-time collaboration (offline mode)
- ⚠️ Strategic intelligence (not available)

### Broken Features:
- ❌ None (all features gracefully degrade)

## Next Steps

1. **Immediate**: Test the deployed Edge Function
2. **Short-term**: Migrate most-used endpoints to Edge Functions
3. **Long-term**: Consider deploying full Express backend or complete Edge Function migration

## Testing

To test the Edge Function:
```bash
# Check if Edge Function is deployed
curl https://vliuwsezslvfrlxwgmzd.supabase.co/functions/v1/ai-credentials \
  -H "apikey: your-anon-key"

# Should return array of AI provider configurations
```

## Environment Variables

Edge Functions need these secrets configured:
- `OPENAI_API_KEY` (optional)
- `ANTHROPIC_API_KEY` (optional)
- `GEMINI_API_KEY` (optional)
- `XAI_API_KEY` (optional)
