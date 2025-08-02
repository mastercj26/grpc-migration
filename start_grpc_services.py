#!/usr/bin/env python3
"""
Start multiple gRPC server instances for testing the process migration system
"""

import subprocess
import sys
import time
import os
import signal
from concurrent.futures import ThreadPoolExecutor

# Server configurations
SERVERS = [
    {"name": "Server-A", "port": 50051},
    {"name": "Server-B", "port": 50052},
    {"name": "Server-C", "port": 50053},
    {"name": "Server-D", "port": 50054},
    {"name": "Server-E", "port": 50055},
]

processes = []

def start_server(server_config):
    """Start a single gRPC server process"""
    name = server_config["name"]
    port = server_config["port"]
    
    print(f"Starting {name} on port {port}")
    
    # Change to the gRPC directory
    grpc_dir = os.path.join(os.path.dirname(__file__), "server", "grpc")
    
    process = subprocess.Popen([
        sys.executable, "process_manager.py", name, str(port)
    ], cwd=grpc_dir)
    
    return process

def signal_handler(signum, frame):
    """Handle Ctrl+C gracefully"""
    print("\nShutting down all servers...")
    
    for process in processes:
        try:
            process.terminate()
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        except Exception as e:
            print(f"Error terminating process: {e}")
    
    print("All servers stopped.")
    sys.exit(0)

def main():
    """Main function to start all gRPC servers"""
    print("Starting gRPC Process Migration System")
    print("=" * 50)
    
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start all servers
    for server_config in SERVERS:
        try:
            process = start_server(server_config)
            processes.append(process)
            time.sleep(1)  # Small delay between starts
        except Exception as e:
            print(f"Failed to start {server_config['name']}: {e}")
            signal_handler(None, None)
            return
    
    print("\nAll servers started successfully!")
    print("=" * 50)
    print("Available servers:")
    for server in SERVERS:
        print(f"  {server['name']}: localhost:{server['port']}")
    
    print("\nPress Ctrl+C to stop all servers")
    print("=" * 50)
    
    # Wait for all processes
    try:
        while True:
            # Check if any process has died
            for i, process in enumerate(processes):
                if process.poll() is not None:
                    server_name = SERVERS[i]["name"]
                    print(f"Warning: {server_name} has stopped unexpectedly")
            
            time.sleep(5)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()
