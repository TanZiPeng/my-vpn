export async function onRequest(context) {
  const { request, env } = context

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  if (request.method === 'GET') {
    const url = new URL(request.url)
    const cardid = url.searchParams.get('cardid')

    if (!cardid) {
      return new Response(JSON.stringify({ error: 'cardid required' }), { status: 400, headers })
    }

    const key = `click:${cardid}`
    const val = await env.VPN_CONFIGS.get(key)
    const count = val ? parseInt(val) : 0

    return new Response(JSON.stringify({ cardid, count }), { headers })
  }

  if (request.method === 'POST') {
    let body
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'invalid json' }), { status: 400, headers })
    }

    const { cardid } = body
    if (!cardid) {
      return new Response(JSON.stringify({ error: 'cardid required' }), { status: 400, headers })
    }

    const key = `click:${cardid}`
    const val = await env.VPN_CONFIGS.get(key)
    const count = (val ? parseInt(val) : 0) + 1
    await env.VPN_CONFIGS.put(key, String(count))

    return new Response(JSON.stringify({ cardid, count }), { headers })
  }

  return new Response('Method not allowed', { status: 405 })
}
