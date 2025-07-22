<p align="center">
  <h1 align="center">LIMS: LEARN-X Integrated Management System 🚀</h1>
</p>

<p align="center">
  <strong>Internal Operations Management Platform for LEARN-X</strong>
</p>

## Overview

**LIMS (LEARN-X Integrated Management System)** is an internal business operations platform designed for the LEARN-X management team. It provides comprehensive tools for managing development tasks, tracking platform analytics, monitoring system health, and coordinating team operations.

### What LIMS Is

- ✅ **Internal Operations Tool** - For LEARN-X team members and management
- ✅ **Analytics Platform** - Real-time metrics and business intelligence
- ✅ **Task Management System** - Development tracking and team coordination
- ✅ **Platform Monitor** - System health and performance tracking

### What LIMS Is NOT

- ❌ Not a Laboratory Information Management System
- ❌ Not an educational platform for students
- ❌ Not a public-facing application

### Key Features

📊 **Comprehensive Analytics** - Real-time DAU/WAU/MAU, retention cohorts, and business KPIs

📋 **Task Management** - Kanban boards, sprints, and project tracking

📈 **Business Intelligence** - Conversion funnels, learning analytics, and actionable insights

🔔 **Alert System** - Threshold monitoring with customizable notification channels

⚡ **Real-time Processing** - PGMQ event streaming from LEARN-X platform

📄 **Reporting Engine** - Generate PDF/CSV reports for stakeholders

🎯 **Feature Adoption Tracking** - Monitor how users engage with platform features

## Installation

### Prerequisites

- Node.js 20.x.x (required for native dependencies)
- Python 3.8+
- npm or yarn

```bash
# Check your Node.js version
node --version

# If you need Node.js 20.x.x:
# Using nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Quick Start

```bash
# Clone the repository
git clone [your-repo-url]
cd lims

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the application
npm start
```

### Building from Source

```bash
# Build for development
npm run build

# Build for production (all platforms)
npm run build:all

# Platform-specific builds
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# LIMS Supabase Configuration
SUPABASE_URL=your_lims_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# JWT Configuration
JWT_SECRET=your_jwt_secret

# AI Provider Configuration (optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key

# LEARN-X Integration
# Note: LEARN-X should configure their environment to send events to LIMS Supabase
```

## Architecture

LIMS uses a modern, modular architecture:

### Core Technologies

- **Frontend**: LitElement web components + Electron
- **Backend**: Node.js with IPC bridge architecture
- **Database**: Supabase (PostgreSQL) + SQLite (local state)
- **Analytics Pipeline**: PGMQ (PostgreSQL Message Queue) for event streaming
- **Real-time**: Event-driven architecture with EventBus
- **AI Integration**: OpenAI, Anthropic, Google (via model providers)

### Analytics Architecture

```
LEARN-X Platform → PGMQ Queue → LIMS Analytics Pipeline
                                        ↓
                            ┌───────────────────────────┐
                            │   Event Processing        │
                            │   - Validation            │
                            │   - Categorization        │
                            │   - Storage               │
                            └───────────────────────────┘
                                        ↓
                            ┌───────────────────────────┐
                            │   Aggregation Services    │
                            │   - DAU/WAU/MAU           │
                            │   - Retention Cohorts     │
                            │   - Time-series Rollups   │
                            └───────────────────────────┘
                                        ↓
                            ┌───────────────────────────┐
                            │   Business Intelligence   │
                            │   - KPIs & Insights       │
                            │   - Conversion Funnels    │
                            │   - Report Generation     │
                            └───────────────────────────┘
```

## Development

### Project Structure

```
lims/
├── src/
│   ├── features/
│   │   ├── analytics/          # Analytics services
│   │   │   ├── services/       # PGMQ consumer, aggregation, reporting
│   │   │   └── analyticsService.js
│   │   ├── task-management/    # Task and project management
│   │   └── common/             # Shared services
│   ├── ui/
│   │   └── lims/
│   │       ├── modules/        # Dashboard modules
│   │       │   ├── AnalyticsDashboardModuleEnhanced.js
│   │       │   ├── BusinessIntelligenceDashboard.js
│   │       │   └── TaskManagementModule.js
│   │       └── core/           # Core UI framework
│   ├── bridge/                 # IPC communication layer
│   └── index.js               # Main process entry
├── public/                     # Static assets
├── docs/                       # Documentation
└── .claude/                    # Development sessions
```

### Running in Development

```bash
# Start with hot reload
npm run watch:renderer

# Run tests
npm test

# Lint code
npm run lint
```

## Analytics Integration

LIMS provides comprehensive analytics capabilities for monitoring the LEARN-X platform:

### Event Processing
- **95+ Event Types**: User lifecycle, learning engagement, feature usage, system performance
- **Real-time Processing**: Events streamed via PGMQ and processed immediately
- **Automatic Categorization**: Events sorted into business domains for analysis

### Metrics & KPIs
- **User Engagement**: DAU/WAU/MAU with new vs returning user breakdowns
- **Retention Analysis**: Cohort-based retention tracking over time
- **Feature Adoption**: Track how users engage with platform features
- **Learning Analytics**: Course completion rates, engagement metrics
- **System Health**: API performance, error rates, queue depth

### Dashboards
1. **Analytics Dashboard**: Real-time metrics, event feed, system health
2. **Business Intelligence**: KPIs, conversion funnels, actionable insights

### Reporting
- Generate PDF/CSV reports on demand
- Customizable report sections
- Scheduled report generation (coming soon)

## Contributing

We welcome contributions! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Never commit `.env` files or credentials
- Use environment variables for sensitive configuration
- Follow security best practices for internal tools

## License

This project is licensed under the GPL-3.0 License - see the LICENSE file for details.

## Acknowledgments

- Built with LitElement, Electron, and Supabase
- Analytics powered by PostgreSQL Message Queue (PGMQ)
- Charts rendered with Chart.js
- Developed for internal LEARN-X operations

---

<p align="center">
  <strong>LIMS - Empowering LEARN-X Operations</strong><br>
  Internal Use Only
</p>