
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Database as DatabaseIcon, 
  Network,
  Globe,
  Zap,
  Trophy,
  Gift,
  Target
} from 'lucide-react';
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Statistics = () => {
  // Mock data similar to the dashboard image
  const statsData = {
    totalNodes: 297,
    activeNodes: 264,
    networkVolume: 9.6,
    dailyTransactions: 20.6,
    nps: 61,
    monthlyGrowth: 16,
    weeklyUsers: 1.6,
    totalPoints: 15420,
    referralCount: 23,
    questsCompleted: 4
  };

  const topPerformers = [
    { name: 'Node-Alpha', value: '$8,600', points: 2540 },
    { name: 'Node-Beta', value: '$8,500', points: 2340 },
    { name: 'Node-Gamma', value: '$7,540', points: 2100 },
    { name: 'Node-Delta', value: '$7,450', points: 1980 },
    { name: 'Node-Epsilon', value: '$6,530', points: 1750 },
  ];

  const recentActivity = [
    { type: 'Points Earned', status: '+150 PTS', time: '14 minutes ago', icon: Trophy },
    { type: 'Referral Bonus', status: '+100 PTS', time: '2 hours ago', icon: Gift },
    { type: 'Quest Completed', status: 'Quest #4', time: '2 hours ago', icon: Target },
    { type: 'Network Sync', status: 'OK', time: '4 hours ago', icon: Network },
  ];

  const pointsBreakdown = {
    referral: { count: 800, label: 'Referrals' },
    quest: { count: 600, label: 'Quests' },
    mining: { count: 12200, label: 'Mining' },
    bonus: { count: 1820, label: 'Bonuses' }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cyber-black">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-cyber-blue/30 px-4 bg-cyber-dark/50">
            <SidebarTrigger className="text-cyber-blue hover:text-cyber-yellow" />
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-xl font-cyber text-cyber-yellow">STATISTICS.OVERVIEW</h1>
              <p className="text-xs text-cyber-yellow/70 font-mono">[NETWORK ANALYTICS]</p>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6 bg-cyber-black text-cyber-blue">
            {/* Background effects */}
            <div className="fixed inset-0 opacity-20" style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />
            <div className="fixed inset-0 bg-gradient-radial from-cyber-blue/5 via-transparent to-cyber-yellow/5" />

            <div className="relative z-10 space-y-6">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Points */}
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Trophy className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">TOTAL POINTS</p>
                      <p className="text-2xl font-cyber text-cyber-blue">{statsData.totalPoints.toLocaleString()}</p>
                    </div>
                  </div>
                </Card>

                {/* Network Volume */}
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Network className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">NETWORK VOLUME</p>
                      <p className="text-2xl font-cyber text-cyber-blue">${statsData.networkVolume}k</p>
                    </div>
                  </div>
                </Card>

                {/* Active Users */}
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Users className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">ACTIVE USERS</p>
                      <p className="text-2xl font-cyber text-cyber-blue">27.2k</p>
                    </div>
                  </div>
                </Card>

                {/* Referrals */}
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Gift className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">REFERRALS</p>
                      <p className="text-2xl font-cyber text-cyber-blue">{statsData.referralCount}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Points Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(pointsBreakdown).map(([key, data]) => (
                  <Card key={key} className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-mono text-cyber-blue/70">{data.label.toUpperCase()}</h3>
                      <div className="text-2xl font-cyber text-cyber-blue">{data.count.toLocaleString()}</div>
                      <div className="text-sm text-cyber-blue/70 font-mono">points earned</div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Daily Transactions */}
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Zap className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">DAILY TRANSACTIONS</p>
                      <p className="text-3xl font-cyber text-cyber-blue">${statsData.dailyTransactions}k</p>
                      <div className="flex items-center text-green-400 text-sm font-mono mt-2">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +{statsData.weeklyUsers}% vs last week
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Quest Progress */}
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Target className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">QUESTS COMPLETED</p>
                      <p className="text-3xl font-cyber text-cyber-blue">{statsData.questsCompleted}/5</p>
                      <div className="w-full bg-cyber-dark rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-cyber-blue to-cyber-yellow h-2 rounded-full" 
                          style={{ width: `${(statsData.questsCompleted / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Network Performance Score */}
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Activity className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">NPS (PAST 30 DAYS)</p>
                      <p className="text-3xl font-cyber text-cyber-blue">{statsData.nps}</p>
                      <div className="w-full bg-cyber-dark rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full" 
                          style={{ width: `${statsData.nps}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Performing Nodes */}
                <Card className="lg:col-span-1 bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <h2 className="text-xl font-cyber text-cyber-yellow mb-4">
                    TOP NODES THIS MONTH
                  </h2>
                  <div className="space-y-4">
                    {topPerformers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-cyber-blue/20">
                        <div>
                          <p className="font-mono text-cyber-blue">{performer.name}</p>
                          <p className="text-xs text-cyber-blue/70">{performer.points} pts</p>
                        </div>
                        <div className="text-cyber-yellow font-mono">{performer.value}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="lg:col-span-2 bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <h2 className="text-xl font-cyber text-cyber-yellow mb-4">
                    RECENT ACTIVITY
                  </h2>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-cyber-blue/20">
                        <div className="flex items-center space-x-3">
                          <activity.icon className="w-5 h-5 text-cyber-yellow" />
                          <div>
                            <p className="font-mono text-cyber-blue">{activity.type}</p>
                            <p className="text-sm text-cyber-blue/70">{activity.time}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-cyber-yellow bg-cyber-yellow/10 px-2 py-1 rounded">
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Statistics;
