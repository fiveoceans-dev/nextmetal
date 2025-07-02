
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Database, Server, Users, Activity } from 'lucide-react';
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock profile data
  const mockProfile = {
    id: 'mock-user-id',
    email: 'user@example.com',
    full_name: 'Mock User',
    created_at: new Date().toISOString()
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cyber-black">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header with trigger */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-cyber-blue/30 px-4 bg-cyber-dark/50">
            <SidebarTrigger className="text-cyber-blue hover:text-cyber-yellow" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-xl font-cyber text-cyber-yellow">DASHBOARD.OVERVIEW</h1>
              <p className="text-xs text-cyber-yellow/70 font-mono">[MOCK MODE - UI ONLY]</p>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6 bg-cyber-black text-cyber-blue">
            {/* Background effects */}
            <div className="cyber-grid fixed inset-0 opacity-20" />
            <div className="fixed inset-0 bg-gradient-radial from-cyber-blue/5 via-transparent to-cyber-yellow/5" />

            <div className="relative z-10">
              {/* Welcome Section */}
              <div className="mb-8">
                <p className="text-cyber-blue/70 font-mono">
                  Welcome back, {mockProfile.full_name || user?.email}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Database className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">PROJECTS</p>
                      <p className="text-2xl font-cyber text-cyber-blue">0</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Server className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">FUNCTIONS</p>
                      <p className="text-2xl font-cyber text-cyber-blue">0</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Users className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">USERS</p>
                      <p className="text-2xl font-cyber text-cyber-blue">1</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Activity className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">STATUS</p>
                      <p className="text-sm font-cyber text-cyber-yellow">ONLINE</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="lg:col-span-2 bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <h2 className="text-xl font-cyber text-cyber-yellow mb-4">
                    RECENT.ACTIVITY
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-cyber-blue/20">
                      <div>
                        <p className="font-mono text-cyber-blue">User account created</p>
                        <p className="text-sm text-cyber-blue/70">
                          {new Date(mockProfile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-cyber-yellow bg-cyber-yellow/10 px-2 py-1 rounded">
                        SYSTEM
                      </span>
                    </div>
                    <div className="text-center text-cyber-blue/50 font-mono py-8">
                      NO.ADDITIONAL.ACTIVITY
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <h2 className="text-xl font-cyber text-cyber-yellow mb-4">
                    QUICK.ACTIONS
                  </h2>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      NEW.PROJECT
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
                    >
                      <Server className="w-4 h-4 mr-2" />
                      DEPLOY.FUNCTION
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      MANAGE.USERS
                    </Button>
                  </div>
                </Card>
              </div>

              {/* User Profile Section */}
              <Card className="mt-6 bg-cyber-dark/90 border-cyber-blue/30 p-6">
                <h2 className="text-xl font-cyber text-cyber-yellow mb-4">
                  USER.PROFILE
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-mono text-cyber-blue/70 mb-1">EMAIL</p>
                    <p className="font-mono text-cyber-blue">{mockProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-mono text-cyber-blue/70 mb-1">FULL.NAME</p>
                    <p className="font-mono text-cyber-blue">{mockProfile.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-mono text-cyber-blue/70 mb-1">USER.ID</p>
                    <p className="font-mono text-cyber-blue text-xs">{mockProfile.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-mono text-cyber-blue/70 mb-1">CREATED</p>
                    <p className="font-mono text-cyber-blue">
                      {new Date(mockProfile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
