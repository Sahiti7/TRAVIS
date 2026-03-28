from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from json import loads, dumps
from transformers import pipeline
import pandas as pd
import os

app = FastAPI()

# -----------------------------
# Root check
# -----------------------------
@app.get("/")
def read_root():
    return {"message": "TRAVIS backend running 🚀"}

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Agent dashboard static
# -----------------------------
app.mount(
    "/agent",
    StaticFiles(directory=os.path.join(os.path.dirname(__file__), "agent")),
    name="agent"
)

# -----------------------------
# Load responses CSV
# -----------------------------
response_df = pd.read_csv("Responses_new.csv")

intent_list = response_df['category'].unique().tolist()

# -----------------------------
# ✅ Load Hugging Face QA model
# -----------------------------
qa_pipeline = pipeline(
    "question-answering",
    model="distilbert-base-cased-distilled-squad"
)

# -----------------------------
# WebSockets
# -----------------------------
agent_connection: WebSocket = None
user_connection: WebSocket = None

@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    global agent_connection, user_connection

    await websocket.accept()
    client_type = websocket.query_params.get("client_type")

    if client_type == "agent":
        agent_connection = websocket
    elif client_type == "user":
        user_connection = websocket
    else:
        await websocket.close(code=1008)
        return

    try:
        while True:
            raw = await websocket.receive_text()
            data = loads(raw)

            if data["type"] == "agent_approve" and user_connection:
                await user_connection.send_text(dumps({
                    "type": "model_response",
                    "text": data.get("text", "")
                }))

    except WebSocketDisconnect:
        if client_type == "agent":
            agent_connection = None
        elif client_type == "user":
            user_connection = None

# =====================================================
# ✅ REGISTER API
# =====================================================
@app.post("/register")
async def register_user(payload: dict):
    name = payload.get("name")
    email = payload.get("email")
    phone = payload.get("phone")
    password = payload.get("password")
    confirm_password = payload.get("confirmPassword")

    if not all([name, email, phone, password, confirm_password]):
        raise HTTPException(status_code=400, detail="All fields are required")

    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    print(f"✅ Registered: {email}")

    return {"success": True, "message": "Registration successful"}

# =====================================================
# 🔐 LOGIN API
# =====================================================
@app.post("/login")
async def login_user(payload: dict):
    email = payload.get("email")
    password = payload.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    if len(password) < 4:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    print(f"✅ Login: {email}")

    return {"success": True, "message": "Login successful"}

# =====================================================
# 🏦 ACCOUNT VERIFICATION API
# =====================================================
@app.post("/account-details/verify")
async def verify_account(payload: dict):
    name = payload.get("name")
    account_number = payload.get("accountNumber")
    password = payload.get("password")

    if not all([name, account_number, password]):
        raise HTTPException(status_code=400, detail="All fields required")

    if len(str(account_number)) < 6:
        return {"success": False, "message": "Invalid account number"}

    print(f"✅ Account verified for {name}")

    return {"success": True, "message": "Account verified"}

# =====================================================
# 🤖 QUERY API (Hugging Face QA)
# =====================================================
@app.post("/query")
async def query(payload: dict):
    question = payload.get("question") or payload.get("text")
    print("📩 Question:", question)

    if not question:
        return {"response": "⚠️ No query received."}

    try:
        # Use a simple context (can be improved later)
        context = " ".join(response_df["Response"].tolist())

        result = qa_pipeline(
            question=question,
            context=context
        )

        response_text = result.get("answer", "I'm not sure. Let me connect you to an agent.")

        # Send to agent dashboard
        if agent_connection:
            await agent_connection.send_text(dumps({
                "type": "query",
                "query": question,
                "model_response": response_text
            }))

        return {"response": response_text}

    except Exception as e:
        print("❌ Error:", e)
        return {"response": "⚠️ Error generating response."}