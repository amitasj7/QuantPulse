## Update - 1
- create a drawer or sidebar like
  - that can be hide and show using three lines icon in top left corner
  - and also using esc key
  - and also using mouse click outside the drawer

## update - 2
- create a three toggle button for light dark and system mode.
- position, in sidebar bottom. upside of setting button.
- it mark with red border area in ss.


use these 3 button functionalities like - 
when i press "Light mode" button then it will change theme to light mode.
when i press "Dark mode" button then it will change theme to dark mode.
when i press "System default" button then it will change theme to system default mode.

and also when i refresh the page then it will remember the theme.

```json
{
  "designSystem": {
    "themeMapping": {
      "lightMode": {
        "intent": "High readability, print-like clarity, professional trust.",
        "colors": {
          "background": "#FFFFFF (Pure White) or #F8FAFC (Slate 50)",
          "surface": "#F1F5F9 (Slate 100) - For cards and containers",
          "textPrimary": "#0F172A (Slate 900) - Maximum contrast",
          "textSecondary": "#475569 (Slate 600) - For labels and metadata",
          "border": "#E2E8F0 (Slate 200) - Subtle separation"
        },
        "shadows": {
          "card": "Soft, blurred shadows (e.g., shadow-sm) to create depth on white."
        }
      },
      "darkMode": {
        "intent": "Reduced eye strain, high-density data focus, 'Terminal' aesthetic.",
        "colors": {
          "background": "#0B0E11 (Deep Charcoal) or #020617 (Slate 950)",
          "surface": "#1E2329 (Rich Black) - Elevates cards from background",
          "textPrimary": "#EAECEF (Cool Grey) - Soft white to prevent 'glow' bleed",
          "textSecondary": "#94A3B8 (Slate 400) - For dimming less important info",
          "border": "#334155 (Slate 700) - Defining edges without high contrast"
        },
        "shadows": {
          "card": "No shadows; use 'Borders' or 'Lighter Surface Colors' to show depth."
        }
      },
      "sharedLogic": {
        "bullish": "#00C087 (Emerald) - Stays consistent, but saturation may vary.",
        "bearish": "#FF3B30 (Rose/Red) - Must remain highly visible on both."
      }
    }
  }
}
```


## Update - 3

working url : http://localhost:3000/
apart from this upper url, there is no more url that show ui, all are showing error.
so fix them.
design layout and ui.



## update - 4
- so in ss, you can see red area and this is highlight  area 1. in this all stock are scrolling.
  - problem: the price name is not showing.

- i want drag and drop functionality from first arrow to second and second to third.
- i want to change price graph using this drag and drop feature. so import it.


- when i referesh page then it is showing price. update it i want when i click back button, when i change route etc. this functionality should be also avaialbe.


### Error - 1
Encountered a script tag while rendering React component. Scripts inside React components are never executed when rendering on the client. Consider using template tag instead (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template).
src\app\layout.tsx (33:9) @ RootLayout


  31 |     >
  32 |       <head>
> 33 |         <script
     |         ^
  34 |           dangerouslySetInnerHTML={{
  35 |             __html: `
  36 |               try {
Call Stack
14

Show 12 ignore-listed frame(s)
script
<anonymous>
RootLayout
src\app\layout.tsx (33:9)

useState is not defined
Call Stack
13

Show 12 ignore-listed frame(s)
Dashboard


## update - 5
when i hover of ticker tap this running strip, it should be stop.

- remove  this card form ui screen.
- i want ui something like 2nd screenshot images.
for refrences - https://in.tradingview.com/chart/ 

## update - 6
- Trading view graph is not showing. you can see image.
- fix it. verify it by yourself after open browser.

- in upload image, left drawer is inside of moving left drawer. update: when i open left drawer, it should be top most element of screen.
- right sidebar (watchlist section) width is fix. update: when i drag in left sidebar, it should be expand and when i drag out, it should be shrink.


- watchlist + icon is not wroking 
- serach box in not working.

## update - 8
- in upload image, you have to see 1, 2 and 3.
- you have also create this type of dashboard that show all things.
- you have to make it in working mode button, functionality etc.

- Candles aren't showing (greeen and red candles). please check and fix them.
- for options 3: you have to show timing in bottom right corner.

- in bottom - left side, these is a date icon, when i click on this icon then image 2 show.
  - you have to also implement this functionality to select custom date range.

## update - 9
- in upload images, news showing for a individual stock.
- i want to show news for a individual stock that currently selected in chart.

ex - suppose first stock is selected gold in chart then news will show related to gold.
then if i select silver in chart then news will show related to silver. 

- max 10 news should be shown in news section.
- there will be 2 tag 
  - first: stock name like silver, gold etc.
  - second: positive, negative or neutral.


## update - 
Request failed with status code 404
src/lib/api.ts (26:20) @ async getSolarMetrics


  24 |
  25 | export const getSolarMetrics = async () => {
> 26 |   const { data } = await api.get('/solar/supply-chain');
     |                    ^
  27 |   return data;
  28 | };
  29 |
Call Stack
5

Show 3 ignore-listed frame(s)
async getSolarMetrics
src/lib/api.ts (26:20)

Request failed with status code 404
src/lib/api.ts (31:20) @ async getPriceHistory


  29 |
  30 | export const getPriceHistory = async (assetId: string, limit = 100, interval?: string): Pr...
> 31 |   const { data } = await api.get(`/commodities/${assetId}/prices`, {
     |                    ^
  32 |     params: { limit, ...(interval ? { interval } : {}) },
  33 |   });
  34 |   return data;
Call Stack
5

Show 3 ignore-listed frame(s)
async getPriceHistory
src/lib/api.ts (31:20)