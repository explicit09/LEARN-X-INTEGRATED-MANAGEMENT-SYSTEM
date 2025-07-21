# LIMS - LEARN-X Integrated Management System

## Overview
LIMS is an internal operations management platform for LEARN-X company. It is used by the management team to oversee and manage all business operations.

## Purpose
This is NOT a Laboratory Information Management System or an educational platform. It is an internal business operations tool for:
- Managing development tasks and codebase
- Tracking platform usage metrics and analytics
- Managing day-to-day business operations
- Internal team collaboration and project management
- Customer support and issue tracking
- Platform monitoring and maintenance

## Key Features
- **Task Management**: Kanban boards, sprints, and project tracking for development and business tasks
- **Team Collaboration**: Comments, activity tracking, and team member management
- **Analytics Dashboard**: Platform usage metrics, user statistics, and business KPIs
- **Template System**: Reusable task templates for common business operations
- **Real-time Updates**: Live synchronization of tasks and activities

## Task Template Categories
When creating task templates, focus on business operations such as:
- **Development**: Bug fixes, feature development, code reviews, deployments
- **Support**: Customer tickets, user issues, platform problems
- **Analytics**: Usage reports, metrics analysis, user behavior tracking
- **Infrastructure**: Server maintenance, monitoring, updates, backups
- **Business**: Marketing campaigns, team meetings, planning, documentation
- **Quality**: Testing, QA processes, performance monitoring

## Important Context
- This system manages the LEARN-X platform operations
- Used by internal team members and management
- Focuses on business efficiency and team productivity
- Integrates with their existing Supabase database for data storage

## Technical Stack
- Frontend: LitElement web components
- Backend: Electron + Node.js
- Database: Supabase (PostgreSQL)
- Real-time: Event-driven architecture with TaskEventBus