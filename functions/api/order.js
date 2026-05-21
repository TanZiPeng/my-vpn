export async function onRequestPut(context) {
  const { env, request } = context
  const { names } = await request.json()

  if (!Array.isArray(names)) {
    return new Response('names array required', { status: 400 })
  }

  await env.VPN_CONFIGS.put('_order', JSON.stringify(names))

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
