exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const symbols = [
    'GC=F','SI=F','BZ=F','NG=F','HG=F','PL=F','ZW=F','ZC=F',
    '^GSPC','^NDX','^DJI','^GDAXI','^FTSE','^N225',
    'THYAO.IS','GARAN.IS','EREGL.IS','SISE.IS','KCHOL.IS','AKBNK.IS',
    'BIMAS.IS','ASELS.IS','TUPRS.IS','PGSUS.IS','YKBNK.IS','FROTO.IS',
    '^XU100.IS'
  ].map(s => encodeURIComponent(s)).join(',');

  const url = `https://query2.finance.yahoo.com/v8/finance/spark?symbols=${symbols}&range=1d&interval=5m`;

  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)' }
    });

    if (!r.ok) throw new Error(`Yahoo HTTP ${r.status}`);

    const data = await r.json();
    const result = [];

    for (const item of (data?.spark?.result || [])) {
      if (!item) continue;
      const meta = item.response?.[0]?.meta;
      if (!meta?.regularMarketPrice) continue;
      const prev = meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice;
      result.push({
        symbol: item.symbol,
        regularMarketPrice: meta.regularMarketPrice,
        regularMarketPreviousClose: prev,
        regularMarketChangePercent: ((meta.regularMarketPrice - prev) / prev * 100),
        regularMarketDayHigh: meta.regularMarketDayHigh || meta.regularMarketPrice,
        regularMarketDayLow: meta.regularMarketDayLow || meta.regularMarketPrice,
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ quoteResponse: { result } })
    };

  } catch (e) {
    try {
      const url2 = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
      const r2 = await fetch(url2, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const data2 = await r2.json();
      return { statusCode: 200, headers, body: JSON.stringify(data2) };
    } catch (e2) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }
};
