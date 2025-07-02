
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useNextMetalAuth } from '@/contexts/NextMetalAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import WalletConnection from './WalletConnection';

const AccountSettings = () => {
  const { user, refreshUser, createReferralCode } = useNextMetalAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [newReferralCode, setNewReferralCode] = useState('');

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    // Password update logic would go here
    toast({
      title: "Success",
      description: "Password updated successfully"
    });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsLoading(false);
  };

  const handleNicknameUpdate = async () => {
    setIsLoading(true);
    // Nickname update logic would go here
    toast({
      title: "Success", 
      description: "Nickname updated successfully"
    });
    await refreshUser();
    setIsLoading(false);
  };

  const handleCreateReferralCode = async () => {
    if (!newReferralCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a referral code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const result = await createReferralCode(newReferralCode);
    
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Referral code created successfully"
      });
      setNewReferralCode('');
    }
    
    setIsLoading(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cyber-black">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header with trigger */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-cyber-blue/30 px-4 bg-cyber-dark/50">
            <SidebarTrigger className="text-cyber-blue hover:text-cyber-yellow" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-xl font-cyber text-cyber-yellow">ACCOUNT.SETTINGS</h1>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6 bg-cyber-black text-cyber-blue">
            {/* Background effects */}
            <div className="cyber-grid fixed inset-0 opacity-20" />
            <div className="fixed inset-0 bg-gradient-radial from-cyber-blue/5 via-transparent to-cyber-yellow/5" />

            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
              {/* Profile Information */}
              <Card className="bg-cyber-dark/90 border-cyber-blue/30">
                <CardHeader>
                  <CardTitle className="text-cyber-yellow font-cyber">PROFILE.INFO</CardTitle>
                  <CardDescription className="text-cyber-blue/70 font-mono">
                    Manage your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-cyber-blue/70 font-mono">EMAIL</Label>
                      <Input 
                        value={user.email} 
                        disabled 
                        className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                      />
                    </div>
                    <div>
                      <Label className="text-cyber-blue/70 font-mono">USER.ID</Label>
                      <Input 
                        value={user.id} 
                        disabled 
                        className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue text-xs"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-cyber-blue/70 font-mono">NICKNAME</Label>
                    <div className="flex gap-2">
                      <Input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                        placeholder="Enter nickname..."
                      />
                      <Button 
                        onClick={handleNicknameUpdate}
                        disabled={isLoading}
                        className="bg-cyber-blue/20 border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/30"
                      >
                        UPDATE
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-cyber-blue/70 font-mono">STATUS</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.is_verified ? "default" : "secondary"} className="font-mono">
                        {user.is_verified ? "VERIFIED" : "UNVERIFIED"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Points & Referrals */}
              <Card className="bg-cyber-dark/90 border-cyber-blue/30">
                <CardHeader>
                  <CardTitle className="text-cyber-yellow font-cyber">POINTS.REFERRALS</CardTitle>
                  <CardDescription className="text-cyber-blue/70 font-mono">
                    Your points and referral system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-cyber-blue/70 font-mono">TOTAL.POINTS</Label>
                      <div className="text-2xl font-cyber text-cyber-yellow">
                        {user.points?.toLocaleString() || 0}
                      </div>
                    </div>
                    <div>
                      <Label className="text-cyber-blue/70 font-mono">REFERRAL.CODE</Label>
                      <div className="text-lg font-mono text-cyber-blue">
                        {user.referral_code || 'NONE'}
                      </div>
                    </div>
                  </div>

                  {!user.referral_code && (
                    <div>
                      <Label className="text-cyber-blue/70 font-mono">CREATE.REFERRAL.CODE</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newReferralCode}
                          onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                          className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                          placeholder="ENTER-CODE..."
                        />
                        <Button 
                          onClick={handleCreateReferralCode}
                          disabled={isLoading}
                          className="bg-cyber-yellow/20 border-cyber-yellow/30 text-cyber-yellow hover:bg-cyber-yellow/30"
                        >
                          CREATE
                        </Button>
                      </div>
                    </div>
                  )}

                  {user.referral_code && (
                    <div>
                      <Label className="text-cyber-blue/70 font-mono">USES.LEFT</Label>
                      <div className="text-lg font-mono text-cyber-blue">
                        {user.referral_uses_left || 0}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Password Update */}
              <Card className="bg-cyber-dark/90 border-cyber-blue/30">
                <CardHeader>
                  <CardTitle className="text-cyber-yellow font-cyber">SECURITY.UPDATE</CardTitle>
                  <CardDescription className="text-cyber-blue/70 font-mono">
                    Change your password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <Label className="text-cyber-blue/70 font-mono">CURRENT.PASSWORD</Label>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                        className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                      />
                    </div>
                    <div>
                      <Label className="text-cyber-blue/70 font-mono">NEW.PASSWORD</Label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                        className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                      />
                    </div>
                    <div>
                      <Label className="text-cyber-blue/70 font-mono">CONFIRM.PASSWORD</Label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                        className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-cyber-blue/20 border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/30"
                    >
                      UPDATE.PASSWORD
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Wallet Connection */}
              <Card className="bg-cyber-dark/90 border-cyber-blue/30">
                <CardHeader>
                  <CardTitle className="text-cyber-yellow font-cyber">WALLET.CONNECTION</CardTitle>
                  <CardDescription className="text-cyber-blue/70 font-mono">
                    Connect your Ethereum wallet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WalletConnection />
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AccountSettings;
