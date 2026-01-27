// DOM setup for component tests
import { cleanup } from '@testing-library/react'
import { afterEach } from 'bun:test'
import { JSDOM } from 'jsdom'

// Create JSDOM instance once
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
})

// Set globals
;(globalThis as any).window = dom.window
;(globalThis as any).document = dom.window.document
;(globalThis as any).navigator = dom.window.navigator
;(globalThis as any).HTMLElement = dom.window.HTMLElement
;(globalThis as any).HTMLDocument = dom.window.HTMLDocument
;(globalThis as any).DOMException = dom.window.DOMException
;(globalThis as any).URL = dom.window.URL
;(globalThis as any).customElements = dom.window.customElements

// Clean up between tests to avoid leaking DOM state
afterEach(() => {
  cleanup()
})
