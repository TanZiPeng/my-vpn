export async function onRequestDelete(context) {
  const { env } = context
  const url = new URL(context.request.url)
  const segments = url.pathname.split('/')
  const name = decodeURIComponent(segments[segments.length - 1])

  if (!name) {
    return new Response('Name required', { status: 400 })
  }

  await env.VPN_CONFIGS.delete(`meta:${name}`)
  await env.VPN_CONFIGS.delete(`file:${name}`)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
