import requests
import json

url = "http://127.0.0.1:5000/api/predict"
payload = {
    "features": {
        "Age": 25,
        "Gender": 0,
        "Daily_Screen_Hours": 8,
        "Break_Frequency_Per_Hour": 2,
        "Blue_Light_Filter_Used": 1,
        "Eye_Dryness_Level": 3,
        "Eye_Pain_Level": 2,
        "Headache_Frequency_Per_Week": 1,
        "Blurred_Vision": 0,
        "Sleep_Hours": 7,
        "Eye_Checkup_Last_Year": 1
    }
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
