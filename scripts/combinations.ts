// https://runtime-keys.proposal.wintercg.org/
export const runtimes = [
  'edge-routine',
  'azion',
  'workerd',
  'deno',
  'lagon',
  'react-native',
  'moddable',
  'netlify',
  'electron',
  'node',
  'bun',
  'react-server',
  'edge-light',
  'fastly',
  'kiesel',
  'wasmer',
  'browser',
  undefined,
]

export const environments = ['development', 'production', 'staging', undefined]

export interface Combination {
  environment?: string
  runtime?: string
}

export const combinations = environments
  .map((environment) => runtimes.map((runtime): Combination => ({ environment, runtime })))
  .flat()
