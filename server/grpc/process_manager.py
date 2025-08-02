import grpc
import time
import threading
import pickle
import socket
from concurrent import futures
from typing import Dict, Any

import process_pb2
import process_pb2_grpc


class ProcessManagerServicer(process_pb2_grpc.ProcessManagerServicer):
    def __init__(self, server_name: str, port: int):
        self.server_name = server_name
        self.port = port
        self.processes: Dict[str, Dict[str, Any]] = {}
        self.lock = threading.Lock()

    def StartProcess(self, request, context):
        """Start a new process"""
        with self.lock:
            if request.id in self.processes:
                return process_pb2.ProcessResponse(
                    id=request.id,
                    status="error",
                    message="Process already exists"
                )
            
            # Simulate process initialization
            self.processes[request.id] = {
                "status": "running",
                "type": request.type,
                "start_time": time.time(),
                "data": {"progress": 0, "state": "initialized"}
            }
            
            print(f"[{self.server_name}] Started process {request.id} of type {request.type}")
            
            return process_pb2.ProcessResponse(
                id=request.id,
                status="started",
                message=f"Process {request.id} started successfully"
            )

    def PauseProcess(self, request, context):
        """Pause a running process and return its state"""
        with self.lock:
            if request.id not in self.processes:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details(f"Process {request.id} not found")
                return process_pb2.ProcessState()
            
            process = self.processes[request.id]
            if process["status"] != "running":
                context.set_code(grpc.StatusCode.FAILED_PRECONDITION)
                context.set_details(f"Process {request.id} is not running")
                return process_pb2.ProcessState()
            
            # Simulate state serialization
            process["status"] = "paused"
            process["data"]["pause_time"] = time.time()
            
            # Serialize state using pickle
            state_data = pickle.dumps(process["data"])
            
            print(f"[{self.server_name}] Paused process {request.id}, state size: {len(state_data)} bytes")
            
            return process_pb2.ProcessState(
                id=request.id,
                data=state_data,
                status="paused"
            )

    def ResumeProcess(self, request, context):
        """Resume a process from serialized state"""
        with self.lock:
            try:
                # Deserialize state
                state_data = pickle.loads(request.data)
                
                # Create or update process
                self.processes[request.id] = {
                    "status": "running",
                    "type": state_data.get("type", "unknown"),
                    "start_time": time.time(),
                    "data": state_data
                }
                
                print(f"[{self.server_name}] Resumed process {request.id}")
                
                return process_pb2.ProcessResponse(
                    id=request.id,
                    status="resumed",
                    message=f"Process {request.id} resumed successfully"
                )
                
            except Exception as e:
                context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
                context.set_details(f"Failed to deserialize state: {str(e)}")
                return process_pb2.ProcessResponse()

    def GetStatus(self, request, context):
        """Get process status"""
        with self.lock:
            if request.id not in self.processes:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details(f"Process {request.id} not found")
                return process_pb2.StatusResponse()
            
            process = self.processes[request.id]
            
            return process_pb2.StatusResponse(
                id=request.id,
                status=process["status"],
                host="localhost",
                port=self.port
            )

    def HealthCheck(self, request, context):
        """Health check endpoint"""
        return process_pb2.HealthResponse(
            status="healthy",
            server_name=self.server_name,
            process_count=len(self.processes)
        )

    def get_process_count(self):
        """Get current process count"""
        with self.lock:
            return len([p for p in self.processes.values() if p["status"] == "running"])


def serve(server_name: str, port: int):
    """Start the gRPC server"""
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    servicer = ProcessManagerServicer(server_name, port)
    process_pb2_grpc.add_ProcessManagerServicer_to_server(servicer, server)
    
    listen_addr = f'0.0.0.0:{port}'
    server.add_insecure_port(listen_addr)
    
    print(f"Starting {server_name} gRPC server on {listen_addr}")
    server.start()
    
    try:
        server.wait_for_termination()
    except KeyboardInterrupt:
        print(f"\nShutting down {server_name}")
        server.stop(grace=5)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: python process_manager.py <server_name> <port>")
        sys.exit(1)
    
    server_name = sys.argv[1]
    port = int(sys.argv[2])
    
    serve(server_name, port)
