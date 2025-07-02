
import { Card } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [
    {
      title: 'ULTRA.LATENCY',
      description: 'Sub-millisecond processing with quantum-grade efficiency protocols',
      icon: 'latency',
      stats: '<1ms'
    },
    {
      title: 'CONTAINER.FORGE',
      description: 'Automated metal forming with precision-controlled manufacturing streams',
      icon: 'container',
      stats: '99.9%'
    },
    {
      title: 'CHAIN.SECURE',
      description: 'Distributed ledger technology securing all metal processing transactions',
      icon: 'chain',
      stats: '256-bit'
    },
    {
      title: 'NODE.NETWORK',
      description: 'Global mesh of processing nodes with real-time synchronization',
      icon: 'network',
      stats: '2.4K TPS'
    }
  ];

  const LatencyIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" className="text-cyber-blue">
      <circle cx="24" cy="24" r="4" fill="currentColor" />
      <circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" className="animate-ping" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" className="animate-ping" style={{animationDelay: '0.5s'}} />
      <circle cx="24" cy="24" r="24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" className="animate-ping" style={{animationDelay: '1s'}} />
    </svg>
  );

  const ContainerIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" className="text-cyber-blue">
      <rect x="8" y="16" width="32" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="12" y="20" width="8" height="4" fill="currentColor" opacity="0.6" />
      <rect x="28" y="20" width="8" height="4" fill="currentColor" opacity="0.6" />
      <rect x="20" y="28" width="8" height="4" fill="currentColor" opacity="0.8" />
      <line x1="8" y1="12" x2="40" y2="12" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" className="animate-pulse" />
      <circle cx="36" cy="12" r="2" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.5s'}} />
    </svg>
  );

  const ChainIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" className="text-cyber-blue">
      <rect x="6" y="18" width="12" height="8" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="10" width="12" height="8" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="26" width="12" height="8" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="30" y="18" width="12" height="8" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="22" r="1" fill="currentColor" className="animate-pulse" />
      <circle cx="30" cy="22" r="1" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.3s'}} />
    </svg>
  );

  const NetworkIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" className="text-cyber-blue">
      <circle cx="24" cy="24" r="3" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="36" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="36" r="2" fill="currentColor" />
      <circle cx="36" cy="36" r="2" fill="currentColor" />
      <line x1="24" y1="24" x2="12" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="24" y1="24" x2="36" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="24" y1="24" x2="12" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="24" y1="24" x2="36" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="24" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" className="animate-ping" />
    </svg>
  );

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'latency': return <LatencyIcon />;
      case 'container': return <ContainerIcon />;
      case 'chain': return <ChainIcon />;
      case 'network': return <NetworkIcon />;
      default: return <LatencyIcon />;
    }
  };

  return (
    <section className="py-20 px-4 relative z-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-cyber text-cyber-yellow text-center mb-12 glitch-text tracking-widest" data-text="METAL.SYSTEMS">
          METAL.SYSTEMS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={feature.title} className="cyber-panel cyber-border p-6 relative overflow-hidden group hover:ring ring-cyan-400/20 transition-all duration-300">
              {/* Corner clips */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyber-yellow"
                   style={{clipPath: 'polygon(0 0, 70% 0, 100% 30%, 100% 100%, 0 100%)'}} />
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyber-yellow"
                   style={{clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0 100%, 0 30%)'}} />
              
              {/* Tab with stats */}
              <div className="absolute -top-3 left-6 bg-cyber-dark border border-cyber-yellow px-3 py-1"
                   style={{clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)'}}>
                <span className="text-xs font-mono text-cyber-yellow">{feature.stats}</span>
              </div>

              <div className="space-y-4">
                {/* Icon */}
                <div className="flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {getIcon(feature.icon)}
                </div>

                {/* Title */}
                <h3 className="text-cyber-yellow font-cyber text-lg text-center tracking-widest">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-cyber-blue/80 text-sm text-center font-mono leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Accent overlays */}
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-cyber-yellow opacity-30"
                   style={{clipPath: 'polygon(0 0, 100% 50%, 50% 100%)'}} />
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 to-cyber-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
