// A monotonic counter so ids stay distinct even when the clock does not move
// between two calls — a tight loop can call newId() many times in the same ms.
let counter = 0

// Unique expense id that does NOT require a secure context (REQ-003).
//
// `crypto.randomUUID()` is only defined in a secure context, so it is missing
// over plain-HTTP preview (`vite preview --host 0.0.0.0`) and in older Safari;
// calling it there threw on submit and lost the expense (RVW-6). Use it when it
// is available, otherwise fall back to random bytes from `crypto.getRandomValues()`
// combined with a timestamp and the counter.
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  counter += 1

  const random = new Uint32Array(4)
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(random)
  }
  const entropy = Array.from(random, (part) => part.toString(16).padStart(8, '0')).join('')

  return `${Date.now().toString(36)}-${counter.toString(36)}-${entropy}`
}
