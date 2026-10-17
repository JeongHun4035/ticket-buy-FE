import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'

import ts from 'typescript'

const loadService = () => {
  const storage = new Map()
  const sandbox = {
    exports: {},
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  }
  const source = fs.readFileSync(new URL('../src/services/demoPayments.ts', import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  vm.runInNewContext(code, sandbox)
  return sandbox.exports
}

test('demo payment methods are isolated by user and contain only display metadata', () => {
  const service = loadService()
  const method = {
    id: 'demo-id',
    issuer: 'BC Card',
    last4: '1234',
    nickname: 'Tickets',
    isDefault: true,
    createdAt: new Date().toISOString(),
  }
  service.saveDemoPayments('user-1', [method])
  assert.equal(service.loadDemoPayments('user-1')[0].last4, '1234')
  assert.equal(service.loadDemoPayments('user-2').length, 0)
  assert.equal(service.loadDemoPayments('user-1')[0].password, undefined)
  assert.equal(service.loadDemoPayments('user-1')[0].cardNumber, undefined)
  service.saveDemoPayments('user-1', [])
  assert.equal(service.loadDemoPayments('user-1').length, 0)
})

test('demo payment methods cannot be saved without a user identifier', () => {
  assert.throws(() => loadService().saveDemoPayments('', []))
})
