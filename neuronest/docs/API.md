# NeuroNest API Documentation

Base URL: `http://localhost:5000/api`

## Table of Contents

- [Authentication](#authentication)
- [Patients](#patients)
- [Game Scores](#game-scores)
- [Mood Tracking](#mood-tracking)
- [Reminders](#reminders)
- [Caregivers](#caregivers)
- [Alerts](#alerts)
- [Voice Commands](#voice-commands)
- [Error Handling](#error-handling)

## Authentication

**Status**: Currently using patient/caregiver IDs  
**Planned**: JWT authentication in v2.0

## Patients

### Get All Patients

```http
GET /api/patients
```

**Response**:
```json
{
  "patients": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "age": 75,
      "currentDifficulty": "medium",
      "language": "en",
      "fontSize": "normal",
      "caregiverId": "507f1f77bcf86cd799439012",
      "createdAt": "2026-08-30T10:00:00.000Z"
    }
  ]
}
```

### Create Patient

```http
POST /api/patients
Content-Type: application/json

{
  "name": "John Doe",
  "age": 75,
  "language": "en",
  "caregiverId": "507f1f77bcf86cd799439012"
}
```

**Response**: `201 Created`
```json
{
  "patient": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "age": 75,
    "currentDifficulty": "easy",
    "language": "en",
    "fontSize": "normal",
    "caregiverId": "507f1f77bcf86cd799439012"
  }
}
```

### Get Patient by ID

```http
GET /api/patients/:id
```

**Response**:
```json
{
  "patient": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "age": 75,
    "currentDifficulty": "medium",
    "language": "en"
  }
}
```

### Update Patient

```http
PUT /api/patients/:id
Content-Type: application/json

{
  "currentDifficulty": "hard",
  "fontSize": "large"
}
```

**Response**:
```json
{
  "patient": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "currentDifficulty": "hard",
    "fontSize": "large"
  }
}
```

### Delete Patient

```http
DELETE /api/patients/:id
```

**Response**: `200 OK`
```json
{
  "message": "Patient deleted successfully"
}
```

## Game Scores

### Submit Game Score

```http
POST /api/scores
Content-Type: application/json

{
  "patientId": "507f1f77bcf86cd799439011",
  "gameType": "memory_match",
  "difficulty": "medium",
  "score": 85,
  "accuracy": 87.5,
  "timeSpent": 120,
  "attemptsUsed": 8
}
```

**Response**: `201 Created`
```json
{
  "score": {
    "_id": "507f1f77bcf86cd799439013",
    "patientId": "507f1f77bcf86cd799439011",
    "gameType": "memory_match",
    "difficulty": "medium",
    "score": 85,
    "accuracy": 87.5,
    "date": "2026-08-30T10:30:00.000Z"
  },
  "newDifficulty": "hard",
  "message": "Great job! Difficulty increased to hard"
}
```

### Get Patient Scores

```http
GET /api/scores/patient/:patientId
```

**Query Parameters**:
- `gameType` (optional): Filter by game type
- `limit` (optional): Number of results (default: 50)

**Response**:
```json
{
  "scores": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "patientId": "507f1f77bcf86cd799439011",
      "gameType": "memory_match",
      "difficulty": "medium",
      "score": 85,
      "accuracy": 87.5,
      "timeSpent": 120,
      "date": "2026-08-30T10:30:00.000Z"
    }
  ]
}
```

### Get Performance Analytics

```http
GET /api/scores/analytics/:patientId
```

**Response**:
```json
{
  "analytics": {
    "overallAccuracy": 82.3,
    "gamesPlayed": 45,
    "byGame": [
      {
        "gameType": "memory_match",
        "averageAccuracy": 85.2,
        "gamesPlayed": 15,
        "trend": "improving"
      }
    ],
    "recentTrend": "stable",
    "recommendedDifficulty": "hard"
  }
}
```

## Mood Tracking

### Submit Mood Check-in

```http
POST /api/mood
Content-Type: application/json

{
  "patientId": "507f1f77bcf86cd799439011",
  "mood": "happy",
  "moodScore": 4,
  "notes": "Feeling great today!"
}
```

**Response**: `201 Created`
```json
{
  "moodCheckin": {
    "_id": "507f1f77bcf86cd799439014",
    "patientId": "507f1f77bcf86cd799439011",
    "mood": "happy",
    "moodScore": 4,
    "notes": "Feeling great today!",
    "date": "2026-08-30T10:00:00.000Z"
  }
}
```

### Get Patient Mood History

```http
GET /api/mood/patient/:patientId
```

**Query Parameters**:
- `limit` (optional): Number of results (default: 30)
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response**:
```json
{
  "moods": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "patientId": "507f1f77bcf86cd799439011",
      "mood": "happy",
      "moodScore": 4,
      "date": "2026-08-30T10:00:00.000Z"
    }
  ]
}
```

### Get Mood Trend

```http
GET /api/mood/trend/:patientId
```

**Query Parameters**:
- `days` (optional): Number of days to analyze (default: 7)

**Response**:
```json
{
  "trend": [
    {
      "date": "2026-08-30",
      "averageMood": 3.8,
      "checkinCount": 1
    }
  ],
  "overall": "positive",
  "alertNeeded": false
}
```

## Reminders

### Create Reminder

```http
POST /api/reminders
Content-Type: application/json

{
  "patientId": "507f1f77bcf86cd799439011",
  "type": "medication",
  "title": "Take morning pills",
  "time": "2026-08-31T08:00:00.000Z",
  "isRecurring": true,
  "notes": "With breakfast"
}
```

**Response**: `201 Created`
```json
{
  "reminder": {
    "_id": "507f1f77bcf86cd799439015",
    "patientId": "507f1f77bcf86cd799439011",
    "type": "medication",
    "title": "Take morning pills",
    "time": "08:00",
    "isRecurring": true,
    "notes": "With breakfast",
    "completed": false
  }
}
```

### Get Patient Reminders

```http
GET /api/reminders/patient/:patientId
```

**Query Parameters**:
- `status` (optional): `pending`, `completed`, `missed`

**Response**:
```json
{
  "reminders": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "patientId": "507f1f77bcf86cd799439011",
      "type": "medication",
      "title": "Take morning pills",
      "time": "08:00",
      "completed": false,
      "status": "pending"
    }
  ]
}
```

### Mark Reminder Complete

```http
PUT /api/reminders/:id/complete
```

**Response**:
```json
{
  "reminder": {
    "_id": "507f1f77bcf86cd799439015",
    "completed": true,
    "completedAt": "2026-08-30T08:05:00.000Z"
  }
}
```

### Delete Reminder

```http
DELETE /api/reminders/:id
```

**Response**: `200 OK`
```json
{
  "message": "Reminder deleted successfully"
}
```

## Caregivers

### Create Caregiver

```http
POST /api/caregivers
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890"
}
```

**Response**: `201 Created`
```json
{
  "caregiver": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890"
  }
}
```

### Get Caregiver Dashboard

```http
GET /api/caregivers/:id/dashboard
```

**Response**:
```json
{
  "caregiver": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith"
  },
  "patient": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "currentDifficulty": "medium"
  },
  "recentScores": [...],
  "moodTrend": [...],
  "activeAlerts": [...],
  "performanceByGame": [...]
}
```

## Alerts

### Get Patient Alerts

```http
GET /api/alerts/patient/:patientId
```

**Query Parameters**:
- `resolved` (optional): `true` or `false` (default: false)

**Response**:
```json
{
  "alerts": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "patientId": "507f1f77bcf86cd799439011",
      "type": "low_performance",
      "severity": "medium",
      "message": "Patient accuracy dropped below 60% in recent games",
      "resolved": false,
      "createdAt": "2026-08-30T10:00:00.000Z"
    }
  ]
}
```

### Resolve Alert

```http
PUT /api/alerts/:id/resolve
```

**Response**:
```json
{
  "alert": {
    "_id": "507f1f77bcf86cd799439016",
    "resolved": true,
    "resolvedAt": "2026-08-30T11:00:00.000Z"
  }
}
```

## Voice Commands

### Process Voice Command

```http
POST /api/voice/process
Content-Type: application/json

{
  "command": "show my mood",
  "patientId": "507f1f77bcf86cd799439011"
}
```

**Response**:
```json
{
  "action": "navigate",
  "target": "/mood",
  "response": "Showing your mood history"
}
```

### Get Available Commands

```http
GET /api/voice/commands
```

**Response**:
```json
{
  "commands": [
    {
      "phrase": "show my mood",
      "action": "navigate",
      "target": "/mood"
    },
    {
      "phrase": "play memory game",
      "action": "navigate",
      "target": "/games/memory"
    }
  ]
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "message": "Error description",
    "status": 404,
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid data)
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Codes

- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `VALIDATION_ERROR` - Invalid input data
- `DATABASE_ERROR` - Database operation failed
- `DUPLICATE_ENTRY` - Resource already exists

## Rate Limiting

**Status**: Not currently implemented  
**Planned**: 100 requests per minute per IP

## Pagination

For endpoints returning lists, use these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

## Webhooks

**Status**: Not currently implemented  
**Planned**: v2.0 will support webhooks for alerts and reminders

---

**Version**: 1.0.0  
**Last Updated**: August 30, 2026
