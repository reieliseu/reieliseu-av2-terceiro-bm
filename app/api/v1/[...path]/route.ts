import { apiUrl } from "@/lib/deployment"

type RouteContext = {
  params: Promise<{ path: string[] }>
}

const apiBaseUrl = apiUrl(process.env.NEXT_PUBLIC_API_URL, process.env.NODE_ENV === "production")

async function forwardRequest(request: Request, { params }: RouteContext) {
  const { path } = await params
  const requestUrl = new URL(request.url)
  const endpoint = new URL(`${path.map(encodeURIComponent).join("/")}${requestUrl.search}`, `${apiBaseUrl}/`)
  const headers = new Headers()

  for (const name of ["accept", "authorization", "content-type"]) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  const method = request.method.toUpperCase()
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer()
  let upstream: Response

  try {
    upstream = await fetch(endpoint, {
      method,
      headers,
      body,
      cache: "no-store",
    })
  } catch {
    return Response.json(
      { error: "Não foi possível conectar à API. Verifique se o servidor está ativo." },
      { status: 502 },
    )
  }

  const responseHeaders = new Headers()
  for (const name of ["content-type", "cache-control", "retry-after"]) {
    const value = upstream.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }

  const responseBody = method === "HEAD" || [204, 205, 304].includes(upstream.status)
    ? null
    : upstream.body

  return new Response(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export { forwardRequest as GET, forwardRequest as POST, forwardRequest as PATCH, forwardRequest as DELETE, forwardRequest as OPTIONS }
