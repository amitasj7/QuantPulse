## Error - 1: 
 => ERROR [worker base 11/11] RUN pnpm --filter @quantpulse/worker build                        4.1s 
 => CACHED [backend base  4/14] COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./         0.0s 
 => CACHED [backend base  5/14] COPY apps/backend/package.json ./apps/backend/                  0.0s 
 => CACHED [backend base  6/14] COPY packages/shared/package.json ./packages/shared/            0.0s 
 => CACHED [backend base  7/14] COPY packages/database/package.json ./packages/database/        0.0s 
 => CANCELED [backend base  8/14] RUN pnpm install --frozen-lockfile --filter @quantpulse/back  1.4s 
------
 > [worker base 11/11] RUN pnpm --filter @quantpulse/worker build:
3.390
3.390 > @quantpulse/worker@1.0.0 build /app/apps/worker
3.390 > tsc
3.390
3.584 node:internal/modules/cjs/loader:1210
3.584   throw err;
3.584   ^
3.584
3.584 Error: Cannot find module '/app/apps/worker/node_modules/typescript/bin/tsc'
3.584     at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
3.584     at Module._load (node:internal/modules/cjs/loader:1038:27)
3.584     at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:164:12)     
3.584     at node:internal/main/run_main_module:28:49 {
3.584   code: 'MODULE_NOT_FOUND',
3.584   requireStack: []
3.584 }
3.584
3.584 Node.js v20.20.2
3.666 /app/apps/worker:
3.666  ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @quantpulse/worker@1.0.0 build: `tsc`
3.666 Exit status 1
------
Dockerfile:22

--------------------

  20 |

  21 |     # Build

  22 | >>> RUN pnpm --filter @quantpulse/worker build

  23 |

  24 |     # Production stage

--------------------

target worker: failed to solve: process "/bin/sh -c pnpm --filter @quantpulse/worker build" did not complete successfully: exit code: 1



View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/wwsdmf62y434l8p8dcn04ls6c

