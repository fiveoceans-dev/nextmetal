
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useEthereumAccount, useGasPrice } from '@/hooks/useEthereumData'
import { Wallet, Unplug, Activity, Fuel } from 'lucide-react'

const WalletConnection = () => {
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { isConnected } = useAccount()
  const { 
    address, 
    balance, 
    chainId, 
    blockNumber 
  } = useEthereumAccount()
  const { data: gasPrice } = useGasPrice()

  if (isConnected && address) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-cyber-blue/10 rounded border border-cyber-blue/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyber-blue font-mono text-sm">WALLET.CONNECTED</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div className="text-cyber-yellow font-mono text-sm break-all">
            {address}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-cyber-dark/50 border-cyber-blue/20">
            <CardContent className="p-3">
              <div className="text-cyber-blue/70 font-mono text-xs">BALANCE</div>
              <div className="text-cyber-yellow font-mono text-sm font-bold">
                {parseFloat(balance).toFixed(4)} ETH
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cyber-dark/50 border-cyber-blue/20">
            <CardContent className="p-3">
              <div className="text-cyber-blue/70 font-mono text-xs">CHAIN.ID</div>
              <div className="text-cyber-yellow font-mono text-sm font-bold">
                {chainId}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-cyber-blue/30" />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyber-blue/70 font-mono text-xs">
            <Activity className="w-3 h-3" />
            BLOCK: {blockNumber}
          </div>
          <div className="flex items-center gap-2 text-cyber-blue/70 font-mono text-xs">
            <Fuel className="w-3 h-3" />
            GAS: {gasPrice ? `${parseFloat(gasPrice).toFixed(9)} ETH` : 'Loading...'}
          </div>
        </div>

        <Button
          onClick={() => disconnect()}
          variant="outline"
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 font-mono"
        >
          <Unplug className="w-4 h-4 mr-2" />
          DISCONNECT.WALLET
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-cyber-blue/70 font-mono text-sm mb-4">
        Connect your wallet to access Ethereum features
      </div>
      
      <div className="space-y-2">
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="w-full bg-cyber-blue hover:bg-cyber-blue/80 text-cyber-dark font-mono"
          >
            <Wallet className="w-4 h-4 mr-2" />
            CONNECT.{connector.name.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default WalletConnection
