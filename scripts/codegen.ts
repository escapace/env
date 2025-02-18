import { assign, isPlainObject, kebabCase, merge, orderBy } from 'lodash-es'
import { exec as _exec } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { combinations, environments, runtimes, type Combination } from './combinations'

const exec = promisify(_exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getObjectDepth(object: object): number {
  function depthFirstSearch(o: object, currentDepth: number): number {
    let maxDepth = currentDepth
    for (const key in o) {
      const qwe = o[key as keyof typeof o] as object

      if (isPlainObject(qwe) && qwe !== null) {
        const depth = depthFirstSearch(qwe, currentDepth + 1)
        if (depth > maxDepth) {
          maxDepth = depth
        }
      }
    }
    return maxDepth
  }

  return depthFirstSearch(object, 1)
}

const createName = (value: Combination) => {
  const array = [value.environment, value.runtime].filter((value) => typeof value === 'string')
  const name = array.length === 0 ? 'index' : `${array.map((value) => kebabCase(value)).join('-')}`

  return name
}

const createImports = (value: Combination) => {
  const name = createName(value)

  return {
    import: {
      types: './lib/types/index.d.ts',
      // eslint-disable-next-line perfectionist/sort-objects
      default: `./lib/neutral/${name}.js`,
    },
  }
}

// eslint-disable-next-line typescript/no-unsafe-assignment
const packageExports: object = merge(
  {},
  ...orderBy(
    combinations.map(({ environment, runtime }) => {
      if (typeof environment === 'string' && typeof runtime === 'string') {
        return {
          [environment]: {
            [runtime]: createImports({ environment, runtime }),
          },
        }
      } else if (typeof environment === 'string' || typeof runtime === 'string') {
        // eslint-disable-next-line typescript/non-nullable-type-assertion-style
        const value = (environment ?? runtime) as string

        return {
          [value]: { default: createImports({ environment, runtime }) },
        }
      } else {
        return { default: createImports({ environment, runtime }) }
      }
    }),
    (value) => {
      const depth = getObjectDepth(value)

      if (Object.keys(value).includes('default')) {
        return -1
      }

      return depth
    },
    'desc',
  ),
)

await Promise.all(
  combinations.map(async (combination) => {
    const name = createName(combination)

    const file = path.resolve(__dirname, '..', 'src', `${name}.ts`)

    await writeFile(
      file,
      `
export const runtime: undefined | ${runtimes
        .filter((v) => typeof v === 'string')
        .map((v) => `'${v}'`)
        .join(
          ' | ',
        )} = ${combination.runtime === undefined ? 'undefined' : `'${combination.runtime}'`}
export const environment: undefined | ${environments
        .filter((v) => typeof v === 'string')
        .map((v) => `'${v}'`)
        .join(
          ' | ',
        )} = ${combination.environment === undefined ? 'undefined' : `'${combination.environment}'`}
`,
    )

    await exec(`pnpm exec prettier --write ${file}`)
    await exec(`pnpm exec eslint --fix ${file}`)
  }),
)

const pathFileConstants = path.resolve(__dirname, '..', 'scripts', 'constants.json')

await writeFile(
  pathFileConstants,
  JSON.stringify(
    merge(JSON.parse(await readFile(pathFileConstants, 'utf8')), {
      builds: {
        neutral: {
          entryPoints: combinations.map((value) => `src/${createName(value)}.ts`),
        },
      },
    }),
  ),
)

await exec(`pnpm exec prettier --write ${pathFileConstants}`)
await exec(`pnpm exec eslint --fix ${pathFileConstants}`)

const pathFilePackageJSON = path.resolve(__dirname, '..', 'package.json')

await writeFile(
  pathFilePackageJSON,
  JSON.stringify(
    assign(JSON.parse(await readFile(pathFilePackageJSON, 'utf8')), {
      exports: packageExports,
    }),
  ),
)

await exec(`pnpm exec prettier --write ${pathFilePackageJSON}`)
await exec(`pnpm exec eslint --fix ${pathFilePackageJSON}`)
