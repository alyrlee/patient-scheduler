# 🏥 AI-Powered Patient Scheduler

A modern, full-stack healthcare scheduling application with AI integration, built using React, Node.js, and advanced AI capabilities. Features a beautiful, responsive UI with comprehensive design system, robust authentication, and intelligent appointment management.

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

This will start both frontend (http://localhost:5174) and backend (http://localhost:4000) servers.

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

### 🎨 Modern UI/UX
- **Beautiful Design System** with purple theme and semantic colors
- **Responsive Navigation** with sticky header and mobile menu
- **Smooth Animations** with fade-in and slide effects
- **Accessibility Features** with ARIA labels and focus management
- **Custom Scrollbars** and modern styling
- **Glassmorphism Effects** with backdrop blur

### 🚀 Frontend Features
- **Modern React Architecture** with hooks and context
- **Responsive Design** with custom CSS and Tailwind integration
- **State Management** with TanStack Query and optimized caching
- **Form Handling** with React Hook Form + Zod validation
- **AI Chat Interface** with streaming responses
- **Provider Search** with advanced filtering
- **Appointment Management** with real-time updates
- **Error Boundaries** for robust error handling
- **TypeScript Support** for type safety

### 🔧 Backend Features
- **RESTful API** with Express.js and comprehensive error handling
- **Database Integration** with SQLite and foreign key constraints
- **Authentication** with JWT tokens and secure cookies
- **AI Integration** with OpenAI and intelligent responses
- **RAG System** for context-aware conversations
- **Rate Limiting** and security middleware
- **Structured Logging** with request tracking
- **Health Check Endpoints** for monitoring
- **Environment Validation** with Zod schemas

### 🤖 AI Capabilities
- **Intelligent Scheduling** with natural language processing
- **Provider Recommendations** based on patient needs and preferences
- **Automated Responses** to common queries with context awareness
- **Conversation Memory** for seamless chat experiences
- **PHI Protection** with data sanitization
- **Fallback Mechanisms** for AI service failures

### 🛡️ Security & Performance
- **JWT Authentication** with secure token management
- **Input Validation** with Zod schemas
- **Error Handling** with standardized API responses
- **Caching Strategy** with TanStack Query optimization
- **Bundle Optimization** with Vite and modern tooling
- **Accessibility Compliance** with WCAG guidelines

## 🗄️ Database Schema

The application uses SQLite with the following main tables:

- **users** - Patient accounts and authentication
- **providers** - Healthcare providers with specialties and availability
- **appointments** - Scheduled appointments with status tracking
- **slots** - Available time slots for booking
- **conversations** - AI chat history and context

## 🎨 Design System

### Color Palette
- **Primary**: Purple theme (#7c3aed, #6d28d9, #5b21b6)
- **Semantic Colors**: Success (green), Warning (yellow), Danger (red)
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font Family**: Inter with system fallbacks
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG compliant contrast ratios

### Components
- **Buttons**: Primary, secondary, and danger variants
- **Cards**: Standard and elevated styles
- **Forms**: Consistent input styling with validation
- **Navigation**: Active/inactive states with smooth transitions

## 🔧 Development

### 🚀 Quick Start Demo

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Access the application**:
   - Frontend: http://localhost:5174
   - Backend: http://localhost:4000
   - Health Check: http://localhost:4000/health

3. **Demo Credentials**:
   - Email: `demo_user@gmail.com`
   - Password: `Demo1234*`

### 📱 Demo Flow Screenshots

The application features a modern, responsive interface with the following key screens:

#### 🏠 **Landing Page**
- Clean, modern design with purple theme
- Responsive navigation header
- Call-to-action buttons for login/signup
- Mobile-friendly layout

#### 🔐 **Authentication**
- **Login Page**: Secure authentication with email/password
- **Signup Page**: User registration with validation
- **Protected Routes**: Automatic redirect to login for unauthenticated users

#### 📊 **Dashboard**
- **Welcome Message**: Personalized greeting with user name
- **Overview Cards**: Today's appointments, upcoming tasks, AI assistant
- **Quick Actions**: Easy access to key features
- **Responsive Design**: Works on all device sizes

#### 👨‍⚕️ **Providers Page**
- **Search & Filter**: Find providers by name, specialty, location
- **Provider Cards**: Detailed information with ratings and availability
- **Time Slots**: Available appointment times with booking buttons
- **Grid Layout**: Easy browsing of multiple providers

#### 📅 **Appointments Page**
- **All Appointments**: View scheduled, cancelled, and completed appointments
- **Status Tracking**: Clear status indicators (confirmed, cancelled, completed)
- **Action Buttons**: Cancel and reschedule options
- **Provider Details**: Doctor name and location information

#### 🤖 **AI Assistant**
- **Chat Interface**: Natural language conversation
- **Quick Actions**: Pre-defined buttons for common tasks
- **Context Awareness**: Remembers conversation history
- **Real-time Responses**: Streaming AI responses

#### 🎨 **Design Features**
- **Purple Theme**: Consistent brand colors throughout
- **Smooth Animations**: Fade-in and slide effects
- **Responsive Navigation**: Mobile menu and desktop navigation
- **Accessibility**: ARIA labels, focus management, keyboard navigation
- **Modern UI**: Glassmorphism effects, custom scrollbars, hover states

### 📁 Adding New Features

1. **Frontend Components**: Add to `apps/frontend/src/components/`
2. **Backend Routes**: Add to `apps/backend/src/routes/`

### 🛠️ Development Workflow

#### **Adding a New Route + Nav Item**

1. **Create the page component** in `apps/frontend/src/pages/`
2. **Add the route** to `apps/frontend/src/App.jsx`:
   ```jsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. **Update navigation** in `apps/frontend/src/components/AppHeader.tsx`:
   ```jsx
   const nav = [
     { label: "Dashboard", href: "/" },
     { label: "Providers", href: "/providers" },
     { label: "Appointments", href: "/appointments" },
     { label: "AI Assistant", href: "/chat" },
     { label: "New Page", href: "/new-page" }, // Add here
   ];
   ```

#### **Adding a New API Endpoint**

1. **Create the route file** in `apps/backend/src/routes/`
2. **Add validation schemas** in `packages/schemas/src/`
3. **Register the route** in `apps/backend/src/app.js`
4. **Add TypeScript types** in `apps/backend/src/types/`

#### **Styling Guidelines**

- **Use design tokens**: Leverage the established color palette and spacing
- **Custom CSS classes**: Use `.btn-primary`, `.card`, `.nav-link` for consistency
- **Responsive design**: Mobile-first approach with breakpoint utilities
- **Accessibility**: Include ARIA labels and focus management

### 🏗️ Code Organization

- **Components**: Organized by type (ui, forms, layout, features)
- **Pages**: Route-based components with proper routing
- **Hooks**: Custom React hooks for state management
- **Services**: API communication layer with TanStack Query
- **Utils**: Shared utility functions
- **Schemas**: Zod validation schemas for type safety
- **Types**: TypeScript definitions for API contracts

### 🎨 Design System Usage

- **Colors**: Use semantic color classes (primary, success, warning, danger)
- **Components**: Leverage custom CSS classes (btn-primary, card, nav-link)
- **Animations**: Apply utility classes (animate-fade-in-up, animate-slide-in-right)
- **Responsive**: Mobile-first approach with breakpoint utilities

## 🚀 Deployment

The application is designed for deployment on:
- **Vercel** (recommended for full-stack)
- **Railway** 
- **Docker** containers

### Environment Variables

Required environment variables:
```bash
# Backend (.env)
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
NODE_ENV=production
PORT=4000

# Frontend (.env)
VITE_API_URL=http://localhost:4000
```

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

## 🎯 Recent Improvements

### ✅ Completed Features
- **Modern Header Component** with sticky navigation and mobile menu
- **Design System** with purple theme and semantic colors
- **Enhanced Authentication** with JWT token management
- **Query Optimization** with TanStack Query caching
- **Form Validation** with Zod schemas
- **Error Handling** with standardized API responses
- **Health Monitoring** with comprehensive endpoints
- **Accessibility Features** with ARIA labels and focus management
- **Responsive Design** with mobile-first approach
- **Type Safety** with TypeScript integration

### 🚧 In Progress
- **E2E Testing** with Playwright
- **Performance Optimization** with bundle analysis
- **AI Guardrails** with PHI protection
- **Documentation** with comprehensive guides

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
