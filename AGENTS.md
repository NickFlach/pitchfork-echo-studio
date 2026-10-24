# Architecture rules
- Persist AI proposal analyses and advisory votes through wallet-signature-verified Lovable Cloud functions; browser storage is not an authority for ownership or voting.
- AI Assistant votes are off-chain advisory records, separate from contract governance votes, so recorded preferences cannot be mistaken for executed transactions.
- ZK voting uses Semaphore v4 membership proofs with frozen allowlisted electorates and contract-local nullifiers; verifyProof prevents public Semaphore nullifier-burning from denying ballots.
- Deploy ZK contracts through the connected Neo X wallet using reproducible Paris-targeted artifacts; never embed a deployer key or treat local deployment records as mainnet deployments.
- Ballot secrets remain device-local with export/import recovery; only on-chain reads determine registration, commitments, reveals, and final results.