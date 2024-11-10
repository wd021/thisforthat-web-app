import { Address } from 'viem'

type ContractAddresses = {
  [chainId: number]: Address
}

export const CONTRACT_ADDRESSES: ContractAddresses = {
  1: '0x...' as Address, // ethereum
  8453: '0x...' as Address, // base
  42161: '0x...' as Address, // arbitrum
  10: '0x...' as Address, // optimism
  137: '0x...' as Address, // polygon
  324: '0x...' as Address, // zksync
  31337: '0x...' as Address, // anvil (local testnet)
}
