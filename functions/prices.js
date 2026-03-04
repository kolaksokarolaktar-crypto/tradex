export async function onRequest(context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const API_KEY = '2871537200c74ee5802841f011087c54';

  try {
    const url = `https://api.twelvedata.com/quote?symbol=XAU/USD,THYAO:BIST&apikey=${API_KEY}`;
    const r = await fetch(url);
    const text = await r.text();
    return new Response(text, { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
