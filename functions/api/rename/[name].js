export async function onRequestPut(context) {
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
  const oldName = decodeURIComponent(segments[segments.length - 1])

  const { newName } = await request.json()
  if (!newName || !newName.trim()) {
    return new Response(JSON.stringify({ error: 'newName required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const trimmed = newName.trim()
  const hasExt = /\.(yml|yaml)$/i.test(trimmed)
  const finalName = hasExt ? trimmed : trimmed + '.yml'

  if (finalName === oldName) {
    return new Response(JSON.stringify({ ok: true, name: finalName }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const existing = await env.VPN_CONFIGS.get(`meta:${finalName}`)
  if (existing) {
    return new Response(JSON.stringify({ error: 'Name already exists' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const [content, metaRaw] = await Promise.all([
    env.VPN_CONFIGS.get(`file:${oldName}`),
    env.VPN_CONFIGS.get(`meta:${oldName}`)
  ])

  if (!content || !metaRaw) {
    return new Response(JSON.stringify({ error: 'File not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const meta = JSON.parse(metaRaw)
  meta.name = finalName

  await Promise.all([
    env.VPN_CONFIGS.put(`file:${finalName}`, content),
    env.VPN_CONFIGS.put(`meta:${finalName}`, JSON.stringify(meta)),
  ])

  await Promise.all([
    env.VPN_CONFIGS.delete(`file:${oldName}`),
    env.VPN_CONFIGS.delete(`meta:${oldName}`),
  ])

  const orderRaw = await env.VPN_CONFIGS.get('_order')
  if (orderRaw) {
    try {
      const order = JSON.parse(orderRaw).map(n => n === oldName ? finalName : n)
      await env.VPN_CONFIGS.put('_order', JSON.stringify(order))
    } catch {}
  }

  return new Response(JSON.stringify({ ok: true, name: finalName }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
