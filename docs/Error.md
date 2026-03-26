## Error - 1

@quantpulse/worker:dev: (Use `node --trace-warnings ...` to show where the warning was created)
@quantpulse/worker:dev: ✅ Connected to TimescaleDB
@quantpulse/worker:dev: [MCXConnector] Starting live connection simulator...
@quantpulse/worker:dev: [SolarConnector] Starting polling for Global Solar APIs...
 ERROR  @quantpulse/frontend#dev: command (C:\Users\amits\Desktop\QuantPulse\apps\frontend) C:\Users\amits\AppData\Roaming\npm\pnpm.cmd run dev exited (1)

 Tasks:    0 successful, 3 total
Cached:    0 cached, 3 total
  Time:    5.09s 
Failed:    @quantpulse/frontend#dev

 ERROR  run failed: command  exited (1)
 ELIFECYCLE  Command failed with exit code 1.


## Error - 2
Console AxiosError



Network Error
src/lib/api.ts (11:20) @ async getCommodities


   9 |
  10 | export const getCommodities = async () => {
> 11 |   const { data } = await api.get('/commodities');
     |                    ^
  12 |   return data;
  13 | };
  14 |

Console AxiosError



Network Error
src/lib/api.ts (21:20) @ async getPriceHistory


  19 |
  20 | export const getPriceHistory = async (assetId: string, limit = 100): Promise<NormalizedTic...
> 21 |   const { data } = await api.get(`/commodities/${assetId}/prices`, {
     |                    ^
  22 |     params: { limit },
  23 |   });
  24 |   return data;
Call Stack
4

Show 2 ignore-listed frame(s)
async getPriceHistory
src/lib/api.ts (21:20)
async Object.fetchHistory
src/stores/useMarketStore.ts (80:23)