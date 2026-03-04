from flask import Flask, jsonify
import requests

app = Flask(__name__)

SYMBOLS = {
    'XAUUSD': 'GC=F', 'XAGUSD': 'SI=F', 'USOIL': 'BZ=F', 'NATGAS': 'NG=F',
    'COPPER': 'HG=F', 'PLAT': 'PL=F', 'WHEAT': 'ZW=F', 'CORN': 'ZC=F',
    'SP500': '^GSPC', 'NDX': '^NDX', 'DJIA': '^DJI', 'DAX': '^GDAXI',
    'FTSE': '^FTSE', 'N225': '^N225',
    'THYAO': 'THYAO.IS', 'GARAN': 'GARAN.IS', 'EREGL': 'EREGL.IS',
    'SISE': 'SISE.IS', 'KCHOL': 'KCHOL.IS', 'AKBNK': 'AKBNK.IS',
    'BIMAS': 'BIMAS.IS', 'ASELS': 'ASELS.IS', 'TUPRS': 'TUPRS.IS',
    'PGSUS': 'PGSUS.IS', 'YKBNK': 'YKBNK.IS', 'FROTO': 'FROTO.IS',
}

@app.route('/prices')
def prices():
    syms = ','.join(SYMBOLS.values())
    url = f'https://query2.finance.yahoo.com/v7/finance/quote?symbols={syms}'
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        quotes = data.get('quoteResponse', {}).get('result', [])
        reverse = {v: k for k, v in SYMBOLS.items()}
        result = []
        for q in quotes:
            sym = reverse.get(q.get('symbol', ''))
            if not sym: continue
            result.append({
                'symbol': sym,
                'regularMarketPrice': q.get('regularMarketPrice'),
                'regularMarketChangePercent': q.get('regularMarketChangePercent'),
                'regularMarketDayHigh': q.get('regularMarketDayHigh'),
                'regularMarketDayLow': q.get('regularMarketDayLow'),
                'regularMarketPreviousClose': q.get('regularMarketPreviousClose'),
            })
        resp = jsonify({'quoteResponse': {'result': result}})
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
