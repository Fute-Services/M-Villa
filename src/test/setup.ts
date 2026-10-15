import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom does not implement media playback.
window.HTMLMediaElement.prototype.play = () => Promise.resolve()

afterEach(() => cleanup())
