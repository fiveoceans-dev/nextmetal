// utils/wallet.js
const { Wallet } = require('ethers');

async function generateWallet(password) {
  const wallet = Wallet.createRandom();
  const encryptedJson = await wallet.encrypt(password);

  return {
    address: Buffer.from(wallet.address.slice(2), 'hex'), // 20-byte Buffer
    encryptedPrivateKey: Buffer.from(encryptedJson, 'utf8'), // still stored as BYTEA
  };
}

module.exports = { generateWallet };
