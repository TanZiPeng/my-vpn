export async function onRequestGet(context) {
  const { env } = context
  const list = await env.VPN_CONFIGS.list()
  const configs = []

  for (const key of list.keys) {
    if (key.name.startsWith('meta:')) {
      const meta = await env.VPN_CONFIGS.get(key.name, 'json')
      if (meta) configs.push(meta)
    }
  }

  const orderJson = await env.VPN_CONFIGS.get('_order')
  const order = orderJson ? JSON.parse(orderJson) : []

  configs.sort((a, b) => {
    const ia = order.indexOf(a.name)
    const ib = order.indexOf(b.name)
    if (ia === -1 && ib === -1) return new Date(b.uploadedAt) - new Date(a.uploadedAt)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  return new Response(JSON.stringify(configs), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function onRequestDelete(context) {
  const { env } = context
  const url = new URL(context.request.url)
  const segments = url.pathname.split('/')
  const name = decodeURIComponent(segments[segments.length - 1])

  if (!name || name === 'configs') {
    return new Response('Name required', { status: 400 })
  }

  await env.VPN_CONFIGS.delete(`meta:${name}`)
  await env.VPN_CONFIGS.delete(`file:${name}`)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
