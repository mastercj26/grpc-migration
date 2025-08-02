import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightLeft, X, Info } from "lucide-react";
import type { ProcessWithServer, Server, MigrationWithDetails } from "@shared/schema";

export function MigrationControl() {
  const { toast } = useToast();
  const [selectedProcess, setSelectedProcess] = useState("");
  const [sourceServer, setSourceServer] = useState("");
  const [targetServer, setTargetServer] = useState("");

  const { data: processes } = useQuery({
    queryKey: ["/api/processes"],
    refetchInterval: 5000,
  });

  const { data: servers } = useQuery({
    queryKey: ["/api/servers"],
    refetchInterval: 5000,
  });

  const { data: migrations } = useQuery({
    queryKey: ["/api/migrations"],
    refetchInterval: 5000,
  });

  const migrateMutation = useMutation({
    mutationFn: async (migrationData: any) => {
      return apiRequest("POST", "/api/migrations", migrationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/migrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      toast({
        title: "Migration Initiated",
        description: "Process migration has been started successfully",
      });
      clearForm();
    },
    onError: () => {
      toast({
        title: "Migration Failed",
        description: "Failed to initiate process migration",
        variant: "destructive",
      });
    },
  });

  const availableProcesses = processes?.filter((p: ProcessWithServer) => 
    p.status === "running" || p.status === "paused"
  ) || [];

  const onlineServers = servers?.filter((s: Server) => s.status === "online") || [];

  const recentMigrations = migrations?.slice(0, 3) || [];

  const handleProcessSelect = (processId: string) => {
    setSelectedProcess(processId);
    const process = processes?.find((p: ProcessWithServer) => p.id === processId);
    if (process?.server_id) {
      setSourceServer(process.server_id);
    }
  };

  const handleInitiateMigration = () => {
    if (!selectedProcess || !sourceServer || !targetServer) {
      toast({
        title: "Validation Error",
        description: "Please select process, source server, and target server",
        variant: "destructive",
      });
      return;
    }

    if (sourceServer === targetServer) {
      toast({
        title: "Validation Error", 
        description: "Source and target servers must be different",
        variant: "destructive",
      });
      return;
    }

    migrateMutation.mutate({
      process_id: selectedProcess,
      source_server_id: sourceServer,
      target_server_id: targetServer,
    });
  };

  const clearForm = () => {
    setSelectedProcess("");
    setSourceServer("");
    setTargetServer("");
  };

  const getServerName = (serverId: string) => {
    return servers?.find((s: Server) => s.id === serverId)?.name || serverId;
  };

  const getMigrationStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "failed": return "text-red-600";
      case "in_progress": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Migration Control</h3>
        <p className="text-sm text-muted-foreground">Manually trigger process migrations between servers</p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Process ID</label>
          <Select value={selectedProcess} onValueChange={handleProcessSelect}>
            <SelectTrigger data-testid="select-process">
              <SelectValue placeholder="Select a process to migrate" />
            </SelectTrigger>
            <SelectContent>
              {availableProcesses.length === 0 ? (
                <SelectItem value="none" disabled>No available processes</SelectItem>
              ) : (
                availableProcesses.map((process: ProcessWithServer) => (
                  <SelectItem key={process.id} value={process.id}>
                    {process.id} ({process.type})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Source Server</label>
            <Select value={sourceServer} onValueChange={setSourceServer}>
              <SelectTrigger data-testid="select-source-server">
                <SelectValue placeholder="Select source server" />
              </SelectTrigger>
              <SelectContent>
                {onlineServers.map((server: Server) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Target Server</label>
            <Select value={targetServer} onValueChange={setTargetServer}>
              <SelectTrigger data-testid="select-target-server">
                <SelectValue placeholder="Select target server" />
              </SelectTrigger>
              <SelectContent>
                {onlineServers.filter((s: Server) => s.id !== sourceServer).map((server: Server) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="text-blue-600 mt-0.5 w-4 h-4" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Migration Process</h4>
              <p className="text-sm text-blue-700">
                The process will be paused, state serialized, transferred to the target server, and resumed without data loss.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleInitiateMigration}
            disabled={migrateMutation.isPending || !selectedProcess || !sourceServer || !targetServer}
            className="flex-1"
            data-testid="button-initiate-migration"
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            {migrateMutation.isPending ? "Initiating..." : "Initiate Migration"}
          </Button>
          <Button
            variant="outline"
            onClick={clearForm}
            data-testid="button-clear-form"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Migrations</h4>
          <div className="space-y-2">
            {recentMigrations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent migrations</p>
            ) : (
              recentMigrations.map((migration: MigrationWithDetails) => (
                <div 
                  key={migration.id} 
                  className="flex items-center justify-between text-sm"
                  data-testid={`migration-item-${migration.id}`}
                >
                  <span className="font-mono">{migration.process_id}</span>
                  <span className="text-muted-foreground">
                    {getServerName(migration.source_server_id!)} → {getServerName(migration.target_server_id!)}
                  </span>
                  <span className={getMigrationStatusColor(migration.status)}>
                    {migration.status}
                  </span>
                  <span className="text-muted-foreground">
                    {formatTimeAgo(migration.started_at!.toString())}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
