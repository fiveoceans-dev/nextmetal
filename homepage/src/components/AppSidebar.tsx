
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Database,
  Server,
  Container,
  Globe
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Statistics', url: '/dashboard/statistics', icon: BarChart3 },
  { title: 'Database', url: '/dashboard/database', icon: Database },
  { title: 'Functions', url: '/dashboard/functions', icon: Server },
  { title: 'Containers', url: '/dashboard/containers', icon: Container },
  { title: 'Hosting', url: '/dashboard/hosting', icon: Globe },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="bg-cyber-dark border-r border-cyber-blue/30">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border border-cyber-yellow cyber-border bg-cyber-yellow/10 flex items-center justify-center">
            <div className="w-4 h-4 bg-cyber-yellow animate-glow-pulse" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />
          </div>
          {!isCollapsed && (
            <span className="font-cyber text-lg text-cyber-yellow">
              NEXTMETAL
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-cyber-blue/70 font-mono text-xs">
            {!isCollapsed ? 'MAIN.NAVIGATION' : ''}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link 
                      to={item.url}
                      className={`
                        flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 font-mono text-sm
                        ${isActive(item.url) 
                          ? 'bg-cyber-blue/20 text-cyber-yellow border-l-2 border-cyber-yellow' 
                          : 'text-cyber-blue/70 hover:text-cyber-blue hover:bg-cyber-blue/10'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.title.toUpperCase()}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-2 text-cyber-blue/50 font-mono text-xs">
          <Globe className="w-4 h-4" />
          {!isCollapsed && <span>NETWORK.STATUS: ONLINE</span>}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
