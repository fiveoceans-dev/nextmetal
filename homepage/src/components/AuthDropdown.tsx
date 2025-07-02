
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, User, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthDropdown = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = () => {
    navigate('/auth');
  };

  const handleWalletLogin = () => {
    // Placeholder for wallet login functionality
    console.log('Wallet login not implemented yet');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="text-cyber-blue hover:text-cyber-yellow">
            <User className="w-4 h-4 mr-2" />
            <span className="font-mono text-sm">USER.ACTIVE</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-cyber-dark border-cyber-blue/30 text-cyber-blue">
          <DropdownMenuItem onClick={handleDashboard} className="font-mono hover:bg-cyber-blue/10">
            <User className="w-4 h-4 mr-2" />
            DASHBOARD
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="font-mono hover:bg-cyber-blue/10">
            SIGN.OUT
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-cyber-blue hover:text-cyber-yellow">
          <span className="font-mono text-sm">LOGIN.SYS</span>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-cyber-dark border-cyber-blue/30 text-cyber-blue">
        <DropdownMenuItem onClick={handleEmailLogin} className="font-mono hover:bg-cyber-blue/10">
          <User className="w-4 h-4 mr-2" />
          EMAIL.AUTH
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWalletLogin} className="font-mono hover:bg-cyber-blue/10">
          <Wallet className="w-4 h-4 mr-2" />
          WALLET.CONNECT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthDropdown;
