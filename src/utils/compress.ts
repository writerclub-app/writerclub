/** Compress a string to Uint8Array using native CompressionStream (gzip). */
export async function compress(text: string): Promise<Uint8Array> {
  const stream = new CompressionStream('gzip')
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()
  void writer.write(encoder.encode(text) as Uint8Array<ArrayBuffer>)
  void writer.close()
  const chunks: Uint8Array<ArrayBuffer>[] = []
  const reader = stream.readable.getReader()
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  const total = chunks.reduce((n, c) => n + c.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length }
  return out
}

/** Decompress a Uint8Array (gzip) back to string. */
export async function decompress(data: Uint8Array): Promise<string> {
  const stream = new DecompressionStream('gzip')
  const writer = stream.writable.getWriter()
  void writer.write(data as Uint8Array<ArrayBuffer>)
  void writer.close()
  const chunks: Uint8Array<ArrayBuffer>[] = []
  const reader = stream.readable.getReader()
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  const decoder = new TextDecoder()
  return decoder.decode(
    chunks.reduce((acc, c) => {
      const merged = new Uint8Array(acc.length + c.length)
      merged.set(acc); merged.set(c, acc.length)
      return merged
    }, new Uint8Array(0))
  )
}

/** Encode Uint8Array to base64 string (for JSON transport). */
export function toBase64(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
}

/** Decode base64 string back to Uint8Array. */
export function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}
