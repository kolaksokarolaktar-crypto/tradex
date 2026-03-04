export async function onRequest(context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const API_KEY = '2871537200c74ee5802841f011087c54';

  const symbols = [
    'XAU/USD','XAG/USD','BCO/USD','NATGAS/USD',
    'XCU/USD','XPT/USD','WHEAT/USD','CORN/USD',
    'THYAO:BIST','GARAN:BIST','EREGL:BIST','SISE:BIST',
    'KCHOL:BIST','AKBNK:BIST','BIMAS:BIST','ASELS:BIST',
    'TUPRS:BIST','PGSUS:BIST','YKBNK:BIST','FROTO:BIST',
  ].join(',');

  try {
    const url = `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${API_KEY}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();

    const result = [];
    for (const [sym, q] of Object.entries(data)) {
      if (!q || q.code === 403 || q.status === 'error' || !q.close) continue;
      const price = parseFloat(q.close);
      const prev  = parseFloat(q.previous_close) || price;
      result.push({
        symbol: sym,
        regularMarketPrice: price,
        regularMarketPreviousClose: prev,
        regularMarketChangePercent: parseFloat(q.percent_change) || ((price-prev)/prev*100),
        regularMarketDayHigh: parseFloat(q.high) || price,
        regularMarketDayLow:  parseFloat(q.low)  || price,
      });
    }

    return new Response(JSON.stringify({ quoteResponse: { result } }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, debug: e.stack }), { status: 500, headers });
  }
}
