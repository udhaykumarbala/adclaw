import { ethers } from 'ethers';

const RPC_URL = process.env.GOAT_RPC_URL || 'https://rpc.testnet3.goat.network';
const PRIVATE_KEY = process.env.GOAT_PRIVATE_KEY || '';
// Testnet3 contract from hackathon portal
const IDENTITY_REGISTRY = process.env.ERC8004_IDENTITY_REGISTRY || '0x556089008Fc0a60cD09390Eca93477ca254A5522';

const IDENTITY_ABI = [
  'function register(string agentURI) external returns (uint256)',
  'function register() external returns (uint256)',
  'function setAgentWallet(uint256 agentId, address newWallet, uint256 deadline, bytes signature) external',
  'function setMetadata(uint256 agentId, string key, bytes value) external',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

export async function registerAgent(agentURI: string): Promise<{ agentId: string; txHash: string }> {
  if (!signer) throw new Error('GOAT_PRIVATE_KEY is not configured');
  const registry = new ethers.Contract(IDENTITY_REGISTRY, IDENTITY_ABI, signer);

  console.log(`Registering agent with URI: ${agentURI}`);

  const tx = await registry['register(string)'](agentURI);
  const receipt = await tx.wait();

  const transferEvent = receipt.logs.find(
    (log: any) => log.topics[0] === ethers.id('Transfer(address,address,uint256)')
  );

  const agentId = transferEvent
    ? ethers.toBigInt(transferEvent.topics[3]).toString()
    : 'unknown';

  console.log(`Agent registered! ID: ${agentId}, TX: ${receipt.hash}`);

  return { agentId, txHash: receipt.hash };
}

export async function setAgentMetadata(agentId: string, key: string, value: string) {
  if (!signer) throw new Error('GOAT_PRIVATE_KEY is not configured');
  const registry = new ethers.Contract(IDENTITY_REGISTRY, IDENTITY_ABI, signer);

  const tx = await registry.setMetadata(BigInt(agentId), key, ethers.toUtf8Bytes(value));
  await tx.wait();
}
