import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveVotingAddress, proposalPhase, zkProposalLink, type LiveZKProposal } from '../../src/lib/zkGovernance';

const address = '0x0000000000000000000000000000000000001234';
test('unconfigured governance never invents a deployed address', () => {
  assert.equal(resolveVotingAddress(null, null), '');
  assert.equal(resolveVotingAddress('invalid', address), '');
});
test('explicit contract links take precedence over device bookmarks', () => {
  const other = '0x0000000000000000000000000000000000005678';
  assert.equal(resolveVotingAddress(address, other), address);
  assert.equal(resolveVotingAddress(null, address), address);
  assert.equal(zkProposalLink(address, '3'), `/zk-voting?contract=${address}&proposal=3`);
});
test('proposal lifecycle follows on-chain deadlines and tally rather than local outcomes', () => {
  const p: LiveZKProposal = { id: '1', title: 'Proposal', description: 'Description', creator: address,
    registrationEnd: 100n, commitEnd: 200n, revealEnd: 300n, quorum: 1n, committed: 1n,
    revealed: 1n, forVotes: 1n, againstVotes: 0n, abstainVotes: 0n, tallied: false, passed: false };
  assert.equal(proposalPhase(p, 99), 'Registration');
  assert.equal(proposalPhase(p, 100), 'Commit');
  assert.equal(proposalPhase(p, 200), 'Reveal');
  assert.equal(proposalPhase(p, 300), 'Ready to tally');
  assert.equal(proposalPhase({ ...p, tallied: true, passed: true }, 300), 'Passed');
  assert.equal(proposalPhase({ ...p, tallied: true }, 300), 'Not passed');
});