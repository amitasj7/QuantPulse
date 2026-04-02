- now i have attach api key, secret key in .env file.
- now you can run this project using docker.
- update all the api's to get data from database.


## Error - 1

 Active connectors:
@quantpulse/worker:dev:   • Forex (ExchangeRate-API): ❌ DISABLED
@quantpulse/worker:dev:   • TwelveData (MCX):         ✅ ACTIVE
@quantpulse/worker:dev:   • AlphaVantage:             ❌ DISABLED

i have already connected them in .env file. 
fix them

## update - 1
- there are 2 .env files. which one is used and which is wrong. update code and delete wrong .env file.
- in ss, why they are showing undefined.

- in second ss, i have uploaded trading view ss. so i want this type of chart in my project.
 - show filter option like - 1 day, 1 week, 1 month, 1 year, 5 year, max
---
in third ss, i have uploaded side bar in right side.
    - it should be clear divided categroy using drop down.
    - i want a watchlist.
    for references, you can take - https://in.tradingview.com/chart/



# All API for data - 
? i want to check all apis that are calling data from third party api. so write it down all apis.

Here are all the third-party APIs from which data is currently being fetched. All of them are integrated within the **Worker (`apps/worker/src/connectors/`)**, and they poll data down to the database automatically.

1. **Twelve Data API (`https://api.twelvedata.com/price`)**
   - **File:** `apps/worker/src/connectors/TwelveDataConnector.ts`
   - **Purpose:** Fetches real-time MCX commodity prices (Gold, Silver, Crude Oil, Aluminium, Copper).
   - **Polling Interval:** Every 60 seconds.

2. **Alpha Vantage API (`https://www.alphavantage.co/query`)**
   - **File:** `apps/worker/src/connectors/AlphaVantageConnector.ts`
   - **Purpose:** Fetches global market proxy data (like US Steel prices).
   - **Polling Interval:** Every 5 minutes.

3. **ExchangeRate-API (`https://v6.exchangerate-api.com/v6/[KEY]/latest/USD`)**
   - **File:** `apps/worker/src/connectors/ForexConnector.ts`
   - **Purpose:** Fetches live USD to INR exchange rates so that Alpha Vantage & Twelve Data inputs can be properly converted into INR before saving.
   - **Polling Interval:** Every 30 minutes.

*(Note: There are also API keys in `.env` for **Angel One** (`BROKER_API_KEY`, etc.), but the broker connector is reserved for future WebSocket integration since it requires TOTP auth flow.)*

4. **NewsAPI (`https://newsapi.org/v2/everything`)**
   - **File:** `apps/worker/src/connectors/NewsAPIConnector.ts`
   - **Purpose:** Fetches commodity-related news articles (gold, silver, crude oil, solar energy, etc.), performs sentiment detection (POSITIVE/NEGATIVE/NEUTRAL), and links articles to specific commodities.
   - **Polling Interval:** Every 30 minutes.

---

# Test All Backend APIs (curl commands)

> Backend runs at `http://localhost:4000`

## Commodities

```bash
# Get all commodities (with latest price snapshot)
curl http://localhost:4000/commodities

# Get commodities filtered by category
curl http://localhost:4000/commodities?category=METAL
curl http://localhost:4000/commodities?category=ENERGY
curl http://localhost:4000/commodities?category=INDUSTRIAL
curl http://localhost:4000/commodities?category=SOLAR

# Get single commodity detail (with 24h high/low)
curl http://localhost:4000/commodities/MCX_GOLD
curl http://localhost:4000/commodities/MCX_SILVER

# Get price history for a commodity
curl http://localhost:4000/commodities/MCX_GOLD/prices
curl "http://localhost:4000/commodities/MCX_GOLD/prices?interval=1h&limit=50"
```

## Solar

```bash
# Get solar supply chain overview
curl http://localhost:4000/solar/supply-chain

# Get solar asset price history
curl http://localhost:4000/solar/POLYSILICON_USD/prices
curl "http://localhost:4000/solar/SOLAR_WAFER/prices?limit=20"
```

## News

```bash
# Get latest news articles
curl http://localhost:4000/news
curl "http://localhost:4000/news?limit=5"

# Get news filtered by commodity
curl "http://localhost:4000/news?commodityId=MCX_GOLD"

# Get news for a specific commodity
curl http://localhost:4000/news/commodity/MCX_GOLD
curl "http://localhost:4000/news/commodity/MCX_SILVER?limit=5"
```

## Forex

```bash
# Get latest USD/INR rate
curl http://localhost:4000/forex/latest
curl "http://localhost:4000/forex/latest?pair=USD_INR"

# Get forex rate history
curl http://localhost:4000/forex/history
curl "http://localhost:4000/forex/history?pair=USD_INR&limit=20"
```

- Gold price is not correct. when i google it is showing    - 10g of 24k gold (99.9%) in Delhi, India is 
1,53,850.00 Indian Rupee
   - in my website it  is showing -- 4,50,089.00


- for help, you can read follwing angel documentation :
   https://smartapi.angelbroking.com/docs/

- implement all the features of angel one api in my project.
- tell me what is need from my side?


## update - 2:
- the usd to inr conversion is not correct for current time.
- when i google it - 1 United States Dollar equals
92.90 Indian Rupee
2 Apr, 5:35 pm UTC

- so you have to also show date & timing. for which date & timing this conversion is correct.
- when i hover on usd/inr box, a hover card should be appeear and show all details.