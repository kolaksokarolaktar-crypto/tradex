exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const API_KEY = '2871537200c74ee5802841f011087c54';

  // Dakikada 8 istek limiti — her seferinde farklı grup çek
  const groups = [
    ['XAU/USD','XAG/USD','BCO/USD','NATGAS/USD','XCU/USD','XPT/USD','WHEAT/USD','CORN/USD'],
    ['THYAO:BIST','GARAN:BIST','EREGL:BIST','SISE:BIST','KCHOL:BIST','AKBNK:BIST','BIMAS:BIST','ASELS:BIST'],
    ['TUPRS:BIST','PGSUS:BIST','YKBNK:BIST','FROTO:BIST'],
  ];

  // Hangi grup? Dakikaya göre sırayla
  const groupIndex = Math.floor(Date.now() / 60000) % groups.length;
  const symbols = groups[groupIndex].join(',');

  try {
    const r = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${API_KEY}`
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();

    const result = [];
    for (const [sym, q] of Object.entries(data)) {
      if (!q || q.code === 403 || q.code === 429 || q.status === 'error' || !q.close) continue;
      const price = parseFloat(q.close);
      const prev = parseFloat(q.previous_close) || price;
      result.push({
        symbol: sym,
        regularMarketPrice: price,
        regularMarketPreviousClose: prev,
        regularMarketChangePercent: parseFloat(q.percent_change) || ((price - prev) / prev * 100),
        regularMarketDayHigh: parseFloat(q.high) || price,
        regularMarketDayLow: parseFloat(q.low) || price,
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ quoteResponse: { result } })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
