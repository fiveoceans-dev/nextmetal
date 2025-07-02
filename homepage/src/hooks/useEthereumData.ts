
import { useAccount, useBalance, useBlockNumber, useChainId } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { createPublicClient, http, formatEther } from 'viem'
import { mainnet } from 'viem/chains'

// Simple hook for Ethereum account info
export const useEthereumAccount = () => {
  const { address, isConnected, isConnecting } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const { data: blockNumber } = useBlockNumber()

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    balance: balance ? formatEther(balance.value) : '0',
    blockNumber: blockNumber?.toString(),
  }
}

// Hook for fetching token balance (example with USDC)
export const useTokenBalance = (tokenAddress: `0x${string}`, userAddress?: `0x${string}`) => {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
  })

  return useQuery({
    queryKey: ['tokenBalance', tokenAddress, userAddress],
    queryFn: async () => {
      if (!userAddress) return '0'
      
      try {
        const balance = await publicClient.readContract({
          address: tokenAddress,
          abi: [
            {
              constant: true,
              inputs: [{ name: '_owner', type: 'address' }],
              name: 'balanceOf',
              outputs: [{ name: 'balance', type: 'uint256' }],
              type: 'function',
            },
          ],
          functionName: 'balanceOf',
          args: [userAddress],
        })
        return formatEther(balance as bigint)
      } catch (error) {
        console.error('Error fetching token balance:', error)
        return '0'
      }
    },
    enabled: !!userAddress && !!tokenAddress,
  })
}

// Hook for getting gas price
export const useGasPrice = () => {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http()
  })

  return useQuery({
    queryKey: ['gasPrice'],
    queryFn: async () => {
      try {
        const gasPrice = await publicClient.getGasPrice()
        return formatEther(gasPrice)
      } catch (error) {
        console.error('Error fetching gas price:', error)
        return '0'
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}
