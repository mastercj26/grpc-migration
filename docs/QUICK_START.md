# Quick Start Guide

Get the gRPC Process Migration Control system running in minutes!

## Prerequisites

Make sure you have these installed:
- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Python 3.8+** - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 1-Minute Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/grpc-process-migration.git
cd grpc-process-migration

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r python-requirements.txt
```

### 2. Generate gRPC Files

```bash
# Generate Protocol Buffer files
cd server/grpc
python -m grpc_tools.protoc --proto_path=. --python_out=. --grpc_python_out=. process.proto
cd ../..
```

### 3. Start the Application

**Terminal 1** - Start main application:
```bash
npm run dev
```

**Terminal 2** - Start gRPC services:
```bash
python start_grpc_services.py
```

### 4. Open Your Browser

Navigate to `http://localhost:5000`

🎉 **You're ready to go!**

## What You'll See

The application opens to a clean migration control interface:

1. **Process Selection** - Dropdown with available processes
2. **Server Selection** - Choose source and target servers
3. **Migration Info** - Details about the migration process
4. **Action Buttons** - Initiate migration or clear form
5. **Recent Migrations** - History of migration attempts

## First Migration Test

1. Select **"task-123"** from the Process dropdown
2. Choose **"Server-A"** as source server
3. Select **"Server-B"** as target server
4. Click **"Initiate Migration"**
5. Watch the migration appear in Recent Migrations

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill any process using port 5000
pkill -f "node.*5000"
# Or use a different port
PORT=3000 npm run dev
```

**Python Module Not Found**
```bash
# Make sure you're in the project directory
pip install -r python-requirements.txt
```

**gRPC Connection Failed**
```bash
# Verify gRPC services are running
python start_grpc_services.py
# Check if processes are listening on ports 50051-50055
netstat -an | grep 5005
```

### Development Tips

- Use `Ctrl+C` to stop services
- Changes to frontend code auto-reload
- Restart backend manually after server changes
- Check browser console for any JavaScript errors

## Next Steps

- **Explore the API** - See [API.md](API.md) for endpoint details
- **Read Architecture** - Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- **Deploy to Production** - Follow [DEPLOYMENT.md](DEPLOYMENT.md) guide
- **Contribute** - Read [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines

## Need Help?

- **Issues**: Create a GitHub issue
- **Questions**: Start a discussion
- **Documentation**: Check the `docs/` folder

Happy migrating! 🚀