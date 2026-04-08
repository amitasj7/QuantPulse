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

## Error - 2:
amits@NeoCoder MINGW64 ~/Desktop/Ramver/QuantPulse (develop)
$ docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.prod.yml up --buil
d -d
time="2026-04-06T18:52:30+05:30" level=warning msg="C:\\Users\\amits\\Desktop\\Ramver\\QuantPulse\\infra\\docker\\docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
time="2026-04-06T18:52:30+05:30" level=warning msg="The \"DB_PASSWORD\" variable is not set. Defaulting to a blank string."
time="2026-04-06T18:52:30+05:30" level=warning msg="The \"REDIS_PASSWORD\" variable is not set. Defaulting to a blank string."
time="2026-04-06T18:52:30+05:30" level=warning msg="C:\\Users\\amits\\Desktop\\Ramver\\QuantPulse\\infra\\docker\\docker-compose.prod.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
[+] Building 53.2s (27/50)
 => [internal] load local bake definitions                                                      0.0s
 => => reading from stdin 1.51kB                                                                0.0s
 => [backend internal] load build definition from Dockerfile                                    0.1s
 => => transferring dockerfile: 1.15kB                                                          0.0s 
 => [worker internal] load build definition from Dockerfile                                     0.1s 
 => => transferring dockerfile: 1.17kB                                                          0.0s 
 => [frontend internal] load build definition from Dockerfile                                   0.1s 
 => => transferring dockerfile: 979B                                                            0.0s 
 => [backend internal] load metadata for docker.io/library/node:20-alpine                       1.9s 
 => [backend internal] load .dockerignore                                                       0.0s
 => => transferring context: 107B                                                               0.0s 
 => [frontend base  1/11] FROM docker.io/library/node:20-alpine@sha256:f598378b5240225e6beab68  0.0s 
 => => resolve docker.io/library/node:20-alpine@sha256:f598378b5240225e6beab68fa9f356db1fb8efe  0.0s 
 => CANCELED [frontend internal] load build context                                            50.4s 
 => => transferring context: 504.48MB                                                          50.4s 
 => [backend internal] load build context                                                       5.1s 
 => => transferring context: 22.54MB                                                            5.0s
 => [worker internal] load build context                                                        3.7s 
 => => transferring context: 21.62MB                                                            3.7s
 => CACHED [backend base  2/11] WORKDIR /app                                                    0.0s
 => CACHED [backend base  3/11] RUN corepack enable && corepack prepare pnpm@latest --activate  0.0s 
 => CACHED [worker base  4/13] COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./          0.0s 
 => CACHED [worker base  5/13] COPY apps/worker/package.json ./apps/worker/                     0.0s 
 => CACHED [worker base  6/13] COPY packages/shared/package.json ./packages/shared/             0.0s 
 => [worker base  7/13] COPY packages/database/package.json ./packages/database/                0.4s 
 => [worker base  8/13] RUN pnpm install --frozen-lockfile --filter @quantpulse/worker...      40.4s 
 => CACHED [backend base  4/14] COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./         0.0s 
 => CACHED [backend base  5/14] COPY apps/backend/package.json ./apps/backend/                  0.0s 
 => CACHED [backend base  6/14] COPY packages/shared/package.json ./packages/shared/            0.0s 
 => CACHED [backend base  7/14] COPY packages/database/package.json ./packages/database/        0.0s 
 => CANCELED [backend base  8/14] RUN pnpm install --frozen-lockfile --filter @quantpulse/bac  45.4s 
 => [worker base  9/13] COPY apps/worker/ ./apps/worker/                                        0.8s 
 => [worker base 10/13] COPY packages/shared/ ./packages/shared/                                0.2s 
 => [worker base 11/13] COPY packages/database/ ./packages/database/                            0.4s 
 => [worker base 12/13] COPY tsconfig.base.json ./                                              0.1s 
 => ERROR [worker base 13/13] RUN pnpm --filter @quantpulse/worker build                        4.2s 
------
 > [worker base 13/13] RUN pnpm --filter @quantpulse/worker build:
3.627
3.627 > @quantpulse/worker@1.0.0 build /app/apps/worker
3.627 > tsc
3.627
3.813 node:internal/modules/cjs/loader:1210
3.813   throw err;
3.813   ^
3.813
3.813 Error: Cannot find module '/app/apps/worker/node_modules/typescript/bin/tsc'
3.813     at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
3.813     at Module._load (node:internal/modules/cjs/loader:1038:27)
3.813     at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:164:12)     
3.813     at node:internal/main/run_main_module:28:49 {
3.813   code: 'MODULE_NOT_FOUND',
3.813   requireStack: []
3.813 }
3.813
3.813 Node.js v20.20.2
3.911 /app/apps/worker:
3.911  ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @quantpulse/worker@1.0.0 build: `tsc`
3.911 Exit status 1
------
Dockerfile:27

--------------------

  25 |

  26 |     # Build

  27 | >>> RUN pnpm --filter @quantpulse/worker build

  28 |

  29 |     # Production stage — only ship compiled JS

--------------------

target worker: failed to solve: process "/bin/sh -c pnpm --filter @quantpulse/worker build" did not complete successfully: exit code: 1



View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/0amj89es3g6a6oweoaupt9pzc

```

## Error - 3
=> ERROR [worker base 14/15] RUN pnpm --filter @quantpulse/database build                      4.1s 
------
 > [worker base 14/15] RUN pnpm --filter @quantpulse/database build:
1.801
1.801 > @quantpulse/database@1.0.0 build /app/packages/database
1.801 > tsc
1.801
3.842 src/client.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PrismaClient'.
3.843 src/index.ts(1,10): error TS2305: Module '"@prisma/client"' has no exported member 'PrismaClient'.
3.892 /app/packages/database:
3.892  ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @quantpulse/database@1.0.0 build: `tsc`
3.892 Exit status 2
------
Dockerfile:28

--------------------

  26 |     # Build dependency packages first (shared types + database client)

  27 |     RUN pnpm --filter @quantpulse/shared build

  28 | >>> RUN pnpm --filter @quantpulse/database build

  29 |

  30 |     # Build the worker

--------------------

target worker: failed to solve: process "/bin/sh -c pnpm --filter @quantpulse/database build" did not complete successfully: exit code: 2



View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/xbfoz3u673133mioo8qyzhniv



## error - 4
Gemini said
Because you are using multiple -f flags and a complex path (infra/docker/), the most likely reason for the error is a path mismatch or a missing file on the EC2 instance.

When you run docker compose with -f, it looks for those files relative to where your terminal is currently sitting.

🔍 3 Common Causes for this Error
1. The "Wrong Directory" Error
If you are already inside the infra/docker/ folder, the command will fail because it's looking for infra/docker/infra/docker/....

Fix: Ensure you are at the Root of your project (where the infra folder is visible). Run ls to check.

2. The "Relative Path" Context
Docker Compose uses the location of the first -f file as the "Base Directory" for things like build: . or volumes.

Fix: If your Dockerfile is in a different folder, you might need to specify the context explicitly in your YAML, or run the command from the root.

3. Missing .env file
If your docker-compose.prod.yml uses variables like ${DB_PASSWORD}, but you haven't created a .env file in the same folder where you're running the command, Docker will throw an error.

🛠️ The "Safety-First" Way to Run It
To avoid path confusion, try using the absolute path or cd into the directory first:

Option A: Run from the Project Root (Recommended)

Bash
# Check if files exist first
ls infra/docker/docker-compose.yml
ls infra/docker/docker-compose.prod.yml

# Then run
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.prod.yml up --build -d
Option B: If you get a "Service Not Found" error
Sometimes Docker gets confused when merging files. Try combining them into one temporary file to see the actual error:

Bash
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.prod.yml config
The config command won't run the containers—it will just show you the "Merged" version of your files. If there is a syntax error, it will point to exactly which line is broken.

🚀 What is the exact error message?
If you copy and paste the exact error text (the line that says ERROR: or no such file or directory), I can tell you exactly which character is wrong!

Is it saying "File not found" or "Top-level object 'services' is not an object"?



## error - 5
amits@NeoCoder MINGW64 ~/Desktop/Ramver/QuantPulse (testing/worker-1)
$ bun run build
$ turbo run build
╭──────────────────────────────────────────────────────────────────────────╮
│                                                                          │
│                    Update available v2.8.20 ≫ v2.9.4                     │
│    Changelog: https://github.com/vercel/turborepo/releases/tag/v2.9.4    │
│          Run "pnpm dlx @turbo/codemod@latest update" to update           │
│                                                                          │
│          Follow @turborepo for updates: https://x.com/turborepo          │
╰──────────────────────────────────────────────────────────────────────────╯
• turbo 2.8.20

   • Packages in scope: @quantpulse/backend, @quantpulse/database, @quantpulse/frontend, @quantpulse/shared, @quantpulse/worker
   • Running build in 5 packages
   • Remote caching disabled

@quantpulse/shared:build: cache miss, executing a8fe1466cd662452
@quantpulse/database:build: cache miss, executing 542a79dd0a35ea22
@quantpulse/database:build: 
@quantpulse/database:build: > @quantpulse/database@1.0.0 build C:\Users\amits\Desktop\Ramver\QuantPulse\packages\database
@quantpulse/database:build: > tsc
@quantpulse/database:build:
@quantpulse/shared:build:
@quantpulse/shared:build: > @quantpulse/shared@1.0.0 build C:\Users\amits\Desktop\Ramver\QuantPulse\packages\shared
@quantpulse/shared:build: > tsc
@quantpulse/shared:build:
@quantpulse/frontend:build: cache miss, executing 14945ba5b8253cb0
@quantpulse/worker:build: cache miss, executing ea467a2ac51218ce
@quantpulse/backend:build: cache miss, executing 55be9fed4df7a5d1
@quantpulse/frontend:build: 
@quantpulse/frontend:build: > @quantpulse/frontend@1.0.0 build C:\Users\amits\Desktop\Ramver\QuantPulse\apps\frontend
@quantpulse/frontend:build: > next build
@quantpulse/frontend:build:
@quantpulse/worker:build: 
@quantpulse/worker:build: > @quantpulse/worker@1.0.0 build C:\Users\amits\Desktop\Ramver\QuantPulse\apps\worker
@quantpulse/worker:build: > tsc
@quantpulse/worker:build:
@quantpulse/backend:build:
@quantpulse/backend:build: > @quantpulse/backend@1.0.0 build C:\Users\amits\Desktop\Ramver\QuantPulse\apps\backend
@quantpulse/backend:build: > nest build
@quantpulse/backend:build:
@quantpulse/frontend:build: ▲ Next.js 16.2.1 (Turbopack)
@quantpulse/frontend:build: 
@quantpulse/frontend:build:   Creating an optimized production build ...
@quantpulse/worker:build: src/index.ts(1,30): error TS6059: File 'C:/Users/amits/Desktop/Ramver/QuantPulse/packages/database/src/index.ts' is not under 'rootDir' 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src'. 'rootDir' is expected to contain all source files.  
@quantpulse/worker:build: src/index.ts(2,32): error TS6059: File 'C:/Users/amits/Desktop/Ramver/QuantPulse/packages/shared/src/index.ts' is not under 'rootDir' 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src'. 'rootDir' is expected to contain all source files.    
@quantpulse/worker:build:   The file is in the program because:
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/index.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/connectors/TwelveDataConnector.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/connectors/AlphaVantageConnector.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/connectors/AngelOneConnector.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/normalizer/DataNormalizer.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/connectors/MCXConnector.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/connectors/SolarConnector.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/normalizer/data-normalizer.ts'
@quantpulse/worker:build: ../../packages/database/src/index.ts(2,24): error TS6059: File 'C:/Users/amits/Desktop/Ramver/QuantPulse/packages/database/src/client.ts' is not under 'rootDir' 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src'. 'rootDir' is expected to contain all source files.
@quantpulse/worker:build: ../../packages/shared/src/index.ts(1,15): error TS6059: File 'C:/Users/amits/Desktop/Ramver/QuantPulse/packages/shared/src/types/index.ts' is not under 'rootDir' 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src'. 'rootDir' is expected to contain all source files.
@quantpulse/worker:build:  ELIFECYCLE  Command failed with exit code 2.
 ERROR  @quantpulse/worker#build: command (C:\Users\amits\Desktop\Ramver\QuantPulse\apps\worker) C:\Users\amits\AppData\Roaming\npm\pnpm.cmd run build exited (2)

 Tasks:    2 successful, 5 total
Cached:    0 cached, 5 total
  Time:    7.372s
Failed:    @quantpulse/worker#build

 ERROR  run failed: command  exited (2)

amits@NeoCoder MINGW64 ~/Desktop/Ramver/QuantPulse (testing/worker-1)
$ npm run build

> quantpulse@1.0.0 build
> turbo run build

╭──────────────────────────────────────────────────────────────────────────╮
│                                                                          │
│                    Update available v2.8.20 ≫ v2.9.4                     │
│    Changelog: https://github.com/vercel/turborepo/releases/tag/v2.9.4    │
│          Run "pnpm dlx @turbo/codemod@latest update" to update           │
│                                                                          │
│          Follow @turborepo for updates: https://x.com/turborepo          │
╰──────────────────────────────────────────────────────────────────────────╯
• turbo 2.8.20

   • Packages in scope: @quantpulse/backend, @quantpulse/database, @quantpulse/frontend, @quantpulse/shared, @quantpulse/worker
   • Running build in 5 packages
   • Remote caching disabled

@quantpulse/shared:build: cache miss, executing f8255ee74180a8ca
@quantpulse/database:build: cache miss, executing 05ea4141b5887a2f
@quantpulse/shared:build: 
@quantpulse/shared:build: > @quantpulse/shared@1.0.0 build C:\Users\amits\Desktop\Ramver\QuantPulse\packages\shared
@quantpulse/shared:build: > tsc
@quantpulse/shared:build:
@quantpulse/database:build:
@quantpulse/database:build: > @quantpulse/database@1.0.0 build C:\Users\amits\Desktop\Ramver\QuantPulse\packages\database
@quantpulse/database:build: > tsc
@quantpulse/database:build:
@quantpulse/frontend:build: cache miss, executing 70976a3c0ec1a575
@quantpulse/frontend:build: 
@quantpulse/frontend:build: > @quantpulse/frontend@1.0.0 build C:\Users\amits\Desktop\Ramver\QuantPulse\apps\frontend
@quantpulse/frontend:build: > next build
@quantpulse/frontend:build:
@quantpulse/backend:build: cache miss, executing a360144e8e7296af
@quantpulse/worker:build: cache miss, executing 7694a51e354a9b62
@quantpulse/worker:build: 
@quantpulse/worker:build: > @quantpulse/worker@1.0.0 build C:\Users\amits\Desktop\Ramver\QuantPulse\apps\worker
@quantpulse/worker:build: > tsc
@quantpulse/worker:build:
@quantpulse/backend:build: 
@quantpulse/backend:build: > @quantpulse/backend@1.0.0 build C:\Users\amits\Desktop\Ramver\QuantPulse\apps\backend
@quantpulse/backend:build: > nest build
@quantpulse/backend:build:
@quantpulse/frontend:build: ▲ Next.js 16.2.1 (Turbopack)
@quantpulse/frontend:build: 
@quantpulse/frontend:build:   Creating an optimized production build ...
@quantpulse/worker:build: src/index.ts(1,30): error TS6059: File 'C:/Users/amits/Desktop/Ramver/QuantPulse/packages/database/src/index.ts' is not under 'rootDir' 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src'. 'rootDir' is expected to contain all source files.  
@quantpulse/worker:build: src/index.ts(2,32): error TS6059: File 'C:/Users/amits/Desktop/Ramver/QuantPulse/packages/shared/src/index.ts' is not under 'rootDir' 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src'. 'rootDir' is expected to contain all source files.    
@quantpulse/worker:build:   The file is in the program because:
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/index.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/connectors/TwelveDataConnector.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/connectors/AlphaVantageConnector.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/connectors/AngelOneConnector.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/normalizer/DataNormalizer.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/connectors/MCXConnector.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/connectors/SolarConnector.ts'
@quantpulse/worker:build:     Imported via '@quantpulse/shared' from file 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src/normalizer/data-normalizer.ts'
@quantpulse/worker:build: ../../packages/database/src/index.ts(2,24): error TS6059: File 'C:/Users/amits/Desktop/Ramver/QuantPulse/packages/database/src/client.ts' is not under 'rootDir' 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src'. 'rootDir' is expected to contain all source files.
@quantpulse/worker:build: ../../packages/shared/src/index.ts(1,15): error TS6059: File 'C:/Users/amits/Desktop/Ramver/QuantPulse/packages/shared/src/types/index.ts' is not under 'rootDir' 'C:/Users/amits/Desktop/Ramver/QuantPulse/apps/worker/src'. 'rootDir' is expected to contain all source files.
@quantpulse/worker:build:  ELIFECYCLE  Command failed with exit code 2.
 ERROR  @quantpulse/worker#build: command (C:\Users\amits\Desktop\Ramver\QuantPulse\apps\worker) C:\Users\amits\AppData\Roaming\npm\pnpm.cmd run build exited (2)

 Tasks:    2 successful, 5 total
Cached:    0 cached, 5 total
  Time:    5.854s
Failed:    @quantpulse/worker#build

 ERROR  run failed: command  exited (2)



update - 
🐳 Step 3: Map Certificates to Docker
Now you must tell your Nginx container where to find these keys on your EC2 "Host."

Update your infra/docker/docker-compose.prod.yml:

YAML
services:
  gateway:
    # ... other config ...
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro # Mount the certs as Read-Only
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro


Error - 6
41.1 Progress: resolved 1058, reused 0, downloaded 741, added 251
141.5  WARN  GET https://registry.npmjs.org/tldts/-/tldts-7.0.27.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.5  WARN  GET https://registry.npmjs.org/type-fest/-/type-fest-5.5.0.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.5  WARN  GET https://registry.npmjs.org/tagged-tag/-/tagged-tag-1.0.0.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.5  WARN  GET https://registry.npmjs.org/until-async/-/until-async-3.0.2.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.6  WARN  GET https://registry.npmjs.org/fetch-blob/-/fetch-blob-3.2.0.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.6  WARN  GET https://registry.npmjs.org/node-domexception/-/node-domexception-1.0.0.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.6  WARN  GET https://registry.npmjs.org/node-fetch/-/node-fetch-3.3.2.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.6  WARN  GET https://registry.npmjs.org/web-streams-polyfill/-/web-streams-polyfill-3.3.3.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.6  WARN  GET https://registry.npmjs.org/formdata-polyfill/-/formdata-polyfill-4.0.10.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.6  WARN  GET https://registry.npmjs.org/open/-/open-11.0.0.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.6  WARN  GET https://registry.npmjs.org/default-browser/-/default-browser-5.5.0.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.7  WARN  GET https://registry.npmjs.org/bundle-name/-/bundle-name-4.1.0.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.7  WARN  GET https://registry.npmjs.org/default-browser-id/-/default-browser-id-5.0.1.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.7  WARN  GET https://registry.npmjs.org/run-applescript/-/run-applescript-7.1.0.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.7  WARN  GET https://registry.npmjs.org/define-lazy-prop/-/define-lazy-prop-3.0.0.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
141.7  WARN  GET https://registry.npmjs.org/is-in-ssh/-/is-in-ssh-1.0.0.tgz error (ERR_PNPM_ENOSPC). Will retry in 10 seconds. 2 retries left.
142.1 Progress: resolved 1058, reused 0, downloaded 746, added 251
143.7  ERR_PNPM_ENOSPC  [importPackage /app/node_modules/.pnpm/tapable@2.3.2/node_modules/tapable] ENOSPC: no space left on device, mkdir '/app/node_modules/.pnpm/tapable@2.3.2/node_modules/tapable_tmp_1_1'
------
[+] up 0/3
 ⠙ Image docker-frontend Building                                150.1s
 ⠙ Image docker-backend  Building                                150.1s
 ⠙ Image docker-worker   Building                                150.1s
Dockerfile:19

--------------------

  17 |

  18 |     # Install ALL workspace dependencies (ensures workspace symlinks are correct)

  19 | >>> RUN pnpm install --frozen-lockfile

  20 |

  21 |     COPY apps/backend/ ./apps/backend/

--------------------

target backend: failed to solve: process "/bin/sh -c pnpm install --frozen-lockfile" did not complete successfully: exit code: 1

[ec2-user@ip-172-31-79-156 QuantPulse]$



Before - 
# 1. Create the plugins directory
mkdir -p ~/.docker/cli-plugins

# 2. Download the latest Docker Compose binary
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose

# 3. Make the plugin executable
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose


after -- 
# 1. Create the plugins directory if it doesn't exist
mkdir -p ~/.docker/cli-plugins

# 2. Download the Buildx binary
curl -SL https://github.com/docker/buildx/releases/latest/download/buildx-v0.17.1.linux-amd64 -o ~/.docker/cli-plugins/docker-buildx

# 3. Make it executable
chmod +x ~/.docker/cli-plugins/docker-buildx

# 4. Verify the installation
docker buildx version


-----
 > [frontend base 16/16] RUN cd apps/frontend && npm run build:
0.972
0.972 > @quantpulse/frontend@1.0.0 build
0.972 > next build
0.972
1.331 ⚠ You are using a non-standard "NODE_ENV" value in your environment. This creates inconsistencies in the project and is strongly advised against. Read more: https://nextjs.org/docs/messages/non-standard-node-env
2.591 Attention: Next.js now collects completely anonymous telemetry regarding usage.
2.591 This information is used to shape Next.js' roadmap and prioritize features.
2.591 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
2.592 https://nextjs.org/telemetry
2.592
2.643 ▲ Next.js 16.2.1 (Turbopack)
2.643
2.896   Creating an optimized production build ...
19.23 ✓ Compiled successfully in 14.9s
19.35   Running TypeScript ...
32.00   Finished TypeScript in 12.6s ...
32.01   Collecting page data using 10 workers ...
33.89   Generating static pages using 10 workers (0/9) ...
35.03 Each child in a list should have a unique "key" prop.
35.03
35.03 Check the top-level render call using <__next_viewport_boundary__>. See https://react.dev/link/warning-keys for more information.
35.05 Each child in a list should have a unique "key" prop. See https://react.dev/link/warning-keys for more information.
35.38 Each child in a list should have a unique "key" prop.
35.38
35.38 Check the top-level render call using <meta>. See https://react.dev/link/warning-keys for more information.
35.38 Each child in a list should have a unique "key" prop.
35.38
35.38 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
35.44 Each child in a list should have a unique "key" prop.
35.44
35.44 Check the top-level render call using <meta>. See https://react.dev/link/warning-keys for more information.
35.44 Each child in a list should have a unique "key" prop.
35.44
35.44 Check the top-level render call using <html>. See https://react.dev/link/warning-keys for more information.
35.44 Each child in a list should have a unique "key" prop.
35.44
35.44 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
35.52 Each child in a list should have a unique "key" prop. See https://react.dev/link/warning-keys for more information.
35.55 Each child in a list should have a unique "key" prop.
35.55
35.55 Check the top-level render call using <meta>. See https://react.dev/link/warning-keys for more information.
35.55 Each child in a list should have a unique "key" prop.
35.55
35.55 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.11 Each child in a list should have a unique "key" prop.
36.11
36.11 Check the top-level render call using <__next_viewport_boundary__>. See https://react.dev/link/warning-keys for more information.
36.11 Each child in a list should have a unique "key" prop.
36.11
36.11 Check the top-level render call using <html>. See https://react.dev/link/warning-keys for more information.
36.11 Each child in a list should have a unique "key" prop.
36.11
36.11 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.12 Each child in a list should have a unique "key" prop. See https://react.dev/link/warning-keys for more information.
36.16 Each child in a list should have a unique "key" prop.
36.16
36.16 Check the top-level render call using <meta>. See https://react.dev/link/warning-keys for more information.
36.16 Each child in a list should have a unique "key" prop.
36.16
36.16 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.23 Each child in a list should have a unique "key" prop.
36.23
36.23 Check the top-level render call using <__next_viewport_boundary__>. See https://react.dev/link/warning-keys for more information.
36.23 Each child in a list should have a unique "key" prop.
36.23
36.23 Check the top-level render call using <html>. See https://react.dev/link/warning-keys for more information.
36.23 Each child in a list should have a unique "key" prop.
36.23
36.23 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.23 Each child in a list should have a unique "key" prop. See https://react.dev/link/warning-keys for more information.
36.25 Each child in a list should have a unique "key" prop.
36.25
36.25 Check the top-level render call using <meta>. See https://react.dev/link/warning-keys for more information.
36.25 Each child in a list should have a unique "key" prop.
36.25
36.25 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.30 Each child in a list should have a unique "key" prop.
36.30
36.30 Check the top-level render call using <__next_viewport_boundary__>. See https://react.dev/link/warning-keys for more information.
36.30 Each child in a list should have a unique "key" prop.
36.30
36.30 Check the top-level render call using <html>. See https://react.dev/link/warning-keys for more information.
36.30 Each child in a list should have a unique "key" prop.
36.30
36.30 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.30 Each child in a list should have a unique "key" prop. See https://react.dev/link/warning-keys for more information.
36.31 Each child in a list should have a unique "key" prop.
36.31
36.31 Check the top-level render call using <meta>. See https://react.dev/link/warning-keys for more information.
36.32 Each child in a list should have a unique "key" prop.
36.32
36.32 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.39 Each child in a list should have a unique "key" prop.
36.39
36.39 Check the top-level render call using <__next_viewport_boundary__>. See https://react.dev/link/warning-keys for more information.
36.39 Each child in a list should have a unique "key" prop.
36.39
36.39 Check the top-level render call using <html>. See https://react.dev/link/warning-keys for more information.
36.39 Each child in a list should have a unique "key" prop.
36.39
36.39 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.39 Each child in a list should have a unique "key" prop. See https://react.dev/link/warning-keys for more information.
36.40 Each child in a list should have a unique "key" prop.
36.40
36.40 Check the top-level render call using <meta>. See https://react.dev/link/warning-keys for more information.
36.40 Each child in a list should have a unique "key" prop.
36.40
36.40 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.47 Each child in a list should have a unique "key" prop.
36.47
36.47 Check the top-level render call using <__next_viewport_boundary__>. See https://react.dev/link/warning-keys for more information.
36.47 Each child in a list should have a unique "key" prop.
36.47
36.47 Check the top-level render call using <html>. See https://react.dev/link/warning-keys for more information.
36.47 Each child in a list should have a unique "key" prop.
36.47
36.47 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.48 Each child in a list should have a unique "key" prop. See https://react.dev/link/warning-keys for more information.
36.49 Each child in a list should have a unique "key" prop.
36.49
36.49 Check the top-level render call using <meta>. See https://react.dev/link/warning-keys for more information.
36.49 Each child in a list should have a unique "key" prop.
36.49
36.49 Check the top-level render call using <head>. See https://react.dev/link/warning-keys for more information.
36.52 Error occurred prerendering page "/_global-error". Read more: https://nextjs.org/docs/messages/prerender-error
36.54 TypeError: Cannot read properties of null (reading 'useContext')
36.54     at <unknown> (.next/server/chunks/ssr/04sg_next_dist_0o_30jg._.js:4:28833) {
36.54   digest: '2761005474'
36.54 }
36.55 Export encountered an error on /_global-error/page: /_global-error, exiting the build.
36.61 ⨯ Next.js build worker exited with code: 1 and signal: null
36.71 npm error Lifecycle script `build` failed with error:
36.73 npm error code 1
36.73 npm error path /app/apps/frontend
36.73 npm error workspace @quantpulse/frontend@1.0.0
36.73 npm error location /app/apps/frontend
36.73 npm error command failed
36.73 npm error command sh -c next build
------
Dockerfile:33

--------------------

  31 |

  32 |     # Build the frontend

  33 | >>> RUN cd apps/frontend && npm run build

  34 |

  35 |     # Production

--------------------

target frontend: failed to solve: process "/bin/sh -c cd apps/frontend && npm run build" did not complete successfully: exit code: 1



View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/p8inmwlt07t0rmqgbuym3zwzq


##  Error - 1
it's not showing any live chart and market news at ramversingh.com url, check it why it's happening