import { spawnSync } from 'node:child_process'

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  return result.status ?? 1
}

let failed = false

console.log('Running Prettier (check)…')
const prettierStatus = run('prettier', ['--check', '.'])
if (prettierStatus !== 0) failed = true

console.log('Running ESLint…')
const eslintStatus = run('eslint', ['.'])
if (eslintStatus !== 0) failed = true

console.log('Running TypeScript (typecheck)…')
const typecheckStatus = run('tsc', ['-p', 'tsconfig.json', '--noEmit'])
if (typecheckStatus !== 0) failed = true

process.exit(failed ? 1 : 0)
