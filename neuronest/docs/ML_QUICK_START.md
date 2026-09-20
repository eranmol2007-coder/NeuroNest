# 🚀 NeuroNest ML Quick Start Guide

## **TL;DR - What ML Tools You Need**

### **Core ML Stack (Mandatory)**
```bash
# Python ML Backend
pip install fastapi uvicorn
pip install scikit-learn xgboost
pip install transformers torch
pip install pandas numpy

# Core Models
- XGBoost: Cognitive decline prediction
- BERT/RoBERTa: Sentiment analysis & intent classification
- Whisper: Speech-to-text
```

### **Recommended Tools**

| **Feature** | **Tool/Library** | **Why** | **Cost** |
|-------------|-----------------|---------|----------|
| **Cognitive Decline Prediction** | XGBoost + scikit-learn | Fast, explainable, works offline | Free |
| **Sentiment Analysis** | Hugging Face Transformers | Pre-trained, multilingual | Free |
| **Voice Intent** | BERT fine-tuned or Rasa NLU | Context-aware NLU | Free |
| **Speech-to-Text** | OpenAI Whisper | Best for elderly speech | Free |
| **Story Generation** | OpenAI GPT-3.5 or LLaMA 2 | Natural language generation | $0.002/1K tokens or Free |
| **Facial Emotion** | DeepFace or face-api.js | Real-time emotion detection | Free |
| **Translation** | mBART-50 (Hugging Face) | 50+ languages | Free |
| **Anomaly Detection** | Isolation Forest (sklearn) | Detect unusual patterns | Free |

---

## **3 Options: Choose Your Path**

### **🆓 Option 1: Fully Free/Open Source**
**Cost:** $0/month (self-hosted)

```python
# All free, open-source models
- XGBoost for predictions
- Hugging Face Transformers (BERT, mBART, etc.)
- OpenAI Whisper (self-hosted)
- DeepFace for emotions
- Self-hosted on your VPS
```

**Pros:** Complete control, no API costs, privacy-friendly
**Cons:** Requires ML knowledge, slower inference, need GPU

---

### **💰 Option 2: Hybrid (Recommended)**
**Cost:** ~$50-100/month

```python
# Mix of open-source + paid APIs
- Free: XGBoost, Whisper, DeepFace (self-hosted)
- Paid: OpenAI GPT-3.5 for story generation ($0.002/1K tokens)
- Cloud: AWS/DigitalOcean VPS ($20-30/month)
```

**Pros:** Best of both worlds, reliable, cost-effective
**Cons:** Some API dependency

---

### **🚀 Option 3: Fully Cloud-based**
**Cost:** ~$200-300/month

```python
# All cloud APIs
- OpenAI API (GPT-4, Whisper)
- Google Cloud Speech-to-Text
- AWS SageMaker for custom models
- Hosted on AWS/GCP
```

**Pros:** Easiest, most reliable, best performance
**Cons:** Higher cost, API dependencies

---

## **Quick Setup (30 Minutes)**

### **Step 1: Create ML Microservice**
```bash
# Create Python service
mkdir neuronest-ml
cd neuronest-ml
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn transformers torch scikit-learn xgboost
```

### **Step 2: Create Basic API**
```python
# main.py
from fastapi import FastAPI
from transformers import pipeline

app = FastAPI()

# Load sentiment analyzer
sentiment = pipeline("sentiment-analysis", 
                     model="cardiffnlp/twitter-roberta-base-sentiment-multilingual")

@app.post("/analyze/sentiment")
def analyze_sentiment(text: str):
    result = sentiment(text)[0]
    return {
        "emotion": result['label'],
        "confidence": result['score']
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
```

### **Step 3: Run ML Service**
```bash
uvicorn main:app --reload --port 8000
```

### **Step 4: Connect to Node.js Backend**
```javascript
// backend/services/mlService.js
const axios = require('axios');

async function analyzeSentiment(text) {
  const response = await axios.post('http://localhost:8000/analyze/sentiment', {
    text: text
  });
  return response.data;
}
```

**Done!** You now have ML integrated. 🎉

---

## **Desktop App (10 Minutes)**

### **Convert to Electron**
```bash
# In your frontend directory
npm install --save-dev electron electron-builder

# Create electron/main.js
# (see full code in ML_INTEGRATION_PLAN.md)

# Run desktop app
npm run electron:dev

# Build for distribution
npm run electron:build
```

---

## **Mobile App (30 Minutes)**

### **Option A: Capacitor (Easiest)**
```bash
# In your frontend directory
npm install @capacitor/core @capacitor/cli
npx cap init NeuroNest com.neuronest.app
npx cap add android
npx cap add ios

# Build and sync
npm run build
npx cap sync
npx cap open android  # or ios
```

---

## **Model Training (First Time)**

### **Generate Training Data**
```python
# scripts/generate_data.py
import pandas as pd
import numpy as np

# Generate 1000 synthetic patients
data = []
for i in range(1000):
    patient = {
        'avg_accuracy': np.random.uniform(40, 95),
        'session_frequency': np.random.randint(1, 7),
        'mood_score': np.random.uniform(1, 5),
        'status': np.random.choice(['stable', 'declining'], p=[0.7, 0.3])
    }
    data.append(patient)

df = pd.DataFrame(data)
df.to_csv('training_data.csv', index=False)
print(f"Generated {len(df)} training samples")
```

### **Train Model**
```python
# scripts/train_model.py
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
import joblib

# Load data
df = pd.read_csv('training_data.csv')
X = df[['avg_accuracy', 'session_frequency', 'mood_score']]
y = df['status']

# Train
model = RandomForestClassifier(n_estimators=100)
model.fit(X, y)

# Save
joblib.dump(model, 'cognitive_model.pkl')
print("Model trained and saved!")
```

### **Use Model in API**
```python
# In main.py
import joblib

model = joblib.load('cognitive_model.pkl')

@app.post("/predict/cognitive-decline")
def predict(avg_accuracy: float, session_frequency: int, mood_score: float):
    prediction = model.predict([[avg_accuracy, session_frequency, mood_score]])
    probability = model.predict_proba([[avg_accuracy, session_frequency, mood_score]])
    
    return {
        "status": prediction[0],
        "confidence": float(probability[0][1])
    }
```

---

## **Testing ML Models**

### **Test Sentiment Analysis**
```bash
curl -X POST http://localhost:8000/analyze/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "I feel happy today!"}'
```

### **Test Cognitive Prediction**
```bash
curl -X POST http://localhost:8000/predict/cognitive-decline \
  -H "Content-Type: application/json" \
  -d '{"avg_accuracy": 75, "session_frequency": 5, "mood_score": 4.0}'
```

---

## **Performance Tips**

### **Speed Up Inference**
```python
# Use smaller models
model = pipeline("sentiment-analysis", model="distilbert-base-uncased")

# Use quantization
from transformers import AutoModelForSequenceClassification
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    torchscript=True  # Faster inference
)

# Cache predictions
from functools import lru_cache

@lru_cache(maxsize=1000)
def cached_prediction(text):
    return model(text)
```

---

## **Deployment Checklist**

### **Before Production**
- [ ] Test all ML endpoints
- [ ] Set up error handling
- [ ] Add request validation
- [ ] Implement rate limiting
- [ ] Set up monitoring (Sentry)
- [ ] Add HTTPS
- [ ] Configure CORS properly
- [ ] Set up auto-restart (PM2)
- [ ] Test with real patient data (anonymized)
- [ ] Document API endpoints

### **Security**
```python
# Add API key authentication
from fastapi import Header, HTTPException

API_KEY = "your-secret-key"

@app.post("/predict")
async def predict(data: dict, api_key: str = Header(...)):
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    # ... rest of code
```

---

## **Cost Optimization**

### **Free Tier Limits**
- **Hugging Face API**: 30K chars/month free
- **OpenAI**: $5 free credit for new accounts
- **Google Cloud**: $300 credit for 90 days
- **AWS**: 12 months free tier

### **Reduce Costs**
1. **Cache predictions** for common inputs
2. **Batch requests** instead of one-by-one
3. **Use smaller models** (distilbert vs bert)
4. **Self-host open-source models**

---

## **Common Issues & Solutions**

### **Issue: Model loading is slow**
**Solution:** Load models at startup, not per request
```python
# Load once at startup
model = pipeline("sentiment-analysis", model="...")

@app.post("/analyze")
def analyze(text: str):
    return model(text)  # Fast
```

### **Issue: Out of memory**
**Solution:** Use smaller models or quantization
```python
from transformers import AutoModel
model = AutoModel.from_pretrained("distilbert-base-uncased")  # Smaller
```

### **Issue: Slow inference**
**Solution:** Use GPU or ONNX Runtime
```python
import onnxruntime
# Convert model to ONNX for 2-3x speedup
```

---

## **Learning Resources**

### **Beginner-Friendly**
1. **FastAPI Tutorial**: https://fastapi.tiangolo.com/tutorial/
2. **Hugging Face Course**: https://huggingface.co/course
3. **Scikit-learn Tutorial**: https://scikit-learn.org/stable/tutorial/

### **Advanced**
1. **ML for Healthcare**: Coursera "AI for Medicine"
2. **Transformer Models**: "Attention is All You Need" paper
3. **Model Deployment**: "Designing Machine Learning Systems" book

---

## **Next Steps**

### **Week 1: Basic ML**
- Set up FastAPI service
- Integrate sentiment analysis
- Test with frontend

### **Week 2: Advanced ML**
- Add cognitive decline prediction
- Implement intent classification
- Add speech-to-text

### **Week 3-4: App Conversion**
- Build Electron desktop app
- Create mobile app with Capacitor
- Test on multiple devices

---

## **Questions? Contact**

- **GitHub Issues**: For bug reports
- **Documentation**: See `ML_INTEGRATION_PLAN.md` for details
- **Stack Overflow**: Tag `neuronest` or `fastapi`

---

**Start with the Quick Setup above, then gradually add more ML features!** 🚀
