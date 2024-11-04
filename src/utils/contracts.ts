import { Address } from 'viem'

type ContractAddresses = {
  [chainId: number]: Address
}

export const CONTRACT_ADDRESSES: ContractAddresses = {
  1: '0x...' as Address, // mainnet
  11155111: '0x...' as Address, // sepolia
  31337: '0x1D87585dF4D48E52436e26521a3C5856E4553e3F' as Address, // anvil
}
