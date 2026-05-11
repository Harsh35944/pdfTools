/**
 * Global type augmentation to make Node.js Buffer / Uint8Array<ArrayBufferLike>
 * assignable to BodyInit (which NextResponse body expects).
 *
 * At runtime, Next.js / the Web Fetch API accepts Buffer just fine — this is
 * purely a TypeScript strict-typing reconciliation.
 */
declare global {
  // Widen BodyInit so Buffer (and Uint8Array<ArrayBufferLike>) are accepted
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ReadonlyArray<T> {}
}

// Ensure Buffer is treated as compatible with BufferSource / BodyInit
// by aliasing it to a concrete Uint8Array subtype.
declare module 'buffer' {
  interface Buffer extends Uint8Array<ArrayBuffer> {}
}

export {}
