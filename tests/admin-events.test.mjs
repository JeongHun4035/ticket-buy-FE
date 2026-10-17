import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'

import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/utils/adminEvents.ts', import.meta.url), 'utf8')
const sandbox = {
  exports: {},
  crypto: { randomUUID: () => 'draft-id' },
  createImageBitmap: async () => ({
    width: 100,
    height: 100,
    close: () => {},
  }),
}
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, sandbox)
const helpers = sandbox.exports
const draft = () => ({
  titles: {
    ko: ' Concert ',
    en: ' ',
    'zh-CN': '',
  },
  descriptions: { ko: 'Description' },
  category: 'CONCERT',
  featuredRank: '0',
  performances: [
    {
      key: 'one',
      venue: { id: 10 },
      startsAt: '2099-12-01T19:00',
      opensAt: '2020-01-01T09:00',
      closesAt: '2099-12-01T18:00',
      sections: [
        {
          section: {
            id: '1000001',
            totalSeats: 100,
          },
          grade: 'VIP',
          price: '150000',
        },
      ],
    },
  ],
})

test('event payload uses Seoul time, omits empty translations and preserves numeric server IDs', () => {
  const payload = helpers.buildEventPayload(draft())
  assert.equal(payload.titles.ko, 'Concert')
  assert.equal(payload.titles.en, undefined)
  assert.equal(payload.performances[0].startsAt, '2099-12-01T10:00:00.000Z')
  assert.equal(payload.performances[0].sectionPrices[0].sectionId, 1000001)
  assert.equal(payload.performances[0].sectionPrices[0].price, 150000)
})

test('event validation rejects unsafe IDs, duplicate sections, invalid dates and prices', () => {
  for (const id of [
    '9007199254740993',
    '1e3',
    '-1',
    '0',
  ]) assert.throws(() => helpers.safeSectionId(id), /INVALID_SECTION/)
  assert.throws(() => helpers.seoulDateToISO('2099-02-30T10:00'), /INVALID_SCHEDULE/)
  let value = draft()
  value.performances[0].sections.push(value.performances[0].sections[0])
  assert.throws(() => helpers.buildEventPayload(value), /DUPLICATE_SECTION/)
  value = draft(); value.performances[0].closesAt = '2099-12-01T20:00'
  assert.throws(() => helpers.buildEventPayload(value), /INVALID_SCHEDULE/)
  value = draft(); value.performances[0].sections[0].price = '1.5'
  assert.throws(() => helpers.buildEventPayload(value), /0~100000000/)
  value = draft(); value.performances = []
  assert.throws(() => helpers.buildEventPayload(value), /1~20/)
})

test('poster validation checks MIME, byte size, signature, decode and dimension limits', async () => {
  const file = {
    type: 'image/png',
    size: 8,
    slice: () => ({
      arrayBuffer: async () => new Uint8Array([
        137,
        80,
        78,
        71,
        13,
        10,
        26,
        10,
      ]).buffer,
    }),
  }
  await helpers.validatePosterFile(file)
  await assert.rejects(helpers.validatePosterFile({
    ...file,
    type: 'image/svg+xml',
  }), /UNSUPPORTED_IMAGE_TYPE/)
  await assert.rejects(helpers.validatePosterFile({
    ...file,
    size: 5242881,
  }), /IMAGE_TOO_LARGE/)
  let closed = false
  sandbox.createImageBitmap = async () => ({
    width: 6001,
    height: 100,
    close: () => {
      closed = true
    },
  })
  await assert.rejects(helpers.validatePosterFile(file), /IMAGE_DIMENSIONS_EXCEEDED/)
  assert.equal(closed, true)
  sandbox.createImageBitmap = async () => ({
    width: 5000,
    height: 5000,
    close: () => {},
  })
  await assert.rejects(helpers.validatePosterFile(file), /IMAGE_DIMENSIONS_EXCEEDED/)
  sandbox.createImageBitmap = async () => {
    throw new Error('decode')
  }
  await assert.rejects(helpers.validatePosterFile(file), /INVALID_IMAGE/)
})
