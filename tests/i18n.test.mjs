import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import vm from 'node:vm'

import { createInstance } from 'i18next'
import ts from 'typescript'

const root = path.resolve(import.meta.dirname, '..')
const languages = [
  'ko',
  'en',
  'zh-CN',
]
const resources = Object.fromEntries(languages.map(language => [language, { translation: JSON.parse(fs.readFileSync(path.join(root, `src/i18n/locales/${language}.json`), 'utf8')) }]))
const placeholders = text => [...text.matchAll(/{{\s*(\w+)\s*}}/g)].map(match => match[1]).sort()

const loadAppI18n = (saved, unavailable = false) => {
  const instance = createInstance()
  const storage = new Map(saved ? [['ticket-buy-language', saved]] : [])
  const document = { documentElement: { lang: '' } }
  const localStorage = {
    getItem: key => {
      if (unavailable) throw new Error('Storage disabled'); return storage.get(key) ?? null
    },
    setItem: (key, value) => {
      if (unavailable) throw new Error('Storage disabled'); storage.set(key, value)
    },
  }
  const source = fs.readFileSync(path.join(root, 'src/i18n/index.ts'), 'utf8')
  const code = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  }).outputText
  vm.runInNewContext(code, {
    exports: {},
    document,
    localStorage,
    require: name => name === 'i18next' ? instance : name === 'react-i18next' ? {
      initReactI18next: {
        type: '3rdParty',
        init: () => {},
      },
    } : JSON.parse(fs.readFileSync(path.resolve(root, 'src/i18n', name), 'utf8')),
  })
  return {
    instance,
    storage,
    document,
  }
}

test('all languages have matching translation keys and interpolation values', () => {
  const original = resources.ko.translation
  for (const language of languages) {
    const translated = resources[language].translation
    assert.deepEqual(Object.keys(translated).sort(), Object.keys(original).sort())
    for (const [key, value] of Object.entries(translated)) {
      assert.ok(value.trim(), `${language}: empty translation for ${key}`)
      assert.deepEqual(placeholders(value), placeholders(original[key]), `${language}: interpolation mismatch for ${key}`)
    }
  }
})

test('saved language loads and language switching updates storage and html lang', async () => {
  const { instance, storage, document } = loadAppI18n('en')
  assert.equal(instance.language, 'en')
  assert.equal(instance.t('예매하기'), 'Book tickets')
  assert.equal(document.documentElement.lang, 'en')
  await instance.changeLanguage('zh-CN')
  assert.equal(instance.t('예매하기'), '立即订票')
  assert.equal(storage.get('ticket-buy-language'), 'zh-CN')
  assert.equal(document.documentElement.lang, 'zh-CN')
  assert.equal(instance.t('{{row}}열 {{number}}번', {
    row: 'A',
    number: 3,
  }), 'A 排 3 号')
})

test('missing or invalid saved language falls back to Korean', () => {
  for (const saved of [
    null,
    'invalid',
    'fr',
  ]) {
    const { instance } = loadAppI18n(saved)
    assert.equal(instance.language, 'ko')
    assert.equal(instance.t('예매하기'), '예매하기')
  }
})

test('language switching still works when storage access is disabled', async () => {
  const { instance, document } = loadAppI18n(null, true)
  await instance.changeLanguage('en')
  assert.equal(instance.t('로그인이 필요합니다.'), 'Please sign in.')
  assert.equal(document.documentElement.lang, 'en')
})

test('event names and venues are translated in all supported languages', () => {
  const code = ts.transpileModule(fs.readFileSync(path.join(root, 'src/mocks/events.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
  const sandbox = { exports: {} }
  vm.runInNewContext(code, sandbox)
  for (const event of sandbox.exports.mockEvents) {
    for (const language of languages) {
      assert.ok(resources[language].translation[event.title], `${language}: ${event.title}`)
      assert.ok(resources[language].translation[event.venue], `${language}: ${event.venue}`)
    }
  }
})

test('source and translation files contain no corrupted question-mark strings', () => {
  for (const file of fs.readdirSync(path.join(root, 'src'), { recursive: true })) {
    if (!/\.(tsx?|json)$/.test(file)) continue
    const source = fs.readFileSync(path.join(root, 'src', file), 'utf8')
    assert.ok(!/\?{3,}/.test(source), `Corrupted text in ${file}`)
    assert.ok(!source.includes('\uFFFD'), `Invalid Unicode in ${file}`)
  }
})
