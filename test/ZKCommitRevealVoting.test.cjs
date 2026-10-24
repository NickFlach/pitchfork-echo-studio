const { expect } = require('chai');
const { ethers, network } = require('hardhat');

describe('Real Semaphore commit/reveal voting', function () {
  let voting, semaphore, voters, identities, group, generateProof, proof, salt;
  const next = async (time) => { await network.provider.send('evm_setNextBlockTimestamp', [Number(time)]); await network.provider.send('evm_mine'); };
  before(async function () {
    const { Identity } = await import('@semaphore-protocol/identity');
    const { Group } = await import('@semaphore-protocol/group');
    ({ generateProof } = await import('@semaphore-protocol/proof'));
    voters = await ethers.getSigners(); identities = [new Identity(), new Identity(), new Identity()];
    group = new Group(identities.map(i => i.commitment));
    const poseidon = await (await ethers.getContractFactory('PoseidonT3')).deploy(); await poseidon.waitForDeployment();
    const verifier = await (await ethers.getContractFactory('SemaphoreVerifier')).deploy(); await verifier.waitForDeployment();
    semaphore = await (await ethers.getContractFactory('Semaphore', { libraries: { PoseidonT3: await poseidon.getAddress() } })).deploy(await verifier.getAddress());
    await semaphore.waitForDeployment();
    voting = await (await ethers.getContractFactory('ZKCommitRevealVoting')).deploy(await semaphore.getAddress()); await voting.waitForDeployment();
    await voting.createProposal('Community proposal', 'A real cryptographically verified community ballot.', voters.slice(0, 3).map(v => v.address), 60, 60, 60, 1);
  });
  it('requires allowlisted membership and freezes registration before commits', async function () {
    await expect(voting.connect(voters[3]).register(1, identities[0].commitment)).to.be.revertedWith('Ineligible or registered');
    for (let i = 0; i < 3; i++) await voting.connect(voters[i]).register(1, identities[i].commitment);
    await expect(voting.register(1, identities[0].commitment)).to.be.revertedWith('Ineligible or registered');
    expect(await semaphore.getMerkleTreeRoot(0)).to.equal(group.root);
    await next((await voting.getProposal(1)).registrationEnd);
    await expect(voting.register(1, new (await import('@semaphore-protocol/identity')).Identity().commitment)).to.be.revertedWith('Registration closed');
  });
  it('verifies an actual ZK proof and rejects tampering and duplicate commitments', async function () {
    const scope = await voting.scope(1);
    const initial = await generateProof(identities[0], group, 1n, scope);
    salt = ethers.hexlify(ethers.randomBytes(32));
    const commitment = await voting.ballotCommitment(1, initial.nullifier, 0, salt);
    proof = await generateProof(identities[0], group, commitment, scope);
    await expect(voting.commit(1, { ...proof, message: (commitment + 1n).toString() })).to.be.revertedWith('Invalid membership proof');
    await expect(voting.commit(1, { ...proof, scope: (scope + 1n).toString() })).to.be.revertedWith('Invalid ballot domain');
    // Public Semaphore validation must not enable nullifier-burning denial of service.
    await semaphore.validateProof(0, proof);
    await voting.connect(voters[3]).commit(1, proof);
    await expect(voting.commit(1, proof)).to.be.revertedWith('Already committed');
    expect((await voting.getProposal(1)).committed).to.equal(1);
    await expect(voting.reveal(1, proof.nullifier, 0, salt)).to.be.revertedWith('Not reveal phase');
  });
  it('only reveals matching ballots during reveal and rejects repeat or invalid choices', async function () {
    await next((await voting.getProposal(1)).commitEnd);
    await expect(voting.commit(1, proof)).to.be.revertedWith('Not commit phase');
    await expect(voting.reveal(1, proof.nullifier, 3, salt)).to.be.revertedWith('Invalid choice');
    await expect(voting.reveal(1, proof.nullifier, 1, salt)).to.be.revertedWith('Invalid reveal');
    await expect(voting.reveal(1, proof.nullifier, 0, ethers.ZeroHash)).to.be.revertedWith('Invalid reveal');
    await voting.connect(voters[4]).reveal(1, proof.nullifier, 0, salt);
    await expect(voting.reveal(1, proof.nullifier, 0, salt)).to.be.revertedWith('Missing or revealed ballot');
    await expect(voting.tally(1)).to.be.revertedWith('Not tally phase');
  });
  it('allows anyone to finalize exactly once after reveal with equal-weight quorum results', async function () {
    await next((await voting.getProposal(1)).revealEnd);
    await voting.connect(voters[5]).tally(1);
    const result = await voting.getProposal(1);
    expect(result.tallied).to.equal(true); expect(result.passed).to.equal(true);
    expect(result.forVotes).to.equal(1); expect(result.againstVotes).to.equal(0); expect(result.abstainVotes).to.equal(0);
    expect(result.revealed).to.equal(1);
    await expect(voting.tally(1)).to.be.revertedWith('Already tallied');
  });
});