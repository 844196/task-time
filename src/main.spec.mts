import { expect, test } from 'vitest'
import { main } from './main.mjs'

test('main() should be return "Hello, world!"', () => {
  expect(main()).toBe('Hello, world!')
})
