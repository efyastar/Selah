from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import requests
import base64
import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

FRONTEND_URL = "https://selah-five-mu.vercel.app"
BACKEND_URL = "https://selah-vx3l.onrender.com"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", FRONTEND_URL],
    allow_methods=["*"],
    allow_headers=["*"],
)

YOUVERSION_APP_KEY = os.getenv("YOUVERSION_APP_KEY")
GLOO_CLIENT_ID = os.getenv("GLOO_CLIENT_ID")
GLOO_CLIENT_SECRET = os.getenv("GLOO_CLIENT_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

def get_gloo_token():
    auth = base64.b64encode(f"{GLOO_CLIENT_ID}:{GLOO_CLIENT_SECRET}".encode()).decode()
    response = requests.post(
        "https://platform.ai.gloo.com/oauth2/token",
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Basic {auth}"
        },
        data={
            "grant_type": "client_credentials",
            "scope": "api/access"
        }
    )
    return response.json().get("access_token")

@app.get("/verse")
def get_verse(day: int = None, book: str = None, chapter: int = 1, start: int = 1, count: int = 1):
    from datetime import datetime

    headers = {
        "X-YVP-App-Key": YOUVERSION_APP_KEY,
        "Accept": "application/json"
    }

    if book:
        if count > 1:
            end = start + count - 1
            passage_id = f"{book}.{chapter}.{start}-{end}"
        else:
            passage_id = f"{book}.{chapter}.{start}"
    else:
        day_of_year = day if day else datetime.now().timetuple().tm_yday
        votd_response = requests.get(
            f"https://api.youversion.com/v1/verse_of_the_days/{day_of_year}",
            headers=headers
        )
        votd_data = votd_response.json()
        passage_id = votd_data.get("passage_id") or votd_data.get("data", [{}])[0].get("passage_id")

    verse_response = requests.get(
        f"https://api.youversion.com/v1/bibles/3034/passages/{passage_id}",
        headers=headers
    )
    return verse_response.json()

@app.get("/reflection")
def get_reflection(event: str = "class"):
    token = get_gloo_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gloo-openai-gpt-5-mini",
        "instructions": "You are a faith-based companion. Given what someone just finished, suggest a short warm one-sentence reflection to pair with Scripture. Under 20 words.",
        "input": [
            {"role": "user", "content": f"I just finished: {event}"}
        ]
    }
    response = requests.post(
        "https://platform.ai.gloo.com/ai/v1/responses",
        headers=headers,
        json=payload
    )
    data = response.json()
    output = data["output"]
    message = next(item for item in output if item["type"] == "message")
    return {"reflection": message["content"][0]["text"]}

@app.get("/auth/login")
def login():
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": f"{BACKEND_URL}/auth/callback",
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/calendar.readonly",
        "access_type": "offline",
        "prompt": "consent"
    }
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    return {"auth_url": auth_url}

@app.get("/auth/callback")
def callback(code: str, state: str = None):
    token_response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": f"{BACKEND_URL}/auth/callback",
            "grant_type": "authorization_code"
        }
    )
    tokens = token_response.json()
    access_token = tokens.get("access_token")
    return RedirectResponse(url=f"{FRONTEND_URL}?token={access_token}")

@app.get("/calendar/check")
def check_calendar(access_token: str):
    from datetime import datetime, timezone, timedelta
    now = datetime.now(timezone.utc)
    five_min_ago = (now - timedelta(minutes=5)).isoformat()
    now_iso = now.isoformat()

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        headers=headers,
        params={
            "maxResults": 5,
            "orderBy": "startTime",
            "singleEvents": True,
            "timeMin": five_min_ago,
            "timeMax": now_iso
        }
    )
    events = response.json().get("items", [])
    for event in events:
        end_time = event.get("end", {}).get("dateTime")
        if end_time:
            end_dt = datetime.fromisoformat(end_time.replace("Z", "+00:00"))
            if five_min_ago <= end_time <= now_iso:
                return {
                    "event_ended": True,
                    "event_name": event.get("summary", "your session")
                }
    return {"event_ended": False}


@app.get("/bibles")
def get_bibles():
    headers = {
        "X-YVP-App-Key": YOUVERSION_APP_KEY,
        "Accept": "application/json"
    }
    response = requests.get(
        "https://api.youversion.com/v1/bibles",
        headers=headers,
        params={"language_ranges[]": "en"}
    )
    return response.json()