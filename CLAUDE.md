# LIMS - LEARN-X Integrated Management System

## Overview
LIMS is an internal operations management platform for LEARN-X company. It provides comprehensive tools for managing business operations, tracking platform analytics, and coordinating team activities.

## Purpose
This is NOT a Laboratory Information Management System or an educational platform. It is an internal business operations tool specifically designed for:
- **Analytics & Intelligence**: Real-time platform metrics, user behavior analysis, and business KPIs
- **Task Management**: Development tracking, sprint planning, and project coordination
- **Platform Monitoring**: System health, performance metrics, and alert management
- **Team Operations**: Internal collaboration, resource management, and workflow optimization
- **Business Reporting**: Stakeholder reports, insights generation, and data-driven decisions

## Core Modules

### 1. Analytics Module
Comprehensive analytics integration with LEARN-X platform:
- **Event Processing**: Handles 95+ event types from user actions to system performance
- **Real-time Metrics**: DAU/WAU/MAU calculations with user segmentation
- **Retention Analysis**: Cohort-based retention tracking
- **Feature Adoption**: Monitor engagement with platform features
- **Custom Dashboards**: Analytics Dashboard and Business Intelligence Dashboard

### 2. Task Management Module
Full-featured project and task tracking:
- **Kanban Boards**: Visual task management with drag-and-drop
- **Sprint Planning**: Agile development support
- **Templates**: Reusable task templates for common operations
- **Bulk Operations**: Manage multiple tasks efficiently
- **Real-time Updates**: Live synchronization across team members

### 3. Business Intelligence
Advanced insights and reporting:
- **KPI Tracking**: Revenue metrics, user growth, engagement rates
- **Conversion Funnels**: Analyze user journey and drop-off points
- **Learning Analytics**: Course completion, engagement metrics
- **Report Generation**: PDF/CSV exports for stakeholders
- **Actionable Insights**: AI-powered recommendations

## Analytics Pipeline Architecture

```
LEARN-X Events → PGMQ Queue → LIMS Processing → Aggregation → Dashboards
```

### Event Categories Tracked
1. **User Lifecycle**: Registration, login, logout, profile updates
2. **Learning Engagement**: Lesson starts, progress, completion, abandonment
3. **Interactive Features**: Highlights, notes, chat messages, AI suggestions
4. **Platform Performance**: API latency, error rates, resource usage
5. **Business Events**: Feature adoption, conversion events, retention signals

### Data Processing
- **Batch Processing**: Events processed in configurable batches
- **Real-time Aggregation**: Automatic calculation of metrics
- **Alert Monitoring**: Threshold-based alerts for anomalies
- **Data Retention**: Configurable retention policies

## Technical Architecture

### Frontend
- **UI Framework**: LitElement web components
- **Dashboards**: Chart.js for data visualization
- **State Management**: Event-driven with custom EventBus
- **Module System**: Dynamic module loading with LIMSModuleLoader

### Backend
- **Runtime**: Electron + Node.js
- **IPC Bridge**: Secure communication between renderer and main process
- **Service Layer**: Modular services for each feature domain
- **Queue Processing**: PGMQ consumer for event streaming

### Database
- **Primary**: Supabase (PostgreSQL) for all business data
- **Analytics Tables**: 
  - `analytics_events`: Raw event storage
  - `daily_active_users`, `weekly_active_users`, `monthly_active_users`
  - `user_retention_cohorts`: Retention analysis
  - `feature_adoption`: Feature usage tracking
  - `alert_history`: Alert management
- **Local Storage**: SQLite for offline state and caching

### Integration Points
- **LEARN-X Platform**: Sends events via PGMQ
- **Supabase**: Both LIMS and LEARN-X use Supabase
- **AI Providers**: OpenAI, Anthropic, Google (for insights)

## Development Guidelines

### When Working on Analytics
1. All metrics must be calculated from real events, never use estimates
2. Test user IDs should be filtered from production metrics
3. Use proper error handling - analytics failures should not crash the app
4. Cache expensive calculations with appropriate TTL

### When Working on Tasks
1. All task operations should emit events for activity tracking
2. Bulk operations should be optimized for performance
3. Real-time updates should use the TaskEventBus
4. Templates should be versioned for compatibility

### Security Considerations
- This is an internal tool - implement appropriate access controls
- Never expose production credentials in code
- Use environment variables for all sensitive configuration
- Audit logs for all critical operations

## Current Status
- ✅ Analytics pipeline fully operational
- ✅ Task management with 22+ features implemented
- ✅ Real-time dashboards with comprehensive metrics
- ✅ Report generation (PDF/CSV)
- ✅ Alert system with customizable thresholds
- 🔄 Scheduled reports (coming soon)
- 🔄 Email notifications (planned)