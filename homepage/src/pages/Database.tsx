
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database as DatabaseIcon, Table, Plus } from 'lucide-react';
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import SearchAndAdd from '@/components/SearchAndAdd';

const Database = () => {
  const [searchResults, setSearchResults] = useState<string[]>([]);
  
  const handleSearch = (query: string) => {
    // Mock search results
    setSearchResults([
      `Table: users (matches: ${query})`,
      `Table: projects (matches: ${query})`,
      `View: user_stats (matches: ${query})`
    ]);
  };

  const handleAddNew = () => {
    // Mock add new database logic
    console.log('Add new database/table');
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
              <h1 className="text-xl font-cyber text-cyber-yellow">DATABASE.CORE</h1>
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
                searchPlaceholder="Search databases, tables, views..."
                addButtonText="NEW.TABLE"
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
                        <Table className="w-4 h-4" />
                        {result}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Database Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <DatabaseIcon className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">TABLES</p>
                      <p className="text-2xl font-cyber text-cyber-blue">12</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Table className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">RECORDS</p>
                      <p className="text-2xl font-cyber text-cyber-blue">1,337</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                  <div className="flex items-center space-x-4">
                    <Plus className="w-8 h-8 text-cyber-yellow" />
                    <div>
                      <p className="text-sm font-mono text-cyber-blue/70">SIZE</p>
                      <p className="text-2xl font-cyber text-cyber-blue">2.4GB</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Database Tables */}
              <Card className="bg-cyber-dark/90 border-cyber-blue/30 p-6">
                <h2 className="text-xl font-cyber text-cyber-yellow mb-4">DATABASE.TABLES</h2>
                <div className="space-y-3">
                  {['users', 'projects', 'functions', 'containers', 'deployments'].map((table) => (
                    <div key={table} className="flex items-center justify-between py-3 border-b border-cyber-blue/20">
                      <div className="flex items-center space-x-3">
                        <Table className="w-5 h-5 text-cyber-blue" />
                        <span className="font-mono text-cyber-blue">{table}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10"
                      >
                        VIEW
                      </Button>
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

export default Database;
