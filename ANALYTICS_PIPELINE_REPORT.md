# LEARN-X to Glass LIMS Analytics Pipeline Analysis Report

**Date**: January 21, 2025  
**Prepared by**: Analytics Integration Team

## Executive Summary

This report provides a comprehensive analysis of the analytics event pipeline between LEARN-X and Glass LIMS. We identified critical gaps in event tracking, data structure mismatches, and missing business-critical events that need immediate attention.

## 1. Current State Analysis

### 1.1 What LEARN-X is Actually Sending to PGMQ

**Total Events Being Sent**: 40 unique event types (out of 95 defined)
- 29 events using EventType enum (validated)
- 11 events using raw strings (unvalidated)

**Key Findings**:
- Only 42% of defined events are actually implemented
- Mixed use of enum types and raw strings creates maintenance issues
- PGMQ connection uses Glass LIMS credentials when available

### 1.2 What Glass LIMS Expects to Receive

**Total Events Expected**: 67+ event types
- Glass consumer is flexible and accepts unknown events
- Stores all events in analytics_events table
- Processes known events for aggregations

**Key Findings**:
- Glass handles both flat and nested data structures
- Expects certain context fields (user_tier, user_created_at)
- Has alternate naming for some events

## 2. Critical Gaps Identified

### 2.1 Business-Critical Events NOT Being Sent

#### Subscription & Payment Events (0% implemented)
```
❌ SUBSCRIPTION_CREATED
❌ SUBSCRIPTION_UPGRADED  
❌ SUBSCRIPTION_DOWNGRADED
❌ SUBSCRIPTION_CANCELLED
❌ PAYMENT_PROCESSED
❌ PAYMENT_FAILED
```
**Impact**: Cannot track revenue, churn, or subscription lifecycle

#### User Engagement Events (0% implemented)
```
❌ USER_LOGIN
❌ USER_LOGOUT
❌ SESSION_ENDED
❌ LESSON_STARTED
❌ LESSON_COMPLETED
❌ LESSON_PROGRESS
```
**Impact**: Cannot accurately measure user engagement or learning effectiveness

#### Quiz Events (0% implemented)
```
❌ QUIZ_STARTED
❌ QUIZ_QUESTION_ANSWERED
❌ QUIZ_COMPLETED
❌ QUIZ_ABANDONED
```
**Impact**: Cannot track assessment effectiveness or student performance

#### Onboarding Events (0% implemented)
```
❌ ONBOARDING_STARTED
❌ ONBOARDING_STEP_COMPLETED
❌ ONBOARDING_COMPLETED
❌ PERSONA_CREATED
```
**Impact**: Cannot optimize onboarding funnel or measure conversion

### 2.2 Events with Naming Mismatches

| LEARN-X Sends | Glass Expects | Status |
|---------------|---------------|---------|
| Not sent | `page_view` | ❌ Missing |
| Not sent | `section_view` | ❌ Missing |
| Not sent | `button_click` | ❌ Missing |
| `USER_REGISTERED` | `user_registration` | ⚠️ Works but inconsistent |
| `PROCESSING_STARTED` | `document_processing_started` | ⚠️ Works but inconsistent |

### 2.3 Data Structure Issues

1. **Nested vs Flat Structure**:
   - LEARN-X sometimes sends fields at top level, sometimes nested
   - Glass checks both locations but prefers flat structure

2. **Missing Context Fields**:
   - `user_tier`: Not sent by LEARN-X
   - `user_created_at`: Not sent by LEARN-X
   - Canvas events missing: `canvas_domain`, `course_name`

3. **Field Type Mismatches**:
   - Datetime fields need ISO 8601 format
   - Some numeric fields sent as strings

## 3. Events LEARN-X Tracks But Doesn't Send

Based on frontend code analysis, these events are tracked but not sent to PGMQ:
- Voice playback events (play, pause, complete)
- Note and highlight interactions
- Landing page interactions
- Quiz interactions
- Detailed lesson progress

## 4. Recommendations

### 4.1 For LEARN-X Team - IMMEDIATE ACTIONS

1. **Implement Business-Critical Events** (Priority: CRITICAL)
   ```python
   # Add to event emission:
   - All subscription events
   - All payment events  
   - USER_LOGIN / USER_LOGOUT
   - LESSON_STARTED / LESSON_COMPLETED
   ```

2. **Fix Event Type Consistency** (Priority: HIGH)
   - Add missing EventType enum values
   - Convert all string events to enum types
   - Remove conditional analytics disabling

3. **Standardize Data Structure** (Priority: MEDIUM)
   - Send all fields at top level
   - Include user context fields
   - Add Canvas-specific fields for Canvas events

### 4.2 For Glass LIMS Team

1. **Update Event Mappings**
   - Add handlers for subscription/payment events
   - Create aggregations for business metrics
   - Add alert rules for critical events

2. **Enhance Monitoring**
   - Track unknown event types
   - Monitor event volume trends
   - Alert on missing expected events

### 4.3 For Both Teams

1. **Establish Event Contract**
   - Document all events and required fields
   - Version the event schema
   - Set up automated testing

2. **Implement Monitoring**
   - Event volume dashboards
   - Missing event alerts
   - Data quality checks

## 5. Implementation Roadmap

### Phase 1: Critical Fixes (Week 1-2)
- [ ] Implement subscription/payment events
- [ ] Add user login/logout tracking
- [ ] Fix event type consistency

### Phase 2: Engagement Tracking (Week 3-4)
- [ ] Implement lesson lifecycle events
- [ ] Add quiz tracking
- [ ] Enable onboarding funnel

### Phase 3: Enhancement (Week 5-6)
- [ ] Standardize data structures
- [ ] Add missing context fields
- [ ] Implement comprehensive testing

## 6. Testing Checklist

```bash
# Events that MUST be verified:
✓ User signs up → USER_REGISTERED event
✓ User logs in → USER_LOGIN event
✓ User uploads document → DOCUMENT_UPLOADED event
✓ Lesson generated → LESSON_GENERATED event
✓ User starts lesson → LESSON_STARTED event
✓ User completes lesson → LESSON_COMPLETED event
✓ User takes quiz → QUIZ_STARTED, QUIZ_COMPLETED events
✓ Subscription created → SUBSCRIPTION_CREATED event
✓ Payment processed → PAYMENT_PROCESSED event
```

## 7. Monitoring Requirements

1. **Daily Metrics**:
   - Total events received
   - Events by type
   - Error rate
   - Unknown event types

2. **Alerts**:
   - No LOGIN events for 1 hour
   - No LESSON events for 2 hours
   - Error rate > 5%
   - Unknown event type detected

## Appendix A: Complete Event Comparison

[See attached detailed comparison table with all 95 events]

## Appendix B: Code Examples

### Correct Event Emission (LEARN-X)
```python
# Good - Using enum with full context
await analytics.emit(
    EventType.LESSON_STARTED,
    user_id=user.id,
    lesson_id=lesson.id,
    lesson_title=lesson.title,
    user_tier=user.subscription_tier,
    user_created_at=user.created_at.isoformat()
)
```

### Expected Event Structure (Glass LIMS)
```json
{
  "event_type": "lesson_started",
  "timestamp": "2025-01-21T14:30:00.000Z",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "lesson_id": "lesson_abc123",
  "lesson_title": "Introduction to Python",
  "user_tier": "premium",
  "user_created_at": "2024-01-15T10:00:00.000Z",
  "service": "learn-x"
}
```

---

**Next Steps**: Schedule a meeting between LEARN-X and Glass LIMS teams to review this report and create an action plan.