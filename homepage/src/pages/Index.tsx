
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import DataPanels from '@/components/DataPanels';
import TokenomicsSection from '@/components/TokenomicsSection';
import RoadmapSection from '@/components/RoadmapSection';
import MapSection from '@/components/MapSection';
import Navigation from '@/components/Navigation';

const Index = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-blue overflow-hidden relative">
      {/* Enhanced background with atmospheric parallax effect */}
      <div className="cyber-grid fixed inset-0 opacity-20" />
      
      {/* Layered radial gradients for atmospheric effect */}
      <div className="fixed inset-0 bg-gradient-radial from-cyber-blue/5 via-transparent to-cyber-yellow/5" />
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-cyber-blue/3 to-transparent" 
           style={{ background: 'radial-gradient(circle at 75% 25%, rgba(0,191,255,0.08) 0%, transparent 50%)' }} />
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-cyber-yellow/3 to-transparent"
           style={{ background: 'radial-gradient(circle at 25% 75%, rgba(255,215,0,0.08) 0%, transparent 50%)' }} />
      
      {/* Hex grid SVG pattern overlay */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,5 45,15 45,35 30,45 15,35 15,15" fill="none" stroke="#00bfff" strokeWidth="0.5" opacity="0.3"/>
              <circle cx="30" cy="30" r="1" fill="#ffd700" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexPattern)" />
        </svg>
      </div>
      
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyber-blue rounded-full animate-ping opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Enhanced scanning line effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-blue to-transparent animate-scan-line opacity-50" />
        <div className="w-full h-px bg-gradient-to-r from-transparent via-cyber-yellow to-transparent animate-scan-line opacity-30" 
             style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Data Visualization Panels */}
      {/* <DataPanels /> */}

      {/* Tokenomics Section */}
      <TokenomicsSection />

      {/* Roadmap Section */}
      <RoadmapSection />

      {/* Map Section */}
      <MapSection />

      {/* Enhanced Footer */}
      <footer className="relative z-10 border-t border-cyber-blue/20 bg-cyber-dark/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-cyber-yellow font-cyber text-lg mb-4 tracking-widest">SYSTEM.STATUS</h3>
              <p className="text-sm text-cyber-blue/70 font-mono leading-relaxed">
                All systems operational. Metal processing network active.
                Manufacturing streams synchronized.
              </p>
              <div className="mt-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyber-yellow rounded-full animate-pulse" />
                <span className="text-xs text-cyber-yellow font-mono">UPTIME: 99.97%</span>
              </div>
            </div>
            <div>
              <h3 className="text-cyber-yellow font-cyber text-lg mb-4 tracking-widest">CONNECT.LINKS</h3>
              <div className="space-y-2">
                <a href="#" className="block text-sm text-cyber-blue/70 hover:text-cyber-blue transition-colors font-mono">
                  &gt; Metal Interface
                </a>
                <a href="#" className="block text-sm text-cyber-blue/70 hover:text-cyber-blue transition-colors font-mono">
                  &gt; Data Archive
                </a>
                <a href="#" className="block text-sm text-cyber-blue/70 hover:text-cyber-blue transition-colors font-mono">
                  &gt; System Logs
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-cyber-yellow font-cyber text-lg mb-4 tracking-widest">ACCESS.CODE</h3>
              <p className="text-xs text-cyber-blue/50 font-mono">
                0xFF00A1B2C3D4E5F6
              </p>
              <p className="text-xs text-cyber-blue/50 font-mono mt-2">
                NEXTMETAL.SECURE.VERIFIED
              </p>
              <div className="mt-4 text-xs text-cyber-blue/40 font-mono">
                NODE.COUNT: 2,847 | BLOCK.HEIGHT: 1,234,567
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-cyber-blue/20 text-center">
            <p className="text-xs text-cyber-blue/50 font-mono">
              © 2087 NEXTMETAL.SYSTEMS &gt; ALL.RIGHTS.RESERVED &gt; METAL.LINK.ACTIVE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
