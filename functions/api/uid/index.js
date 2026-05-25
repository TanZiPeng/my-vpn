export async function onRequestGet() {
  const uid = crypto.randomUUID()
  return new Response(JSON.stringify({ uid }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })
}
