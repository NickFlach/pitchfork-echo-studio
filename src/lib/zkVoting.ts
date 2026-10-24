import { Contract, ContractFactory, JsonRpcProvider, getAddress, type Signer } from 'ethers';
import votingArtifact from '@/contracts/zk/ZKCommitRevealVoting.json';
import semaphoreArtifact from '@/contracts/zk/Semaphore.json';
import verifierArtifact from '@/contracts/zk/SemaphoreVerifier.json';
import poseidonArtifact from '@/contracts/zk/PoseidonT3.json';

export const ZK_CHAIN = 47763;
export const zkReader = new JsonRpcProvider('https://mainnet-1.rpc.banelabs.org', ZK_CHAIN);
export const votingContract = (address: string, runner: Signer | JsonRpcProvider = zkReader) => new Contract(getAddress(address), votingArtifact.abi, runner);
export async function requireNeoX(signer: Signer) {
  if (!signer.provider || (await signer.provider.getNetwork()).chainId !== BigInt(ZK_CHAIN)) throw new Error('Switch your wallet to Neo X Mainnet.');
  // Read the live RPC chain, not just the provider’s cached network.
  const provider = signer.provider as unknown as { send: (method: string, params: unknown[]) => Promise<string> };
  if (BigInt(await provider.send('eth_chainId', [])) !== BigInt(ZK_CHAIN)) throw new Error('Neo X Mainnet required.');
}
export async function checkVotingContract(address: string, reader = zkReader) {
  if ((await reader.getNetwork()).chainId !== BigInt(ZK_CHAIN)) throw new Error('Invalid read network.');
  if ((await reader.getCode(getAddress(address))) === '0x') throw new Error('No voting contract at this address.');
  const contract = votingContract(address, reader);
  if (await contract.CHAIN_ID() !== BigInt(ZK_CHAIN)) throw new Error('Unsupported voting contract.');
  await contract.proposalCount();
  return contract;
}
type Artifact = typeof semaphoreArtifact;
function linkedBytecode(artifact: Artifact, libraries: Record<string, string>) {
  let code = artifact.bytecode.slice(2);
  for (const references of Object.values(artifact.linkReferences)) {
    for (const [name, links] of Object.entries(references) as [string, { start: number; length: number }[]][]) {
      const address = libraries[name];
      if (!address) throw new Error(`Missing deployment library: ${name}`);
      for (const link of links) code = code.slice(0, link.start * 2) + address.slice(2) + code.slice((link.start + link.length) * 2);
    }
  }
  return `0x${code}`;
}
export async function deployZKVoting(signer: Signer, progress: (message: string) => void) {
  const cacheKey = `pitchfork-zk-deployment:${ZK_CHAIN}:${(await signer.getAddress()).toLowerCase()}`;
  const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}') as Record<string, string>;
  const deploy = async (name: string, artifact: Artifact, args: string[] = [], libraries: Record<string, string> = {}) => {
    await requireNeoX(signer);
    if (cached[name] && signer.provider && await signer.provider.getCode(cached[name]) !== '0x') return cached[name];
    progress(`Approve ${name} deployment in your wallet…`);
    const instance = await new ContractFactory(artifact.abi, linkedBytecode(artifact, libraries), signer).deploy(...args);
    progress(`Confirming ${name}…`); await instance.waitForDeployment();
    const address = await instance.getAddress(); cached[name] = address;
    localStorage.setItem(cacheKey, JSON.stringify(cached)); return address;
  };
  const poseidon = await deploy('Poseidon hash library', poseidonArtifact as Artifact);
  const verifier = await deploy('ZK proof verifier', verifierArtifact as Artifact);
  const semaphore = await deploy('Semaphore membership', semaphoreArtifact, [verifier], { PoseidonT3: poseidon });
  return deploy('Voting contract', votingArtifact as Artifact, [semaphore]);
}
export type BallotBackup = { version: 1; chainId: 47763; contract: string; proposalId: string; identity: string; choice?: number; salt?: string; nullifier?: string; commitment?: string };
export const vaultKey = (address: string, id: string, wallet: string) => `pitchfork-zk-ballot:${ZK_CHAIN}:${address.toLowerCase()}:${id}:${wallet.toLowerCase()}`;
export function saveBallot(key: string, ballot: BallotBackup) { localStorage.setItem(key, JSON.stringify(ballot)); }
export function readBallot(key: string): BallotBackup | null { const value = localStorage.getItem(key); return value ? JSON.parse(value) : null; }
export function downloadBallot(ballot: BallotBackup) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(ballot, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `private-ballot-${ballot.proposalId}.json`; link.click(); URL.revokeObjectURL(url);
}
export async function prepareBallot(contract: Contract, id: string, backup: BallotBackup, choice: number) {
  const [{ Identity }, { Group }, { generateProof }, { hexlify, randomBytes }] = await Promise.all([
    import('@semaphore-protocol/identity'), import('@semaphore-protocol/group'), import('@semaphore-protocol/proof'), import('ethers')
  ]);
  const identity = Identity.import(backup.identity);
  const members: bigint[] = await contract.getMembers(id); const group = new Group(members);
  if (group.size < 3 || group.indexOf(identity.commitment) < 0) throw new Error('At least three registered members, including your identity, are required.');
  const scope: bigint = await contract.scope(id);
  const initial = await generateProof(identity, group, 1n, scope);
  const salt = hexlify(randomBytes(32));
  const commitment: bigint = await contract.ballotCommitment(id, initial.nullifier, choice, salt);
  const proof = await generateProof(identity, group, commitment, scope);
  return { proof, backup: { ...backup, choice, salt, nullifier: proof.nullifier, commitment: commitment.toString() } };
}