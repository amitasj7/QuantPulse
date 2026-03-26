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


## Error - 3
e_modules\source-map-support\source-map-support.js:568:25)
@quantpulse/worker:dev:     at Module.m._compile (C:\temp\ts-node-dev-hook-8808221270781258.js:111:37)
@quantpulse/worker:dev:     at node:internal/modules/cjs/loader:1936:10
@quantpulse/worker:dev:     at require.extensions..jsx.require.extensions..js (C:\temp\ts-node-dev-hook-8808221270781258.js:114:20)
@quantpulse/worker:dev:     at Object.nodeDevHook [as .js] (C:\Users\amits\Desktop\Ramver\QuantPulse\node_modules\.pnpm\ts-node-dev@2.0.0_@types+node@22.19.15_typescript@5.9.3\node_modules\ts-node-dev\lib\hook.js:63:13)
@quantpulse/worker:dev:     at Module.load (node:internal/modules/cjs/loader:1525:32)
@quantpulse/worker:dev: (node:25332) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///C:/Users/amits/Desktop/Ramver/QuantPulse/packages/database/dist/client.js is not specified and it doesn't parse as CommonJS.
@quantpulse/worker:dev: [ERROR] 21:13:47 SyntaxError: The requested module '@prisma/client' does not provide an export named 'PrismaClient'
@quantpulse/worker:dev: Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
@quantpulse/worker:dev: To eliminate this warning, add "type": "module" to C:\Users\amits\Desktop\Ramver\QuantPulse\packages\database\package.json.
@quantpulse/worker:dev: (Use `node --trace-warnings ...` to show where the warning was created)
@quantpulse/frontend:dev: 
@quantpulse/frontend:dev:  GET / 200 in 2.0s (next.js: 628ms, application-code: 1377ms)
@quantpulse/frontend:dev: [browser] Failed to fetch initial market data AxiosError: Network Error
@quantpulse/frontend:dev:     at async getCommodities (src/lib/api.ts:11:20)
@quantpulse/frontend:dev:     at async fetchInitialData (src/stores/useMarketStore.ts:39:30)
@quantpulse/frontend:dev:    9 |
@quantpulse/frontend:dev:   10 | export const getCommodities = async () => {
@quantpulse/frontend:dev: > 11 |   const { data } = await api.get('/commodities');
@quantpulse/frontend:dev:      |                    ^
@quantpulse/frontend:dev:   12 |   return data;
@quantpulse/frontend:dev:   13 | };
@quantpulse/frontend:dev:   14 | (src/stores/useMarketStore.ts:73:15)
@quantpulse/frontend:dev: [browser] Failed to fetch historical data AxiosError: Network Error
@quantpulse/frontend:dev:     at async getPriceHistory (src/lib/api.ts:21:20)
@quantpulse/frontend:dev:     at async Object.fetchHistory (src/stores/useMarketStore.ts:80:23)
@quantpulse/frontend:dev:   19 |
@quantpulse/frontend:dev:   20 | export const getPriceHistory = async (assetId: string, limit = 100): Promise<NormalizedTic...
@quantpulse/frontend:dev: > 21 |   const { data } = await api.get(`/commodities/${assetId}/prices`, {
@quantpulse/frontend:dev:      |                    ^
@quantpulse/frontend:dev:   22 |     params: { limit },
@quantpulse/frontend:dev:   23 |   });
@quantpulse/frontend:dev:   24 |   return data; (src/stores/useMarketStore.ts:88:15)
@quantpulse/backend:dev: src/modules/commodities/commodities.service.ts:9:24 - error TS2339: Property 'commodity' does not exist on type 'PrismaService'.
@quantpulse/backend:dev: 
@quantpulse/backend:dev: 9     return this.prisma.commodity.findMany({
@quantpulse/backend:dev:                          ~~~~~~~~~
@quantpulse/backend:dev:
@quantpulse/backend:dev: src/modules/commodities/commodities.service.ts:15:41 - error TS2339: Property 'commodity' does not exist on type 'PrismaService'.
@quantpulse/backend:dev:
@quantpulse/backend:dev: 15     const commodity = await this.prisma.commodity.findUnique({
@quantpulse/backend:dev:                                            ~~~~~~~~~
@quantpulse/backend:dev:
@quantpulse/backend:dev: src/modules/commodities/commodities.service.ts:39:39 - error TS2339: Property 'priceHistory' does not exist on type 'PrismaService'.
@quantpulse/backend:dev:
@quantpulse/backend:dev: 39     const history = await this.prisma.priceHistory.findMany({
@quantpulse/backend:dev:                                          ~~~~~~~~~~~~
@quantpulse/backend:dev:
@quantpulse/backend:dev: src/modules/prisma/prisma.service.ts:7:16 - error TS2339: Property '$connect' does not exist on type 'PrismaService'.
@quantpulse/backend:dev:
@quantpulse/backend:dev: 7     await this.$connect();
@quantpulse/backend:dev:                  ~~~~~~~~
@quantpulse/backend:dev:
@quantpulse/backend:dev: src/modules/prisma/prisma.service.ts:11:16 - error TS2339: Property '$disconnect' does not exist on type 'PrismaService'.
@quantpulse/backend:dev:
@quantpulse/backend:dev: 11     await this.$disconnect();
@quantpulse/backend:dev:                   ~~~~~~~~~~~
@quantpulse/backend:dev:
@quantpulse/backend:dev: src/modules/solar/solar.service.ts:9:24 - error TS2339: Property 'commodity' does not exist on type 'PrismaService'.
@quantpulse/backend:dev:
@quantpulse/backend:dev: 9     return this.prisma.commodity.findMany({
@quantpulse/backend:dev:                          ~~~~~~~~~
@quantpulse/backend:dev: