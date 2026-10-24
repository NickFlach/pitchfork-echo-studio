const fs = require('fs');
const path = require('path');
const solc = require('solc');
const sources = {};
const entries = ['contracts/ZKCommitRevealVoting.sol', '@semaphore-protocol/contracts/base/SemaphoreVerifier.sol', 'poseidon-solidity/PoseidonT3.sol'];
for (const entry of entries) sources[entry] = { content: fs.readFileSync(entry.startsWith('contracts/') ? entry : path.join('node_modules', entry), 'utf8') };
const output = JSON.parse(solc.compile(JSON.stringify({ language: 'Solidity', sources, settings: {
  optimizer: { enabled: true, runs: 200 }, evmVersion: 'paris', viaIR: true,
  outputSelection: { '*': { '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode'] } }
}}), { import: (name) => {
  try { return { contents: fs.readFileSync(name.startsWith('contracts/') ? name : path.join('node_modules', name), 'utf8') }; }
  catch { return { error: `Import not found: ${name}` }; }
}}));
const errors = (output.errors || []).filter(e => e.severity === 'error');
if (errors.length) throw new Error(errors.map(e => e.formattedMessage).join('\n'));
fs.mkdirSync('src/contracts/zk', { recursive: true });
for (const [sourceName, contracts] of Object.entries(output.contracts)) {
  for (const [contractName, contract] of Object.entries(contracts)) {
    const artifact = { _format: 'hh-sol-artifact-1', contractName, sourceName, abi: contract.abi,
      bytecode: '0x' + contract.evm.bytecode.object, deployedBytecode: '0x' + contract.evm.deployedBytecode.object,
      linkReferences: contract.evm.bytecode.linkReferences, deployedLinkReferences: contract.evm.deployedBytecode.linkReferences };
    const dir = path.join('artifacts', sourceName); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, contractName + '.json'), JSON.stringify(artifact));
    if (['ZKCommitRevealVoting', 'Semaphore', 'SemaphoreVerifier', 'PoseidonT3'].includes(contractName)) {
      fs.writeFileSync(`src/contracts/zk/${contractName}.json`, JSON.stringify(artifact));
      console.log(contractName, contract.evm.deployedBytecode.object.length / 2, 'runtime bytes');
    }
  }
}