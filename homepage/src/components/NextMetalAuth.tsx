
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useNextMetalAuth } from '@/contexts/NextMetalAuthContext';

const NextMetalAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useNextMetalAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        result = await register(email, password, nickname, referralCode);
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: isLogin ? "Logged in successfully!" : "Account created successfully!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }} />
      <div className="fixed inset-0 bg-gradient-radial from-cyber-blue/5 via-transparent to-cyber-yellow/5" />

      <Card className="w-full max-w-md bg-cyber-dark/90 border-cyber-blue/30 backdrop-blur-sm">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-cyber text-cyber-yellow mb-2">
              {isLogin ? 'LOGIN.SYS' : 'REGISTER.SYS'}
            </h1>
            <p className="text-sm text-cyber-blue/70 font-mono">
              {isLogin ? 'ACCESS.NEXTMETAL.NETWORK' : 'JOIN.NEXTMETAL.NETWORK'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-mono text-cyber-blue mb-2">
                  NICKNAME
                </label>
                <Input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                  placeholder="Your nickname (optional)"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-mono text-cyber-blue mb-2">
                EMAIL.ADDRESS
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-cyber-blue mb-2">
                PASSWORD.KEY
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-mono text-cyber-blue mb-2">
                  REFERRAL.CODE
                </label>
                <Input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                  placeholder="Enter referral code (optional)"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-cyber-blue hover:bg-cyber-blue/80 text-cyber-dark font-mono"
            >
              {loading ? 'PROCESSING...' : (isLogin ? 'LOGIN.EXECUTE' : 'REGISTER.EXECUTE')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-cyber-blue/70 hover:text-cyber-blue font-mono"
            >
              {isLogin ? 'NEW.USER? REGISTER.HERE' : 'EXISTING.USER? LOGIN.HERE'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NextMetalAuth;
