import { useQuery } from "@tanstack/react-query";
import type { Server } from "@shared/schema";

export function ServerTopology() {
  const { data: servers, isLoading } = useQuery({
    queryKey: ["/api/servers"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Server Topology</h3>
          <p className="text-sm text-muted-foreground">Current distribution of processes across server nodes</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-muted rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-border rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-border rounded"></div>
                  <div className="h-3 bg-border rounded"></div>
                  <div className="h-3 bg-border rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getServerStatusColor = (server: Server) => {
    if (server.status === "online") {
      if (server.role === "primary") return "border-green-500 bg-green-50";
      return "border-border bg-muted";
    }
    if (server.status === "migrating") return "border-orange-500 bg-orange-50";
    return "border-red-500 bg-red-50";
  };

  const getStatusBadgeColor = (server: Server) => {
    if (server.role === "primary") return "bg-green-500 text-white";
    if (server.status === "migrating") return "bg-orange-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getStatusDotColor = (server: Server) => {
    if (server.status === "online") return "bg-green-500";
    if (server.status === "migrating") return "bg-orange-500 animate-pulse";
    return "bg-red-500";
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Server Topology</h3>
        <p className="text-sm text-muted-foreground">Current distribution of processes across server nodes</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {servers?.map((server: Server) => (
            <div 
              key={server.id} 
              className={`rounded-lg p-4 border-2 ${getServerStatusColor(server)}`}
              data-testid={`server-card-${server.id}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusDotColor(server)}`}></div>
                  <span className="font-medium text-sm" data-testid={`server-name-${server.id}`}>
                    {server.name}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(server)}`}>
                  {server.role === "primary" ? "Primary" : server.status === "migrating" ? "Migrating" : "Secondary"}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Processes:</span>
                  <span className="font-mono font-medium" data-testid={`server-processes-${server.id}`}>
                    {server.process_count}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">CPU:</span>
                  <span className="font-mono font-medium" data-testid={`server-cpu-${server.id}`}>
                    {server.cpu_usage}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Memory:</span>
                  <span className="font-mono font-medium" data-testid={`server-memory-${server.id}`}>
                    {server.memory_usage}
                  </span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${server.status === "online" ? "bg-green-500" : server.status === "migrating" ? "bg-orange-500" : "bg-red-500"}`}
                    style={{ width: `${server.cpu_usage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
