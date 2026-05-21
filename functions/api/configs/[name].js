export async function onRequestDelete(context) {
  const { env, request } = context

  const adminPass = env.ADMIN_PASSWORD
  if (adminPass) {
    const auth = request.headers.get('X-Admin-Password')
    if (auth !== adminPass) {
      return new Response(JSON.stringify({ error: 'Wrong password' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  const url = new URL(request.url)
  const segments = url.pathname.split('/')
  const name = decodeURIComponent(segments[segments.length - 1])

  if (!name) {
    return new Response('Name required', { status: 400 })
  }

  await env.VPN_CONFIGS.delete(`meta:${name}`)
  await env.VPN_CONFIGS.delete(`file:${name}`)

  const orderRaw = await env.VPN_CONFIGS.get('_order')
  if (orderRaw) {
    try {
      const order = JSON.parse(orderRaw).filter(n => n !== name)
      await env.VPN_CONFIGS.put('_order', JSON.stringify(order))
    } catch {}
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
