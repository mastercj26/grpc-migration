# Contributing to gRPC Process Migration System

Thank you for your interest in contributing to the gRPC Process Migration System! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- Python 3.8+
- Git
- Basic knowledge of React, TypeScript, Express.js, and gRPC

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/grpc-process-migration.git
   cd grpc-process-migration
   ```

2. **Install Dependencies**
   ```bash
   npm install
   pip install -r python-requirements.txt
   ```

3. **Start Development Environment**
   ```bash
   # Terminal 1: Start main application
   npm run dev
   
   # Terminal 2: Start gRPC services
   python start_grpc_services.py
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript/JavaScript**: Follow ESLint configuration
- **Python**: Follow PEP 8 guidelines
- **React Components**: Use functional components with hooks
- **File Naming**: Use kebab-case for files, PascalCase for React components

### Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── lib/            # Utility functions
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express.js backend
│   ├── grpc/              # gRPC services and protobuf
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Data layer
├── shared/                # Shared types and schemas
└── docs/                  # Documentation
```

### Commit Message Format

Use conventional commits:

```
type(scope): description

feat(ui): add process migration progress indicator
fix(grpc): resolve connection timeout issues
docs(readme): update installation instructions
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🛠️ Making Changes

### Frontend (React + TypeScript)

- Use Tailwind CSS for styling
- Implement proper TypeScript types
- Add data-testid attributes for interactive elements
- Use TanStack Query for server state management
- Follow existing component patterns

### Backend (Express.js)

- Maintain RESTful API design
- Add proper error handling
- Update storage interface for new operations
- Validate input using Zod schemas

### gRPC Services (Python)

- Update `.proto` files for new message types
- Regenerate Python files after proto changes:
  ```bash
  cd server/grpc
  python -m grpc_tools.protoc --proto_path=. --python_out=. --grpc_python_out=. process.proto
  ```
- Handle gRPC errors gracefully
- Add proper logging

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
npm run test

# Backend tests  
npm run test:server

# Integration tests
npm run test:integration
```

### Test Guidelines

- Write unit tests for new functions
- Add integration tests for API endpoints
- Test gRPC service interactions
- Include error scenarios in tests

## 📝 Documentation

### Required Documentation

- Update README.md for new features
- Add JSDoc comments for complex functions
- Update API documentation for new endpoints
- Include examples in docstrings

### Writing Guidelines

- Use clear, concise language
- Include code examples
- Document breaking changes
- Update architecture diagrams if needed

## 🔄 Pull Request Process

### Before Submitting

1. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

2. **Update Documentation**
   - README.md if needed
   - API documentation
   - Code comments

3. **Check Dependencies**
   - No unnecessary dependencies
   - Update package.json if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] Manual testing completed
- [ ] Integration tests added

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. Automated checks must pass
2. At least one maintainer review required
3. Address all feedback before merge
4. Squash commits for clean history

## 🐛 Bug Reports

### Bug Report Template

```markdown
**Describe the Bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen

**Screenshots**
Add screenshots if applicable

**Environment:**
- OS: [e.g. Windows, macOS, Linux]
- Browser: [e.g. Chrome, Firefox]
- Node.js version: [e.g. 20.x]
- Python version: [e.g. 3.11]

**Additional Context**
Any other context about the problem
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Other solutions you've considered

**Additional context**
Any other context, mockups, or examples
```

## 🏗️ Architecture Decisions

### Adding New Features

1. **Discuss First**: Open an issue for major features
2. **Design Document**: Create design doc for complex features
3. **Incremental Development**: Break large features into smaller PRs
4. **Backward Compatibility**: Maintain API compatibility when possible

### Technology Choices

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **gRPC**: Python with asyncio support
- **State Management**: TanStack Query
- **Database**: Interface-based (currently in-memory)

## 📞 Getting Help

### Communication Channels

- **Issues**: GitHub Issues for bugs and features
- **Discussions**: GitHub Discussions for questions
- **Documentation**: Check README.md and docs/

### Code Review

- Be respectful and constructive
- Explain the "why" behind suggestions
- Accept feedback gracefully
- Focus on code, not the person

## 🎉 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes for significant contributions
- GitHub contributor list

Thank you for contributing to the gRPC Process Migration System!