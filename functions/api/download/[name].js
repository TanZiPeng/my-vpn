export async function onRequestGet(context) {
  const { env } = context
  const url = new URL(context.request.url)
  const segments = url.pathname.split('/')
  const name = decodeURIComponent(segments[segments.length - 1])

  const content = await env.VPN_CONFIGS.get(`file:${name}`)
  if (!content) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'application/x-yaml; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Access-Control-Allow-Origin': '*',
    }
  })
}
