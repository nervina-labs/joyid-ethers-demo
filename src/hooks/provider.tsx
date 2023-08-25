import { providers } from 'ethers'
import { JoyIDSigner } from '@joyid/ethers'
import { SEPOLIA_RPC_URL } from '../env'

export const SepoliaNetwork = {
  name: 'sepolia',
  chainId: 11155111,
}

export const createProvider = (
  rpcURL: string = SEPOLIA_RPC_URL,
  network = SepoliaNetwork
) => {
  return new providers.JsonRpcBatchProvider(rpcURL, network)
}

export const createSigner = (
  address: string,
  provider: providers.Provider = createProvider()
) => {
  return new JoyIDSigner(provider, address)
}
