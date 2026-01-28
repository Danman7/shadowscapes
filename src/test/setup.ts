// DOM setup for component tests
// This file must be imported by any test that uses rendering (render, renderHook, etc)

import { cleanup } from '@testing-library/react'
import { afterEach } from 'bun:test'
import { JSDOM } from 'jsdom'

// Set up a basic DOM environment for component tests
// This MUST happen before any imports of @testing-library or React
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
})

const win = dom.window as any

// Set all required globals
Object.defineProperty(global, 'document', {
  value: win.document,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, 'window', {
  value: win,
  writable: true,
  configurable: true,
})

Object.defineProperty(global, 'navigator', {
  value: win.navigator,
  writable: true,
  configurable: true,
})

global.HTMLElement = win.HTMLElement
global.HTMLDocument = win.HTMLDocument
global.DOMException = win.DOMException
global.URL = win.URL
global.customElements = win.customElements

// Clean up between tests
afterEach(() => {
  cleanup()
})
