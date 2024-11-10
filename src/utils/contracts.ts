import { Address } from 'viem'

type ContractAddresses = {
  [chainId: number]: Address
}

// when testing on anvil, make contracts on other chains point to the same address if using assets from mainnet to test

export const CONTRACT_ADDRESSES: ContractAddresses = {
  1: '0x782167f6498a1216178bDFc435dF0820bCB09196' as Address, // ethereum
  8453: '0x35AB41C4cfEF24387E0add87F13BBb57A2bb25d9' as Address, // base
  42161: '0xF8dd992D8742D735C308f22650Ce9Fee5D61bc28' as Address, // arbitrum
  10: '0xF8dd992D8742D735C308f22650Ce9Fee5D61bc28' as Address, // optimism
  137: '0xF8dd992D8742D735C308f22650Ce9Fee5D61bc28' as Address, // polygon
  // 324: '0x...' as Address, // zksync
  // 31337: '0x...' as Address, // anvil (local testnet)
}
