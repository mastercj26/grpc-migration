import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, Square, ArrowRightLeft, Plus } from "lucide-react";
import type { ProcessWithServer } from "@shared/schema";

export function ProcessList() {
  const { toast } = useToast();
  
  const { data: processes, isLoading } = useQuery({
    queryKey: ["/api/processes"],
    refetchInterval: 5000,
  });

  const updateProcessMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest("PATCH", `/api/processes/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      toast({
        title: "Success",
        description: "Process updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update process",
        variant: "destructive",
      });
    },
  });

  const deleteProcessMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/processes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      toast({
        title: "Success",
        description: "Process stopped successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to stop process",
        variant: "destructive",
      });
    },
  });

  const createProcessMutation = useMutation({
    mutationFn: async (processData: any) => {
      return apiRequest("POST", "/api/processes", processData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/processes"] });
      toast({
        title: "Success",
        description: "Process created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create process",
        variant: "destructive",
      });
    },
  });

  const handlePauseProcess = (processId: string) => {
    updateProcessMutation.mutate({
      id: processId,
      updates: { status: "paused" }
    });
  };

  const handleResumeProcess = (processId: string) => {
    updateProcessMutation.mutate({
      id: processId,
      updates: { status: "running" }
    });
  };

  const handleStopProcess = (processId: string) => {
    deleteProcessMutation.mutate(processId);
  };

  const handleStartNewProcess = () => {
    const processId = `task-${Date.now()}`;
    createProcessMutation.mutate({
      id: processId,
      type: "Compute Task",
      status: "running",
      server_id: "server-a", // Default to server-a
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500 text-white";
      case "paused": return "bg-gray-400 text-white";
      case "migrating": return "bg-orange-500 text-white";
      case "stopped": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-500";
      case "paused": return "bg-gray-400";
      case "migrating": return "bg-orange-500 animate-pulse";
      case "stopped": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Active Processes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 bg-muted rounded-lg animate-pulse">
                <div className="h-4 bg-border rounded mb-2"></div>
                <div className="h-3 bg-border rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground">Active Processes</h3>
          <p className="text-sm text-muted-foreground">Manage running processes across all nodes</p>
        </div>
        <Button
          onClick={handleStartNewProcess}
          disabled={createProcessMutation.isPending}
          data-testid="button-new-process"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Process
        </Button>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {processes?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No processes running</p>
            </div>
          ) : (
            processes?.map((process: ProcessWithServer) => (
              <div 
                key={process.id} 
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
                data-testid={`process-item-${process.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusDotColor(process.status)}`}></div>
                    <span className="font-mono text-sm font-medium" data-testid={`process-id-${process.id}`}>
                      {process.id}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground" data-testid={`process-type-${process.id}`}>
                      {process.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {process.status === "migrating" 
                        ? "Migrating..." 
                        : `${process.status} on `}
                      <span className="font-mono" data-testid={`process-server-${process.id}`}>
                        {process.server?.name || "Unknown"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(process.status)}`}>
                    {process.status}
                  </span>
                  {process.status === "migrating" ? (
                    <div className="w-16 bg-border rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      {process.status === "running" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePauseProcess(process.id)}
                          disabled={updateProcessMutation.isPending}
                          data-testid={`button-pause-${process.id}`}
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      {process.status === "paused" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResumeProcess(process.id)}
                          disabled={updateProcessMutation.isPending}
                          data-testid={`button-resume-${process.id}`}
                          title="Resume"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updateProcessMutation.isPending}
                        data-testid={`button-migrate-${process.id}`}
                        title="Migrate"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStopProcess(process.id)}
                        disabled={deleteProcessMutation.isPending}
                        data-testid={`button-stop-${process.id}`}
                        title="Stop"
                      >
                        <Square className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
