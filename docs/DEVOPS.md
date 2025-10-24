# DevOps & Developer Experience Guide

## 🚀 CI/CD Pipeline

### GitHub Actions Workflows

#### 1. **CI/CD Pipeline** (`.github/workflows/ci.yml`)
- **Lint & Type Check**: ESLint, TypeScript validation
- **Frontend Tests & Build**: Unit tests, build verification
- **Backend Tests & Build**: API tests, server build
- **API Integration Tests**: End-to-end API testing
- **Performance Budget**: Bundle size monitoring
- **Security Scan**: Vulnerability detection
- **Preview Deploy**: Automatic PR previews
- **Production Deploy**: Main branch deployments

#### 2. **Preview Deployment** (`.github/workflows/preview-deploy.yml`)
- Automatic preview deployments for every PR
- Frontend deployed to Vercel preview
- Backend deployed to Railway/Render preview
- E2E tests run against preview URLs
- PR comments with preview links

#### 3. **Security Scanning** (`.github/workflows/security-scan.yml`)
- Daily dependency vulnerability scans
- Code security analysis with Trivy
- Secrets detection with TruffleHog
- Container security scanning
- Security team notifications

#### 4. **Performance Monitoring** (`.github/workflows/performance-monitor.yml`)
- Lighthouse CI for performance metrics
- Bundle size analysis and reporting
- Performance regression detection
- Daily performance monitoring

#### 5. **Secrets Rotation** (`.github/workflows/secrets-rotation.yml`)
- Daily automated secrets rotation
- AWS Secrets Manager integration
- OIDC-based authentication
- Secure credential updates

## 🔐 Secrets Management

### GitHub Environments

#### **Production Environment**
- **Protection Rules**: 2 required reviewers, 5-minute wait timer
- **Required Checks**: CI/CD Pipeline, Performance Budget, Security Scan
- **Secrets**:
  - `VERCEL_TOKEN`: Vercel deployment token
  - `OPENAI_API_KEY`: OpenAI API key (rotated daily)
  - `DATABASE_URL`: Production database connection
  - `AWS_ROLE_ARN`: AWS IAM role for secrets management

#### **Preview Environment**
- **Protection Rules**: 1 required reviewer
- **Required Checks**: Lint & Type Check, Frontend Tests & Build
- **Secrets**:
  - `VERCEL_TOKEN`: Vercel deployment token
  - `RAILWAY_TOKEN`: Railway backend deployment token
  - `OPENAI_API_KEY`: OpenAI API key for previews

### OIDC Integration
- AWS IAM roles with OIDC trust relationship
- No long-lived AWS credentials stored in GitHub
- Automatic token rotation and refresh
- Principle of least privilege access

## 🧪 Testing Strategy

### Unit Tests
```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test
npm run test:e2e -- --grep "booking flow"
```

### API Tests
```bash
# Run API integration tests
npm run test:api
```

### Test Coverage
- **Unit Tests**: React components, hooks, utilities
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: Complete user workflows
- **Visual Regression**: Critical UI components

## 📊 Performance Monitoring

### Bundle Size Budget
- **Main JS Bundle**: < 250KB gzipped
- **Main CSS Bundle**: < 50KB gzipped
- **Total Bundle**: < 300KB gzipped

### Performance Metrics
- **Lighthouse Performance**: > 90
- **Lighthouse Accessibility**: > 95
- **Lighthouse Best Practices**: > 90
- **Lighthouse SEO**: > 90

### Monitoring Tools
- **Lighthouse CI**: Automated performance testing
- **Bundle Analyzer**: Bundle size visualization
- **Web Vitals**: Core Web Vitals tracking
- **Performance Budget**: CI-enforced size limits

## 🚀 Deployment Strategy

### Preview Deployments
- **Trigger**: Every PR creation/update
- **Frontend**: Vercel preview deployment
- **Backend**: Railway/Render preview deployment
- **Testing**: E2E tests run against preview URLs
- **Cleanup**: Automatic cleanup on PR close

### Production Deployments
- **Trigger**: Push to main branch
- **Approval**: Required 2 reviewers
- **Checks**: All CI checks must pass
- **Rollback**: Automatic rollback on failure
- **Monitoring**: Real-time performance monitoring

## 🔧 Development Workflow

### Local Development
```bash
# Start development servers
npm run dev          # Frontend (port 5174)
cd server && npm start  # Backend (port 4000)

# Run tests
npm run test:all

# Run linting
npm run lint:fix

# Build for production
npm run build
```

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (via ESLint)
- **TypeScript**: Type checking (optional)
- **Husky**: Pre-commit hooks
- **Lint-staged**: Staged file linting

### Git Workflow
1. **Feature Branch**: Create from `develop`
2. **Development**: Make changes, run tests locally
3. **Pull Request**: Create PR with description
4. **CI Checks**: Automated testing and validation
5. **Review**: Code review by team members
6. **Merge**: Merge to `develop` or `main`

## 📈 Monitoring & Alerting

### Application Monitoring
- **Uptime Monitoring**: Service availability
- **Error Tracking**: Application errors and exceptions
- **Performance Monitoring**: Response times and throughput
- **User Analytics**: Usage patterns and behavior

### Infrastructure Monitoring
- **Resource Usage**: CPU, memory, disk, network
- **Database Performance**: Query performance and optimization
- **API Rate Limiting**: Request rate monitoring
- **Security Events**: Authentication and authorization logs

### Alerting Channels
- **Slack**: Real-time notifications
- **Email**: Critical alerts and reports
- **PagerDuty**: On-call incident management
- **GitHub Issues**: Automated issue creation

## 🛡️ Security Best Practices

### Code Security
- **Dependency Scanning**: Automated vulnerability detection
- **Secrets Detection**: Prevent credential leaks
- **SAST**: Static Application Security Testing
- **DAST**: Dynamic Application Security Testing

### Infrastructure Security
- **Container Scanning**: Docker image vulnerability scanning
- **Network Security**: Firewall and access controls
- **Encryption**: Data encryption at rest and in transit
- **Access Control**: Role-based access management

### Compliance
- **SOC 2**: Security and availability controls
- **GDPR**: Data protection and privacy
- **HIPAA**: Healthcare data protection (if applicable)
- **PCI DSS**: Payment card data security (if applicable)

## 📚 Additional Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Railway Deployment Guide](https://docs.railway.app)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)

### Tools
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright Testing](https://playwright.dev)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [Trivy Security Scanner](https://trivy.dev)

### Support
- **DevOps Team**: #devops-support
- **Security Team**: #security-team
- **Performance Team**: #performance-team
- **On-Call**: PagerDuty rotation
