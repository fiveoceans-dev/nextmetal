
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock authentication - just show success and redirect
    setTimeout(() => {
      toast({
        title: "Mock Authentication",
        description: isLogin ? "Mock login successful!" : "Mock registration successful!",
      });
      navigate('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="cyber-grid fixed inset-0 opacity-20" />
      <div className="fixed inset-0 bg-gradient-radial from-cyber-blue/5 via-transparent to-cyber-yellow/5" />

      <Card className="w-full max-w-md bg-cyber-dark/90 border-cyber-blue/30 backdrop-blur-sm">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-cyber text-cyber-yellow mb-2">
              {isLogin ? 'LOGIN.SYS' : 'REGISTER.SYS'}
            </h1>
            <p className="text-sm text-cyber-blue/70 font-mono">
              {isLogin ? 'ACCESS.GRANTED.REQUIRED' : 'NEW.USER.PROTOCOL'}
            </p>
            <p className="text-xs text-cyber-yellow/70 font-mono mt-2">
              [MOCK MODE - UI ONLY]
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-mono text-cyber-blue mb-2">
                  FULL.NAME
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-cyber-dark/50 border-cyber-blue/30 text-cyber-blue"
                  required={!isLogin}
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

export default Auth;
