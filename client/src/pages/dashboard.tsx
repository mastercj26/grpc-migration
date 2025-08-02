import { useQuery } from "@tanstack/react-query";
import { ServerTopology } from "@/components/ServerTopology";
import { ProcessList } from "@/components/ProcessList";
import { MigrationControl } from "@/components/MigrationControl";
import { SystemLogs } from "@/components/SystemLogs";
import { Server, Activity, ArrowRightLeft, CheckCircle, BarChart3, Settings, Layers } from "lucide-react";

export default function Dashboard() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["/api/overview"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: servers } = useQuery({
    queryKey: ["/api/servers"],
    refetchInterval: 5000,
  });

  const onlineServers = servers?.filter((s: any) => s.status === "online")?.length || 0;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface shadow-lg border-r border-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Server className="text-primary-foreground text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-foreground">Process Manager</h1>
              <p className="text-sm text-muted-foreground">gRPC Migration System</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          <a 
            href="#" 
            className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-primary rounded-lg font-medium"
            data-testid="nav-dashboard"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg"
            data-testid="nav-topology"
          >
            <Layers className="w-4 h-4" />
            <span>Server Topology</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg"
            data-testid="nav-processes"
          >
            <Activity className="w-4 h-4" />
            <span>Process List</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg"
            data-testid="nav-migrations"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Migrations</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg"
            data-testid="nav-monitoring"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Monitoring</span>
          </a>
          <a 
            href="#" 
            className="flex items-center space-x-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg"
            data-testid="nav-settings"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </a>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">System Status</span>
            </div>
            <p className="text-xs text-muted-foreground">All services operational</p>
            <p className="text-xs text-muted-foreground font-mono">Uptime: 99.9%</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-surface shadow-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-medium text-foreground">Process Migration Dashboard</h2>
              <p className="text-sm text-muted-foreground">Monitor and manage distributed process migrations across server nodes</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Connected</span>
              </div>
              <button 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                data-testid="button-refresh-all"
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh All
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Processes</p>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-total-processes">
                    {overviewLoading ? "..." : overview?.totalProcesses || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="text-primary text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600">↑ +2</span>
                <span className="text-muted-foreground ml-1">from last hour</span>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Migrations</p>
                  <p className="text-3xl font-bold text-orange-600" data-testid="text-active-migrations">
                    {overviewLoading ? "..." : overview?.activeMigrations || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ArrowRightLeft className="text-orange-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground">Average time: 2.3s</span>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Server Nodes</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-server-nodes">
                    {onlineServers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Server className="text-green-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600">All online</span>
              </div>
            </div>

            <div className="bg-surface rounded-xl shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-success-rate">
                    {overviewLoading ? "..." : overview?.successRate || "100.0%"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600 text-xl" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-muted-foreground">Last 24 hours</span>
              </div>
            </div>
          </div>

          {/* Server Topology */}
          <ServerTopology />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Process List */}
            <ProcessList />

            {/* Migration Control */}
            <MigrationControl />
          </div>

          {/* System Logs */}
          <SystemLogs />
        </div>
      </main>
    </div>
  );
}
