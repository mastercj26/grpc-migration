import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, RefreshCw } from "lucide-react";
import type { SystemLog } from "@shared/schema";

export function SystemLogs() {
  const { toast } = useToast();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/logs"],
    refetchInterval: 5000,
  });

  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/logs");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({
        title: "Success",
        description: "System logs cleared successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear logs",
        variant: "destructive",
      });
    },
  });

  const refreshLogs = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "INFO": return "text-green-400";
      case "WARN": return "text-yellow-400";
      case "ERROR": return "text-red-400";
      case "gRPC": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">System Logs</h3>
          <p className="text-sm text-muted-foreground">Real-time logs from gRPC services and migration operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearLogsMutation.mutate()}
            disabled={clearLogsMutation.isPending}
            data-testid="button-clear-logs"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshLogs}
            data-testid="button-refresh-logs"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm text-gray-100">
          {isLoading ? (
            <div className="text-gray-400">Loading logs...</div>
          ) : logs?.length === 0 ? (
            <div className="text-gray-400">No logs available</div>
          ) : (
            <div className="space-y-1">
              {logs?.map((log: SystemLog) => (
                <div key={log.id} className="flex items-start space-x-2" data-testid={`log-entry-${log.id}`}>
                  <span className="text-gray-400 text-xs" data-testid={`log-timestamp-${log.id}`}>
                    {formatTimestamp(log.timestamp!.toString())}
                  </span>
                  <span className={`font-medium ${getLevelColor(log.level)}`}>
                    [{log.level}]
                  </span>
                  {log.component && (
                    <span className="text-blue-400">[{log.component}]</span>
                  )}
                  <span className="text-white" data-testid={`log-message-${log.id}`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
