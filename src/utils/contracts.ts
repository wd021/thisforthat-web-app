import { Address } from 'viem'

type ContractAddresses = {
  [chainId: number]: Address
}

export const CONTRACT_ADDRESSES: ContractAddresses = {
  1: '0x...' as Address, // mainnet
  11155111: '0x...' as Address, // sepolia
  31337: '0x810090f35DFA6B18b5EB59d298e2A2443a2811E2' as Address, // anvil
}
