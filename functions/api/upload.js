export async function onRequestPost(context) {
  const { env, request } = context

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string') {
    return new Response('No file provided', { status: 400 })
  }

  const name = file.name || 'config.yml'
  const content = await file.text()
  const size = file.size

  await env.VPN_CONFIGS.put(`file:${name}`, content)
  await env.VPN_CONFIGS.put(`meta:${name}`, JSON.stringify({
    name,
    size,
    uploadedAt: new Date().toISOString()
  }))

  return new Response(JSON.stringify({ ok: true, name }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
