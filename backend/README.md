# 🚀 TRAVIS – Transformer-Based Help Desk for Visually Impaired Bank Agents

## 📌 Overview

**TRAVIS** is an AI-powered banking assistant designed to help visually impaired bank agents handle customer queries efficiently.
It integrates **Transformer-based NLP models**, **real-time communication**, and **voice-ready architecture** to deliver intelligent responses.

---

## ✨ Features

* 🤖 AI-powered query handling using Hugging Face Transformers
* 🔊 Voice-assisted interaction support (extensible)
* 💬 Real-time communication using WebSockets
* 🧑‍💼 Agent dashboard for query monitoring
* 🔐 User authentication (Login & Registration APIs)
* ⚡ Lightweight architecture (no local model storage)

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS

### Backend

* FastAPI
* WebSockets
* Pandas

### AI / ML

* Hugging Face Transformers
* DistilBERT (Question Answering Pipeline)

---

## 🧠 How It Works

1. User sends a query
2. Backend receives the query via FastAPI
3. Hugging Face QA model processes the query
4. Context is built dynamically from response dataset
5. Model extracts the most relevant answer
6. Response is sent back to user / agent dashboard

---

## 📂 Project Structure

```
vista/
 ├── backend/
 │   ├── main.py
 │   ├── agent/
 │   └── Responses_new.csv
 ├── frontend/
 ├── middleware/
 └── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Sahiti7/TRAVIS.git
cd TRAVIS
```

### 2️⃣ Setup Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install fastapi uvicorn transformers torch pandas
```

### 3️⃣ Run Backend

```bash
uvicorn main:app --reload
```

---

## 🌐 API Endpoints

| Method | Endpoint                  | Description       |
| ------ | ------------------------- | ----------------- |
| GET    | `/`                       | Health check      |
| POST   | `/register`               | Register user     |
| POST   | `/login`                  | Login user        |
| POST   | `/account-details/verify` | Verify account    |
| POST   | `/query`                  | AI query response |

---

## 🧪 Testing

Open:

```
http://127.0.0.1:8000/docs
```

Use `/query` endpoint:

```json
{
  "question": "How to check my account balance?"
}
```

---

## 💡 Key Highlights

* 🚫 No large model files stored locally
* ⚡ Models loaded dynamically using Hugging Face
* 📉 Reduced repository size drastically
* 🧩 Modular and scalable architecture

---

## 🏗️ System Architecture

![TRAVIS Architecture](assets/architecture.png)

### 🔍 Explanation
- Customer sends query via text or voice
- Web Speech API converts speech to text
- Visually Impaired (VI) Agent receives query
- Transformer model (DistilBERT) processes the query
- Model generates response
- Response is converted to speech (TTS)
- Customer receives output
- If not satisfied, query is escalated to human agent

## 🔮 Future Enhancements

* 🎙️ Speech-to-text & text-to-speech integration
* 📊 Advanced intent classification
* 🌍 Multi-language support
* 🏦 Real-time banking API integration

---

## 👩‍💻 Author

**Laxmi Sahiti Kurella**

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
