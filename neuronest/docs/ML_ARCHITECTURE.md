# 🏗️ NeuroNest ML Architecture

## **System Architecture with ML Integration**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT APPLICATIONS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                 │
│  │   Web App    │    │  Desktop App │    │  Mobile App  │                 │
│  │   (Vite)     │    │  (Electron)  │    │ (Capacitor)  │                 │
│  │              │    │              │    │              │                 │
│  │  React 18    │    │  React 18    │    │  React 18    │                 │
│  │  TailwindCSS │    │  + Native    │    │  + Native    │                 │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                 │
│         │                    │                    │                          │
│         └────────────────────┴────────────────────┘                          │
│                              │                                               │
└──────────────────────────────┼───────────────────────────────────────────────┘
                               │ HTTP/REST API (Port 5000)
                               │
┌──────────────────────────────▼───────────────────────────────────────────────┐
│                        NODE.JS BACKEND (Express)                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     API ENDPOINTS                                    │   │
│  │  • /api/auth/*          - Authentication (OTP)                      │   │
│  │  • /api/patients/*      - Patient management                        │   │
│  │  • /api/games/*         - Cognitive games                           │   │
│  │  • /api/mood/*          - Mood tracking                             │   │
│  │  • /api/reminders/*     - Reminder management                       │   │
│  │  • /api/voice/*         - Voice commands                            │   │
│  │  • /api/ml/*            - ML predictions (proxy to Python service)  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     BUSINESS LOGIC                                   │   │
│  │  • Controllers  - Handle requests                                   │   │
│  │  • Services     - Business rules                                    │   │
│  │  • Validators   - Input validation                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────┬────────────────────────────────────────────────────────┬──────────────┘
      │                                                         │
      │ MongoDB Connection                                     │ HTTP/gRPC
      │ (Port 27017)                                          │ (Port 8000)
      │                                                         │
      ▼                                                         ▼
┌────────────────────┐                        ┌─────────────────────────────┐
│  MONGODB DATABASE  │                        │   PYTHON ML MICROSERVICE    │
├────────────────────┤                        ├─────────────────────────────┤
│                    │                        │    Framework: FastAPI       │
│  Collections:      │                        │                             │
│  • users           │                        │  ┌─────────────────────┐   │
│  • patients        │                        │  │   ML MODELS         │   │
│  • game_scores     │                        │  ├─────────────────────┤   │
│  • mood_checkins   │                        │  │ 1. Cognitive        │   │
│  • reminders       │                        │  │    Decline          │   │
│  • alerts          │                        │  │    Predictor        │   │
│  • caregivers      │                        │  │    (XGBoost)        │   │
│  • otps            │                        │  │                     │   │
│  • stories         │                        │  │ 2. Sentiment        │   │
│                    │                        │  │    Analyzer         │   │
│  Indexes:          │                        │  │    (BERT)           │   │
│  • patient_id      │                        │  │                     │   │
│  • date            │                        │  │ 3. Intent           │   │
│  • caregiver_id    │                        │  │    Classifier       │   │
└────────────────────┘                        │  │    (BERT)           │   │
                                              │  │                     │   │
                                              │  │ 4. Speech-to-Text  │   │
                                              │  │    (Whisper)        │   │
                                              │  │                     │   │
                                              │  │ 5. Story Generator  │   │
                                              │  │    (GPT-3.5)        │   │
                                              │  │                     │   │
                                              │  │ 6. Emotion          │   │
                                              │  │    Detector         │   │
                                              │  │    (DeepFace)       │   │
                                              │  │                     │   │
                                              │  │ 7. Translator       │   │
                                              │  │    (mBART-50)       │   │
                                              │  │                     │   │
                                              │  │ 8. Anomaly          │   │
                                              │  │    Detector         │   │
                                              │  │    (Isolation       │   │
                                              │  │     Forest)         │   │
                                              │  └─────────────────────┘   │
                                              │                             │
                                              │  API Endpoints:             │
                                              │  POST /predict/decline      │
                                              │  POST /analyze/sentiment    │
                                              │  POST /classify/intent      │
                                              │  POST /transcribe/audio     │
                                              │  POST /generate/story       │
                                              │  POST /detect/emotion       │
                                              │  POST /translate            │
                                              │  POST /detect/anomaly       │
                                              └─────────────────────────────┘
```

---

## **Data Flow Examples**

### **1. Cognitive Decline Prediction Flow**

```
User plays games regularly
        ↓
Frontend sends game scores to Backend
        ↓
Backend stores in MongoDB
        ↓
Weekly: Backend calls ML service with patient data
        ↓
ML service processes features:
  - Average accuracy over 30 days
  - Accuracy trend (improving/declining)
  - Session frequency
  - Mood patterns
  - Activity patterns
        ↓
XGBoost model predicts risk level
        ↓
ML service returns:
  {
    risk_level: "moderate",
    probability: 0.65,
    contributing_factors: {
      accuracy_decline: "high_impact",
      reduced_activity: "medium_impact"
    },
    recommendations: [
      "Schedule cognitive assessment",
      "Increase game frequency"
    ]
  }
        ↓
Backend stores prediction in alerts
        ↓
Caregiver sees alert on dashboard
```

---

### **2. Voice Command Flow**

```
User speaks: "Show me my reminders"
        ↓
Frontend: Web Speech API captures audio
        ↓
Frontend sends audio blob to Backend
        ↓
Backend forwards to ML service
        ↓
ML service: Whisper transcribes to text
        ↓
ML service: BERT classifies intent
  {
    intent: "navigate_reminders",
    confidence: 0.95,
    entities: {}
  }
        ↓
Backend returns navigation command
        ↓
Frontend executes: router.push('/reminders')
```

---

### **3. Mood Analysis Flow**

```
User writes mood note: "I feel lost and confused today"
        ↓
Frontend sends note to Backend
        ↓
Backend forwards to ML service
        ↓
ML service: BERT analyzes sentiment
  {
    primary_emotion: "sadness",
    confidence: 0.87,
    concerns: ["lost", "confused"],
    severity: "high"
  }
        ↓
Backend checks if alert needed
        ↓
If severity is high + consecutive bad moods:
  Create alert for caregiver
        ↓
Caregiver receives notification
```

---

## **ML Model Details**

### **1. Cognitive Decline Predictor**
```
Input Features (15 features):
├── Game Performance (5)
│   ├── avg_accuracy_30d
│   ├── accuracy_trend (slope)
│   ├── accuracy_variance
│   ├── avg_time_per_game
│   └── completion_rate
│
├── Activity Patterns (4)
│   ├── sessions_per_week
│   ├── avg_session_duration
│   ├── days_since_last_login
│   └── time_of_day_pattern
│
├── Mood Patterns (3)
│   ├── avg_mood_score
│   ├── mood_volatility
│   └── negative_mood_ratio
│
└── Other (3)
    ├── age
    ├── reminder_completion_rate
    └── voice_command_success_rate

Output:
├── Risk Level: [stable, mild, moderate, severe]
├── Probability: [0.0 - 1.0]
└── Feature Importance: Top contributing factors

Algorithm: XGBoost Classifier
Training: 1000+ synthetic + real patient data
Update Frequency: Weekly retraining
```

---

### **2. Sentiment Analyzer**
```
Input: Text (mood notes, voice transcripts)

Processing:
├── Tokenization (BERT tokenizer)
├── Embedding (768-dim vectors)
├── Classification (fine-tuned BERT)
└── Post-processing (concern detection)

Output:
├── Primary Emotion: [happy, sad, angry, fear, surprise, neutral]
├── Confidence: [0.0 - 1.0]
├── Severity: [low, medium, high]
└── Concerns: List of detected concerning keywords

Model: cardiffnlp/twitter-roberta-base-sentiment-multilingual
Languages: All 9 supported languages
Latency: <100ms
```

---

### **3. Intent Classifier**
```
Input: Voice command transcript + context

Supported Intents:
├── Navigation (5)
│   ├── navigate_home
│   ├── navigate_games
│   ├── navigate_reminders
│   ├── navigate_mood
│   └── navigate_settings
│
├── Actions (6)
│   ├── play_game [game_type: memory|pattern|routine]
│   ├── check_mood
│   ├── add_reminder [time, type]
│   ├── call_caregiver
│   ├── help
│   └── repeat
│
└── Meta (2)
    ├── unknown
    └── cancel

Model: Fine-tuned BERT on voice commands
Fallback: Regex-based matching
Accuracy: 95%+ on test set
```

---

### **4. Speech-to-Text**
```
Input: Audio file (WAV, MP3, M4A)

Processing:
├── Audio preprocessing (normalize, denoise)
├── Whisper transcription
├── Post-processing (medical term correction)
└── Confidence scoring

Output:
├── Text: Full transcription
├── Confidence: [0.0 - 1.0]
├── Words: [{text, start, end, confidence}]
└── Language: Auto-detected

Model: OpenAI Whisper (medium)
Languages: 99 languages supported
Special: Optimized for elderly speech patterns
Latency: ~2-5 seconds per minute of audio
```

---

### **5. Story Generator**
```
Input:
├── Patient profile (name, age, background)
├── Theme (childhood, family, work, etc.)
├── Preferences (length, tone, language)
└── Personal memories (optional)

Processing:
├── Build therapeutic prompt
├── GPT-3.5 generation
├── Post-processing (structure, keywords)
└── Translation (if not English)

Output:
├── Title
├── Content (full story)
├── Chapters (4 chapters)
├── Keywords (for quiz generation)
└── Estimated reading time

Model: GPT-3.5-turbo
Alternative: LLaMA 2 (self-hosted, free)
Tone: Warm, nostalgic, therapeutic
Length: 500-1000 words
```

---

### **6. Facial Emotion Detector**
```
Input: Webcam frame or image

Processing:
├── Face detection (Haar Cascade)
├── Face alignment
├── Feature extraction (CNN)
├── Emotion classification
└── Temporal smoothing (for video)

Output:
├── Primary emotion: [happy, sad, angry, fear, surprise, neutral]
├── Confidence: [0.0 - 1.0]
├── All emotions: {happy: 0.7, sad: 0.1, ...}
└── Face location: {x, y, width, height}

Model: DeepFace (VGG-Face)
Alternative: face-api.js (browser-based)
FPS: 10-15 (real-time)
Privacy: Processed locally, not stored
```

---

### **7. Neural Translator**
```
Input:
├── Text
├── Source language
└── Target language

Processing:
├── Tokenization (mBART tokenizer)
├── Encoding
├── Translation
└── Post-processing (medical term preservation)

Output:
├── Translated text
├── Confidence: [0.0 - 1.0]
└── Alternative translations (top 3)

Model: facebook/mbart-large-50-many-to-many-mmt
Languages: 50+ (covers all 9 NeuroNest languages)
Quality: Better than Google Translate for medical context
Latency: ~500ms per sentence
```

---

### **8. Anomaly Detector**
```
Input: Current activity pattern

Features:
├── Login time (hour of day)
├── Session duration
├── Games played count
├── Game types distribution
├── Mood entries count
└── Reminder interactions

Processing:
├── Feature extraction
├── Isolation Forest scoring
├── Threshold comparison
└── Anomaly explanation

Output:
├── Is anomalous: [true/false]
├── Anomaly score: [-1.0 to 1.0]
├── Unusual aspects: List of anomalous features
└── Severity: [low, medium, high]

Algorithm: Isolation Forest
Training: 30 days of normal activity
Update: Daily retraining
False positive rate: <5%
```

---

## **Deployment Architecture**

### **Production Setup**

```
                    ┌─────────────────────┐
                    │   Load Balancer     │
                    │   (Nginx/AWS ALB)   │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌─────────────────────┐       ┌─────────────────────┐
    │  Node.js Backend    │       │  Node.js Backend    │
    │  (Instance 1)       │       │  (Instance 2)       │
    └──────────┬──────────┘       └──────────┬──────────┘
               │                              │
               └──────────────┬───────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │  Python ML Service      │
                 │  (with GPU - optional)  │
                 └──────────┬──────────────┘
                            │
                            ▼
                 ┌─────────────────────────┐
                 │  MongoDB Atlas          │
                 │  (Managed DB)           │
                 └─────────────────────────┘
```

---

## **Scaling Strategy**

### **Current Capacity**
- **Users**: 100-1000 concurrent
- **ML Requests**: 1000/hour
- **Response Time**: <2 seconds

### **When to Scale**

```
If response_time > 2s OR cpu_usage > 80%:
    ├── Horizontal Scaling
    │   ├── Add Node.js instances (easy)
    │   └── Add ML service replicas (needs GPU)
    │
    ├── Vertical Scaling
    │   ├── Upgrade ML server (add GPU)
    │   └── Increase RAM
    │
    └── Optimization
        ├── Add Redis caching
        ├── Use model quantization
        └── Implement request batching
```

---

## **Monitoring & Observability**

### **Metrics to Track**

```
Application Metrics:
├── Request rate (requests/second)
├── Response time (p50, p95, p99)
├── Error rate (%)
└── Active users

ML Metrics:
├── Model inference time
├── Model accuracy (online evaluation)
├── Cache hit rate
└── GPU utilization

Business Metrics:
├── Patient engagement (sessions/day)
├── Alert accuracy (true positives)
├── Caregiver response time
└── Feature usage distribution
```

### **Alerting Rules**

```python
# Example alerts
if response_time_p95 > 3000ms:
    alert("High latency detected")

if error_rate > 5%:
    alert("Error rate spike")

if model_accuracy < 0.80:
    alert("Model degradation - retrain needed")

if gpu_memory > 90%:
    alert("GPU memory pressure")
```

---

## **Cost Breakdown**

### **Monthly Costs (Estimated)**

```
Infrastructure:
├── VPS (DigitalOcean/AWS)        $30-50
├── MongoDB Atlas (Shared)        $0-9 (free tier available)
├── ML Server (GPU optional)      $0-100
└── Storage (S3/DO Spaces)        $5-10

ML APIs:
├── OpenAI API (GPT-3.5)         $20-50 (based on usage)
├── Whisper (self-hosted)        $0 (free)
└── Other (Hugging Face)         $0 (free)

Total: $55-219/month

Free Tier: $0-20/month (with all open-source models)
```

---

**This architecture provides a complete overview of how ML integrates into NeuroNest!** 🏗️
