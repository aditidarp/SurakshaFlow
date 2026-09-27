import requests
import pandas as pd

API_KEY = "PASTE_YOUR_API_KEY_HERE"

cities = [
 "Delhi","Mumbai","Pune","Nagpur","Chhatrapati Sambhajinagar",
 "Bangalore","Chennai","Hyderabad",
 "Kolkata","Patna","Lucknow",
 "Jaipur","Bhopal","Indore",
 "Ahmedabad","Surat",
 "Thiruvananthapuram","Kochi",
 "Guwahati","Shillong"
]

rows = []

for city in cities:
    url = f"http://api.weatherapi.com/v1/current.json?key={API_KEY}&q={city}"
    data = requests.get(url).json()

    rows.append({
        "city": city,
        "temperature": data['current']['temp_c'],
        "humidity": data['current']['humidity'],
        "wind": data['current']['wind_kph'],
        "pressure": data['current']['pressure_mb'],
        "rainfall": data['current']['precip_mm']
    })

df = pd.DataFrame(rows)
df.to_csv("all_india_weather.csv", index=False)

print("✅ All India weather dataset created successfully")
