
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Server, Zap } from 'lucide-react';
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import SearchAndAdd from '@/components/SearchAndAdd';

const Hosting = () => {
  const [searchResults, setSearchResults] = useState<string[]>([]);
  
  const handleSearch = (query: string) => {
    // Mock search results
    setSearchResults([
      `Site: nextmetal.io (matches: ${query})`,
      `Site: api.nextmetal.io (matches: ${query})`,
      `Site: docs.nextmetal.io (matches: ${query})`
    ]);
  };

  const handleAddNew = () => {
    // Mock add new site logic
    console.log('Add new site/deployment');
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
              <h1 className="text-xl font-cyber text-cyber-yellow">HOSTING.CORE</h1>
              <p className="text-xs text-cyber-yellow/70 font-mono">[MOCK MODE - UI ONLY]</p>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 p-6 bg-cyber-black text-cyber-blue">
            {/* Background effects */}
            <div className="cyber-grid fixed inset-0 opacity-20" />
            <div className="fixed inset-0 bg-gradient-radial from-cyber-blue/5 via-transparent to-cyber-yellow/5" />

            <div className="relative z-10 space-y-6">
              {/* Search and Add */}
              <SearchAndAdd
                searchPlaceholder="Search sites, domains, deployments..."
                addButtonText="NEW.SITE"
                onSearch={handleSearch}
                onAdd={handleAddNew}
              />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-4">
                  <h3 className="text-cyber-yellow font-cyber mb-3">SEARCH.RESULTS</h3>
                  <div className="space-y-2">
                    {searchResults.map((result, index) => (
                      <div key={index} className="flex items-center gap-2 text-cyber-blue font-mono text-sm">
                        <Globe className="w-4 h-4" />
                        {result}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Hosting Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Globe className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">SITES</p>
                      <p className="text-2xl font-cyber text-cyber-blue">3</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Server className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">DEPLOYMENTS</p>
                      <p className="text-2xl font-cyber text-cyber-blue">47</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Zap className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">BANDWIDTH</p>
                      <p className="text-2xl font-cyber text-cyber-blue">12.3GB</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sites List */}
              <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                <h2 className="text-xl font-cyber text-cyber-yellow mb-4">HOSTED.SITES</h2>
                <div className="space-y-3">
                  {[
                    { name: 'nextmetal.io', status: 'LIVE', deployments: 12 },
                    { name: 'api.nextmetal.io', status: 'LIVE', deployments: 8 },
                    { name: 'docs.nextmetal.io', status: 'BUILDING', deployments: 5 }
                  ].map((site) => (
                    <div key={site.name} className="flex items-center justify-between py-3 border-b border-cyber-blue/20">
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-cyber-blue" />
                        <div>
                          <div className="font-mono text-cyber-blue">{site.name}</div>
                          <div className="text-xs text-cyber-blue/70">{site.deployments} deployments</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          site.status === 'LIVE' ? 'text-cyber-yellow bg-cyber-yellow/10' : 'text-cyber-blue bg-cyber-blue/10'
                        }`}>
                          {site.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
                        >
                          VISIT
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
                        >
                          SETTINGS
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Hosting;
