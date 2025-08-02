import grpc
import asyncio
import json
from typing import Dict, Optional
from concurrent.futures import ThreadPoolExecutor

import process_pb2
import process_pb2_grpc


class MigrationCoordinator:
    def __init__(self):
        self.server_endpoints = {
            "server-a": "localhost:50051",
            "server-b": "localhost:50052", 
            "server-c": "localhost:50053",
            "server-d": "localhost:50054",
            "server-e": "localhost:50055",
        }

    async def migrate_process(self, process_id: str, source_server: str, target_server: str) -> Dict:
        """
        Migrate a process from source to target server
        """
        try:
            print(f"Starting migration: {process_id} from {source_server} to {target_server}")
            
            # Step 1: Pause process on source server
            source_endpoint = self.server_endpoints.get(source_server)
            if not source_endpoint:
                raise Exception(f"Unknown source server: {source_server}")
            
            with grpc.insecure_channel(source_endpoint) as source_channel:
                source_stub = process_pb2_grpc.ProcessManagerStub(source_channel)
                
                # Pause the process and get its state
                pause_response = source_stub.PauseProcess(
                    process_pb2.ProcessID(id=process_id)
                )
                
                print(f"Process {process_id} paused on {source_server}")
                
                # Step 2: Resume process on target server
                target_endpoint = self.server_endpoints.get(target_server)
                if not target_endpoint:
                    raise Exception(f"Unknown target server: {target_server}")
                
                with grpc.insecure_channel(target_endpoint) as target_channel:
                    target_stub = process_pb2_grpc.ProcessManagerStub(target_channel)
                    
                    # Resume process with the serialized state
                    resume_response = target_stub.ResumeProcess(
                        process_pb2.ResumeRequest(
                            id=process_id,
                            data=pause_response.data
                        )
                    )
                    
                    print(f"Process {process_id} resumed on {target_server}")
                    
                    return {
                        "success": True,
                        "message": f"Process {process_id} successfully migrated from {source_server} to {target_server}",
                        "source_server": source_server,
                        "target_server": target_server,
                        "process_id": process_id
                    }
                    
        except grpc.RpcError as e:
            error_msg = f"gRPC error during migration: {e.code()}: {e.details()}"
            print(error_msg)
            return {
                "success": False,
                "error": error_msg,
                "source_server": source_server,
                "target_server": target_server,
                "process_id": process_id
            }
        except Exception as e:
            error_msg = f"Migration failed: {str(e)}"
            print(error_msg)
            return {
                "success": False,
                "error": error_msg,
                "source_server": source_server,
                "target_server": target_server,
                "process_id": process_id
            }

    async def start_process(self, process_id: str, process_type: str, server: str) -> Dict:
        """
        Start a new process on the specified server
        """
        try:
            endpoint = self.server_endpoints.get(server)
            if not endpoint:
                raise Exception(f"Unknown server: {server}")
            
            with grpc.insecure_channel(endpoint) as channel:
                stub = process_pb2_grpc.ProcessManagerStub(channel)
                
                response = stub.StartProcess(
                    process_pb2.ProcessRequest(
                        id=process_id,
                        type=process_type
                    )
                )
                
                return {
                    "success": True,
                    "message": f"Process {process_id} started on {server}",
                    "process_id": process_id,
                    "server": server,
                    "status": response.status
                }
                
        except grpc.RpcError as e:
            error_msg = f"gRPC error starting process: {e.code()}: {e.details()}"
            return {
                "success": False,
                "error": error_msg,
                "process_id": process_id,
                "server": server
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "process_id": process_id,
                "server": server
            }

    async def get_server_health(self, server: str) -> Dict:
        """
        Get health status of a server
        """
        try:
            endpoint = self.server_endpoints.get(server)
            if not endpoint:
                return {"server": server, "status": "unknown", "error": "Unknown server"}
            
            with grpc.insecure_channel(endpoint) as channel:
                stub = process_pb2_grpc.ProcessManagerStub(channel)
                
                response = stub.HealthCheck(process_pb2.Empty())
                
                return {
                    "server": server,
                    "status": response.status,
                    "server_name": response.server_name,
                    "process_count": response.process_count,
                    "endpoint": endpoint
                }
                
        except grpc.RpcError as e:
            return {
                "server": server,
                "status": "offline",
                "error": f"{e.code()}: {e.details()}"
            }
        except Exception as e:
            return {
                "server": server,
                "status": "error",
                "error": str(e)
            }

    async def get_all_servers_health(self) -> Dict:
        """
        Get health status of all servers
        """
        tasks = []
        for server in self.server_endpoints.keys():
            tasks.append(self.get_server_health(server))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            "servers": [r for r in results if not isinstance(r, Exception)],
            "timestamp": asyncio.get_event_loop().time()
        }


# Global coordinator instance
coordinator = MigrationCoordinator()


async def main():
    """
    Example usage of the coordinator
    """
    print("Migration Coordinator started")
    
    # Check server health
    health = await coordinator.get_all_servers_health()
    print("Server health:", json.dumps(health, indent=2))
    
    # Example migration
    # result = await coordinator.migrate_process("task-123", "server-a", "server-b")
    # print("Migration result:", json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
