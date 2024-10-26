import { Address } from 'viem'

type ContractAddresses = {
  [chainId: number]: Address
}

export const CONTRACT_ADDRESSES: ContractAddresses = {
  1: '0x...' as Address, // mainnet
  11155111: '0x...' as Address, // sepolia
  31337: '0xf0F5e9b00b92f3999021fD8B88aC75c351D93fc7' as Address, // anvil
}
