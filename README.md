# escapace/env

`@escapace/env` provides two constants, `runtime` and `environment`, that identify the current JavaScript runtime and the software environment (development, production, or staging). It is designed for use in codebases that need to adapt to different platforms and execution contexts.

## Installation

```
pnpm add @escapace/env
```

## Usage

```ts
import { runtime, environment } from '@escapace/env'

if (runtime === 'node') {
  // Node.js-specific logic
}

if (environment === 'production') {
  // Production-specific logic
}
```

## API

- **runtime**:  
  A string identifying the current execution runtime. Possible values include:

  ```
  'azion' | 'browser' | 'bun' | 'deno' | 'edge-light' | 'edge-routine' |
  'electron' | 'fastly' | 'kiesel' | 'lagon' | 'moddable' | 'netlify' |
  'node' | 'react-native' | 'react-server' | 'wasmer' | 'workerd' | undefined
  ```

  These values are from the [Runtime Keys proposal](https://runtime-keys.proposal.wintercg.org/), which aims to standardize how JavaScript environments identify themselves.

- **environment**:  
  A string for the environment: `'development' | 'production' | 'staging' | undefined`

## How Import Conditions Work

This package uses [ESM import conditions](https://nodejs.org/api/packages.html#conditional-exports) to provide the correct `runtime` and `environment` values for the current execution context. The import conditions are defined in this repository’s [`package.json`](./package.json) in the `exports` field.

When your code is executed or bundled, Node.js or a compatible runtime uses these conditions to select the right file, so the correct constants are exported for each environment. The set of possible `runtime` values follows the [Runtime Keys proposal](https://runtime-keys.proposal.wintercg.org/), which provides a standardized way for runtimes like Node.js, Deno, Bun, and various edge platforms to identify themselves, making portable and interoperable code easier to write.
