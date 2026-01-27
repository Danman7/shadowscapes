import '@testing-library/jest-dom'

declare module 'bun:test' {
  interface Matchers<T = unknown>
    extends
      jest.Matchers<void, T>,
      TestingLibraryMatchers<typeof expect.stringContaining, T> {}
}

declare global {
  namespace jest {
    interface Matchers<R = void, _T = {}> {
      toBeInTheDocument(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveClass(...classNames: string[]): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveValue(value: string | number | string[]): R
      toBeChecked(): R
      toBeEmptyDOMElement(): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(html: string): R
      toHaveFocus(): R
      toHaveFormValues(values: Record<string, any>): R
      toHaveStyle(css: string | Record<string, any>): R
      toBeInvalid(): R
      toBeValid(): R
      toBeRequired(): R
    }
  }
}

type TestingLibraryMatchers<_E, _T> = {
  toBeInTheDocument(): void
  toHaveTextContent(
    text: string | RegExp,
    options?: { normalizeWhitespace: boolean },
  ): void
  toHaveClass(...classNames: string[]): void
  toBeVisible(): void
  toBeDisabled(): void
  toBeEnabled(): void
  toHaveAttribute(attr: string, value?: string | RegExp): void
  toHaveValue(value: string | number | string[] | null): void
  toBeChecked(): void
  toBeEmptyDOMElement(): void
  toContainElement(element: Element | null): void
  toContainHTML(html: string): void
  toHaveFocus(): void
  toHaveFormValues(values: Record<string, any>): void
  toHaveStyle(css: string | Record<string, any>): void
  toBeInvalid(): void
  toBeValid(): void
  toBeRequired(): void
}
