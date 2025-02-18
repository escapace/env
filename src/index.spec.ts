import { resolve } from 'mlly'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assert, describe, it } from 'vitest'
import { combinations, type Combination } from '../scripts/combinations'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(path.dirname(__filename))

const run = async (conditions: string[]): Promise<Combination> =>
  (await import(await resolve('@escapace/env', { conditions, url: __dirname }))) as Combination

describe('env', () => {
  it('default', async () => {
    const { environment, runtime } = await run(['import'])
    assert.equal(environment, undefined)
    assert.equal(runtime, undefined)
  })

  it('node', async () => {
    const { environment, runtime } = await run(['import', 'node'])
    assert.equal(environment, undefined)
    assert.equal(runtime, 'node')
  })

  it('node/development', async () => {
    const { environment, runtime } = await run(['import', 'node', 'development'])
    assert.equal(environment, 'development')
    assert.equal(runtime, 'node')
  })

  it('node/production', async () => {
    const { environment, runtime } = await run(['import', 'node', 'production'])
    assert.equal(environment, 'production')
    assert.equal(runtime, 'node')
  })

  it('...', { timeout: 3000 }, async () => {
    for (const combination of combinations) {
      const { environment, runtime } = await run(
        ['import', combination.runtime, combination.environment].filter(
          (value) => typeof value === 'string',
        ),
      )
      assert.equal(environment, combination.environment)
      assert.equal(runtime, combination.runtime)
    }
  })

  it('...', { timeout: 3000 }, async () => {
    for (const combination of combinations) {
      const { environment, runtime } = await run(
        ['import', combination.environment, combination.runtime].filter(
          (value) => typeof value === 'string',
        ),
      )
      assert.equal(environment, combination.environment)
      assert.equal(runtime, combination.runtime)
    }
  })
})
