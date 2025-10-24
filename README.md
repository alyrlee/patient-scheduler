# 🏥 AI-Powered Patient Scheduler

A modern, full-stack healthcare scheduling application with AI integration, built using React, Node.js, and advanced AI capabilities.

## 🏗️ Project Structure

This project follows a **monorepo architecture** with clear separation of concerns:

```
patient-scheduler/
├── 📁 apps/                       # Applications
│   ├── 📁 frontend/              # React frontend application
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/    # Reusable UI components
│   │   │   │   ├── 📁 ui/        # Base UI components (Button, Card, etc.)
│   │   │   │   ├── 📁 forms/     # Form components
│   │   │   │   ├── 📁 layout/    # Layout components (Header, Navbar, etc.)
│   │   │   │   └── 📁 features/  # Feature-specific components
│   │   │   ├── 📁 pages/         # Route-based pages
│   │   │   ├── 📁 hooks/         # Custom React hooks
│   │   │   ├── 📁 services/      # API services
│   │   │   ├── 📁 context/       # React context providers
│   │   │   ├── 📁 utils/         # Utility functions
│   │   │   └── 📁 assets/        # Static assets
│   │   ├── 📁 public/            # Public assets
│   │   └── package.json
│   └── 📁 backend/               # Node.js backend application
│       ├── 📁 src/
│       │   ├── 📁 controllers/   # Route controllers
│       │   ├── 📁 services/      # Business logic
│       │   ├── 📁 models/         # Data models
│       │   ├── 📁 middleware/     # Express middleware
│       │   ├── 📁 routes/         # API routes
│       │   ├── 📁 ai/            # AI integration
│       │   ├── 📁 rag/           # RAG system
│       │   └── 📁 utils/         # Utility functions
│       ├── 📁 database/          # Database files
│       └── package.json
├── 📁 packages/                  # Shared packages
│   ├── 📁 schemas/               # Shared Zod schemas
│   ├── 📁 ui/                    # Shared UI components
│   └── 📁 utils/                 # Shared utilities
├── 📁 docs/                      # Documentation
├── 📁 scripts/                   # Build & deployment scripts
├── 📁 tests/                     # E2E tests
└── package.json                  # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd patient-scheduler
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment files
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

This will start both frontend (http://localhost:5177) and backend (http://localhost:4000) servers.

## 📋 Available Scripts

### Root Level Commands
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run test             # Run all tests
npm run lint             # Lint all code
npm run seed             # Seed the database
npm run clean            # Clean all node_modules
```

### Frontend Commands
```bash
npm run dev:frontend     # Start frontend only
npm run build:frontend   # Build frontend only
npm run test:frontend    # Test frontend only
npm run lint:frontend    # Lint frontend only
```

### Backend Commands
```bash
npm run dev:backend      # Start backend only
npm run build:backend    # Build backend only
npm run test:backend      # Test backend only
npm run lint:backend      # Lint backend only
```

## 🏥 Features

### Frontend Features
- **Modern React Architecture** with hooks and context
- **Responsive Design** with Tailwind CSS
- **State Management** with TanStack Query
- **Form Handling** with React Hook Form + Zod validation
- **AI Chat Interface** with streaming responses
- **Provider Search** with advanced filtering
- **Appointment Management** with real-time updates

### Backend Features
- **RESTful API** with Express.js
- **Database Integration** with SQLite
- **Authentication** with JWT tokens
- **AI Integration** with OpenAI
- **RAG System** for intelligent responses
- **Rate Limiting** and security middleware
- **Comprehensive Logging**

### AI Capabilities
- **Intelligent Scheduling** with natural language processing
- **Provider Recommendations** based on patient needs
- **Automated Responses** to common queries
- **Context-Aware Chat** with conversation memory

## 🗄️ Database Schema

The application uses SQLite with the following main tables:

- **users** - Patient accounts and authentication
- **providers** - Healthcare providers with specialties
- **appointments** - Scheduled appointments
- **slots** - Available time slots for booking

## 🔧 Development

### Adding New Features

1. **Frontend Components**: Add to `apps/frontend/src/components/`
2. **Backend Routes**: Add to `apps/backend/src/routes/`
3. **Shared Code**: Add to `packages/`

### Code Organization

- **Components**: Organized by type (ui, forms, layout, features)
- **Pages**: Route-based components
- **Hooks**: Custom React hooks for state management
- **Services**: API communication layer
- **Utils**: Shared utility functions

## 🚀 Deployment

The application is designed for deployment on:
- **Vercel** (recommended for full-stack)
- **Railway** 
- **Docker** containers

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for better healthcare scheduling**
