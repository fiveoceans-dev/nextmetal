
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { TokenomicsData } from '@/types';
import { 
  Layers, 
  Hammer, 
  Megaphone, 
  Users, 
  Handshake, 
  Send,
  Star,
  ArrowRightLeft,
  TrendingUp,
  Globe,
  Settings,
  Shield
} from 'lucide-react';

interface TokenomicsSectionProps {
  className?: string;
}

const TokenomicsSection: React.FC<TokenomicsSectionProps> = ({ className }) => {
  const [animationPhase, setAnimationPhase] = useState<number>(0);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const tokenData: TokenomicsData[] = [
    { label: 'LIQUIDITY.POOL', value: '400,000,000', percent: 40, color: '#00bfff', icon: Layers },
    { label: 'DEVELOPMENT', value: '200,000,000', percent: 20, color: '#00bfff', icon: Hammer },
    { label: 'MARKETING', value: '150,000,000', percent: 15, color: '#00bfff', icon: Megaphone },
    { label: 'TEAM.RESERVE', value: '100,000,000', percent: 10, color: '#00bfff', icon: Users },
    { label: 'PARTNERSHIPS', value: '100,000,000', percent: 10, color: '#00bfff', icon: Handshake },
    { label: 'AIRDROPS', value: '50,000,000', percent: 5, color: '#00bfff', icon: Send }
  ];

  const getBlockSize = (percent: number): { height: string; width: string } => {
    // Calculate relative size - largest gets full width, others are proportional
    const maxPercent = Math.max(...tokenData.map(item => item.percent));
    const heightRatio = percent / maxPercent;
    return {
      height: `${Math.max(heightRatio * 300, 80)}px`,
      width: percent >= 20 ? '100%' : percent >= 10 ? '48%' : '32%'
    };
  };

  const handleSegmentClick = (index: number): void => {
    setSelectedSegment(selectedSegment === index ? null : index);
  };

  const handleSegmentHover = (index: number | null): void => {
    setHoveredSegment(index);
  };

  return (
    <section className={`py-20 px-4 relative z-10 ${className || ''}`}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-cyber text-cyber-blue text-center mb-12 glitch-text tracking-widest" data-text="METAL.TOKENOMICS">
          METAL.TOKENOMICS
        </h2>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-4 cyber-panel p-4">
            <div className="w-12 h-12 rounded-full bg-cyber-yellow/20 border-2 border-cyber-blue flex items-center justify-center">
              <Layers size={24} color="#00bfff" />
            </div>
            <div>
              <div className="text-2xl font-cyber text-cyber-blue">METAL TOKEN</div>
              <div className="text-sm font-mono text-cyber-blue/70">Total Supply</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-cyber text-cyber-blue">5B</div>
              <div className="text-xs font-mono text-cyber-blue/50">NEXTMETAL</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 auto-rows-max" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {tokenData.map((item, index) => {
            const blockSize = getBlockSize(item.percent);
            const isHighlighted = hoveredSegment === index || selectedSegment === index;
            const IconComponent = item.icon;
            
            return (
              <Card 
                key={`${item.label}-${index}`}
                className={`cyber-panel cyber-border relative transition-all duration-300 cursor-pointer overflow-hidden ${
                  selectedSegment === index ? 'ring-2 ring-cyber-blue' : 'hover:ring ring-cyan-400/20'
                }`}
                style={{
                  ...blockSize,
                  gridColumn: item.percent >= 20 ? 'span 2' : 'span 1',
                  background: `linear-gradient(135deg, ${item.color}10 0%, ${item.color}05 100%)`,
                  borderColor: item.color + '40'
                }}
                onClick={() => handleSegmentClick(index)}
                onMouseEnter={() => handleSegmentHover(index)}
                onMouseLeave={() => handleSegmentHover(null)}
              >
                {/* Animated background pattern */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: `radial-gradient(circle at ${50 + 20 * Math.sin((animationPhase + index * 60) * Math.PI / 180)}% ${50 + 20 * Math.cos((animationPhase + index * 60) * Math.PI / 180)}%, ${item.color}40 0%, transparent 70%)`
                  }}
                />

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2" style={{ borderColor: item.color }} />
                <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2" style={{ borderColor: item.color }} />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2" style={{ borderColor: item.color }} />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2" style={{ borderColor: item.color }} />

                {/* Content */}
                <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded" 
                         style={{backgroundColor: item.color + '30', border: `2px solid ${item.color}`}}>
                      <IconComponent size={20} color={item.color} />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-cyber" style={{ color: item.color }}>
                        {item.percent}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-cyber text-cyber-blue tracking-widest">
                      {item.label}
                    </h3>
                    <div className="text-sm font-mono text-cyber-blue/70">
                      {item.value} NMTL
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="mt-4 h-1 bg-cyber-dark border border-cyber-blue/30 overflow-hidden relative">
                    <div 
                      className="h-full transition-all duration-1000 relative overflow-hidden"
                      style={{ 
                        width: `${isHighlighted ? 100 : item.percent * 2}%`,
                        backgroundColor: item.color,
                        boxShadow: `0 0 10px ${item.color}60`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                  </div>

                  {/* Side accent */}
                  <div className="absolute top-1/2 left-0 w-1 h-16 opacity-70 transform -translate-y-1/2" 
                       style={{backgroundColor: item.color}} />
                  <div className="absolute top-1/2 right-0 w-1 h-16 opacity-70 transform -translate-y-1/2" 
                       style={{backgroundColor: item.color}} />
                </div>

                {/* Glow effect when highlighted */}
                {isHighlighted && (
                  <div 
                    className="absolute inset-0 border-2 animate-pulse"
                    style={{ borderColor: item.color, boxShadow: `0 0 20px ${item.color}40` }}
                  />
                )}
              </Card>
            );
          })}
        </div>

        {/* Token utility section */}
        <div className="mt-12 cyber-panel p-6">
          <h3 className="text-cyber-blue font-cyber text-lg mb-6 tracking-widest text-center">
            TOKEN.UTILITY
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm font-mono text-cyber-blue/70">
            <div className="flex items-center space-x-2">
              <Star size={16} color="#00bfff" />
              <span>Metal Processing Rights</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRightLeft size={16} color="#00bfff" />
              <span>Network Governance</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} color="#00bfff" />
              <span>Staking Rewards</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe size={16} color="#00bfff" />
              <span>Access Protocol</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings size={16} color="#00bfff" />
              <span>Manufacturing Credits</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={16} color="#00bfff" />
              <span>Security Validation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsSection;
