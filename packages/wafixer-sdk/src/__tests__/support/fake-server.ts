import { createServer, type IncomingHttpHeaders } from 'node:http'
import type { AddressInfo } from 'node:net'

export interface RecordedRequest {
  method: string
  /** Kodlanmış yol (`/comment/find/Sat%C4%B1%C5%9F`). */
  path: string
  query: Record<string, string>
  headers: IncomingHttpHeaders
  body: unknown
}

export interface FakeReply {
  status?: number
  body?: unknown
  headers?: Record<string, string>
}

export interface FakeServer {
  baseUrl: string
  requests: RecordedRequest[]
  on(method: string, path: string, reply: FakeReply | ((req: RecordedRequest) => FakeReply)): void
  last(): RecordedRequest
  reset(): void
  close(): Promise<void>
}

/**
 * Yerel HTTP sunucusu: SDK gerçek axios katmanıyla konuşur, istekler kaydedilir. Tanımsız yol
 * 404 `NOT_FOUND` döner; yanlış adres testte hata olarak görünür.
 */
export async function startFakeServer(): Promise<FakeServer> {
  const routes = new Map<string, (req: RecordedRequest) => FakeReply>()
  const requests: RecordedRequest[] = []

  const server = createServer((req, res) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      const url = new URL(req.url ?? '/', 'http://fake')
      const raw = Buffer.concat(chunks).toString('utf8')
      let body: unknown = raw || undefined
      if (raw) {
        try {
          body = JSON.parse(raw)
        } catch {
          body = raw
        }
      }
      const recorded: RecordedRequest = {
        method: req.method ?? 'GET',
        path: url.pathname,
        query: Object.fromEntries(url.searchParams.entries()),
        headers: req.headers,
        body,
      }
      requests.push(recorded)
      const handler = routes.get(`${recorded.method} ${recorded.path}`)
      const reply = handler
        ? handler(recorded)
        : { status: 404, body: { error: `Tanımsız yol: ${recorded.method} ${recorded.path}`, code: 'NOT_FOUND' } }
      const status = reply.status ?? 200
      res.writeHead(status, { 'content-type': 'application/json', ...(reply.headers ?? {}) })
      res.end(reply.body === undefined ? '' : JSON.stringify(reply.body))
    })
  })

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    requests,
    on(method, path, reply) {
      routes.set(`${method} ${path}`, typeof reply === 'function' ? reply : () => reply)
    },
    last() {
      const request = requests[requests.length - 1]
      if (!request) throw new Error('Sahte sunucuya istek gelmedi')
      return request
    },
    reset() {
      routes.clear()
      requests.length = 0
    },
    close() {
      return new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
    },
  }
}
