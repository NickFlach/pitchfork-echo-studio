# Proposal analysis history
- [x] Save successful AI analyses to Lovable Cloud, scoped to a verified wallet.
- [x] Show saved analyses and persist one advisory vote per wallet per proposal.
- [x] Test wallet ownership, persistence, voting, and the live assistant flow.

# On-chain ZK voting
- [x] Implement Semaphore-verified commit, reveal, and final tally contracts with tests.
- [x] Add wallet deployment, proposal creation, backup/recovery, and live voting screens.
- [x] Verify wallet deployment, live proposal, actual browser-generated proof, commit, reveal, tally, and reload on an isolated chain.
- [ ] Activate shared Neo X proposal — blocked on user's funded wallet deploying contracts and publishing the proposal with its eligible voters.

# Messages forum
- [x] Persist public threads, replies, and one upvote per wallet through verified signatures.
- [x] Replace legacy Messages with a searchable forum and thread detail view.
- [x] Verify persistence, replies, upvotes, and signature protection with tests and the live page.

# Home page search positioning
- [x] Rewrite home page and search descriptions around private ZK voting for DAOs on Neo X, remove the incorrect X tag, and verify sitemap coverage.

# Live Governance dashboard
- [ ] Replace legacy Governance proposals and votes with verified Neo X ZK contract reads and links.
- [ ] Connect the ZK deployment page to Governance and verify the integration.
- [ ] Deploy on Neo X and configure a shared address — requires the user's funded wallet approvals.