require('@nomicfoundation/hardhat-toolbox');
module.exports = {
  solidity: '0.8.26', networks: { hardhat: { chainId: 47763 } },
  paths: { sources: '../contracts', tests: '.', cache: '../cache', artifacts: '../artifacts' },
  mocha: { timeout: 180000 }
};