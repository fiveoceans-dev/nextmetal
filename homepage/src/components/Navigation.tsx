
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import NextMetalAuthDropdown from './NextMetalAuthDropdown';
import { useNavigate } from 'react-router-dom';
import { useNextMetalAuth } from '@/contexts/NextMetalAuthContext';

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('home');
  const { user } = useNextMetalAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: 'HOME.SYS' },
    { id: 'data', label: 'DATA.CORE' },
    { id: 'neural', label: 'NEURAL.NET' },
    { id: 'terminal', label: 'TERMINAL' },
    { id: 'access', label: 'ACCESS.LOG' }
  ];

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <nav className="relative z-50 bg-cyber-dark/90 backdrop-blur-sm border-b border-cyber-blue/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border border-cyber-yellow cyber-border bg-cyber-yellow/10 flex items-center justify-center">
              <div className="w-4 h-4 bg-cyber-yellow animate-glow-pulse" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />
            </div>
            <span className="font-cyber text-xl text-cyber-yellow glitch-text" data-text="NEXTMETAL">
              NEXTMETAL
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={`
                  font-mono text-sm px-4 py-2 transition-all duration-300
                  ${activeSection === item.id 
                    ? 'text-cyber-yellow bg-cyber-yellow/10 cyber-border' 
                    : 'text-cyber-blue/70 hover:text-cyber-blue hover:bg-cyber-blue/10'
                  }
                `}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <Button
                onClick={handleDashboardClick}
                className="bg-cyber-blue/20 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/30 font-mono text-sm"
              >
                DASHBOARD
              </Button>
            )}
            <NextMetalAuthDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
