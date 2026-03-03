exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const API_KEY = '2871537200c74ee5802841f011087c54';

  const symbols = [
    'XAU/USD','XAG/USD','BCO/USD','NATGAS/USD',
    'XCU/USD','XPT/USD','WHEAT/USD','CORN/USD',
    'SPX','IXIC','DJI','GDAXI','FTSE','NI225',
    'THYAO:BIST','GARAN:BIST','EREGL:BIST','SISE:BIST',
    'KCHOL:BIST','AKBNK:BIST','BIMAS:BIST','ASELS:BIST',
    'TUPRS:BIST','PGSUS:BIST','YKBNK:BIST','FROTO:BIST',
  ].join(',');

  try {
    const r = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols)}&apikey=${API_KEY}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();

    const result = [];
    for (const [sym, q] of Object.entries(data)) {
      if (!q || q.status === 'error' || !q.close) continue;
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

    return { statusCode: 200, headers, body: JSON.stringify({ quoteResponse: { result } }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
