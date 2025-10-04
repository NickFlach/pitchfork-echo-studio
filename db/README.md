# 🗄️ Pitchfork Protocol Database

**Real PostgreSQL persistence replacing in-memory storage**

## 🎯 Overview

This directory contains the database schema, migrations, and connection setup for Pitchfork Protocol. 

**Critical Fix:** Previously, all data was stored in-memory and lost on server restart. This implementation provides real persistence using PostgreSQL + Drizzle ORM.

## 📁 Structure

```
db/
├── schema.ts          # Complete database schema
├── index.ts           # Database connection setup
├── migrate.ts         # Migration runner script
├── migrations/        # Auto-generated migration files
└── README.md          # This file
```

## 🚀 Quick Start

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE pitchfork;

# Create user (optional)
CREATE USER pitchfork_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pitchfork TO pitchfork_user;

# Exit
\q
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update:

```env
DATABASE_URL=postgresql://localhost:5432/pitchfork
# Or with user/password:
# DATABASE_URL=postgresql://pitchfork_user:your_password@localhost:5432/pitchfork
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Generate & Run Migrations

```bash
# Generate migration files from schema
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (for development)
npm run db:push
```

### 6. Verify Setup

```bash
# Open Drizzle Studio to view database
npm run db:studio
```

Visit http://localhost:4983 to see your database tables.

## 📊 Database Schema

### Core Tables

#### **identities** - User identity verification
- Wallet-based authentication
- Verification levels (none, basic, verified)
- ZK proof support

#### **movements** - Activist organizations
- Movement coordination
- Member management
- Event scheduling

#### **campaigns** - Funding campaigns
- Goal tracking
- Donation management
- Transparency metrics

#### **documents** - Evidence & corruption records
- IPFS hash storage
- Verification workflow
- Category classification

### Consciousness Tables

#### **consciousness_states** - Agent consciousness tracking
- Consciousness level (0-1)
- Temporal coherence
- Ethical alignment
- Verification hashes

#### **decision_records** - AI decision logs
- Decision context
- Options evaluated
- Reasoning chains
- Ethical scores

#### **reflection_logs** - Meta-cognitive tracking
- Recursive reflection depth
- Generated insights
- Self-questioning

#### **learning_cycles** - Adaptive learning
- Experience processing
- Learning extraction
- Adaptation tracking

### Strategy & Intelligence

#### **campaign_strategy_plans** - AI-generated strategies
- Movement strategies
- Risk assessments
- Impact predictions

#### **corruption_analysis_results** - Corruption detection
- Suspicion levels
- Indicator analysis
- Recommendations

## 🔧 Database Operations

### NPM Scripts

```bash
# Generate migrations from schema changes
npm run db:generate

# Run pending migrations
npm run db:migrate

# Push schema directly (dev only)
npm run db:push

# Open database GUI
npm run db:studio
```

### Programmatic Usage

```typescript
import { storage } from './server/db-storage';

// Create identity
const identity = await storage.createIdentity({
  walletAddress: '0x1234...',
  verificationLevel: 'basic',
});

// Create campaign
const campaign = await storage.createCampaign({
  title: 'Transparency Initiative',
  description: 'Demand public records',
  category: 'corruption',
  goalAmount: '50000',
  // ...
});

// Track consciousness
const state = await storage.createConsciousnessState({
  agentId: 'strategist-1',
  consciousnessLevel: '0.85',
  temporalCoherence: '0.92',
  ethicalAlignment: '0.95',
  // ...
});
```

## 🔄 Migration Workflow

### Making Schema Changes

1. **Edit schema.ts**
   ```typescript
   export const newTable = pgTable('new_table', {
     id: serial('id').primaryKey(),
     // ... fields
   });
   ```

2. **Generate migration**
   ```bash
   npm run db:generate
   ```

3. **Review migration** in `db/migrations/`

4. **Run migration**
   ```bash
   npm run db:migrate
   ```

### Rollback

Drizzle doesn't support automatic rollbacks. For rollback:

1. Manually edit migration SQL
2. Or restore from backup
3. Or drop and recreate database (dev only)

## 🔐 Security Best Practices

1. **Never commit `.env`** - Use `.env.example` as template
2. **Use strong passwords** - For production databases
3. **Enable SSL** - For remote connections
4. **Regular backups** - Automate database backups
5. **Encrypt sensitive data** - Use application-level encryption for API keys

## 📈 Performance Tips

1. **Indexes** - Added on frequently queried columns
2. **Connection pooling** - Configured with max 20 connections
3. **Query optimization** - Use Drizzle's query builder
4. **Pagination** - Limit large result sets (currently 100)

## 🐛 Troubleshooting

### Connection Failed

```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
echo $DATABASE_URL
```

### Migration Errors

```bash
# Reset database (dev only - destroys data!)
dropdb pitchfork
createdb pitchfork
npm run db:migrate
```

### Permission Errors

```bash
# Grant permissions
psql pitchfork
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pitchfork_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pitchfork_user;
```

## 🔗 Related Files

- **`server/db-storage.ts`** - Storage layer implementation
- **`server/storage.ts`** - Old in-memory storage (deprecated)
- **`drizzle.config.ts`** - Drizzle configuration
- **`.env`** - Database credentials (gitignored)

## 📚 Learn More

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)

## ✅ Migration Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] `.env` configured with `DATABASE_URL`
- [ ] Dependencies installed (`npm install`)
- [ ] Migrations generated (`npm run db:generate`)
- [ ] Migrations run (`npm run db:migrate`)
- [ ] Database verified (`npm run db:studio`)
- [ ] Old `storage.ts` replaced with `db-storage.ts` in routes
- [ ] Server restarted
- [ ] Data persists across restarts ✨

---

**Status:** Production-ready database layer implemented!  
**Impact:** Data now persists across server restarts - critical fix complete! 🎉
