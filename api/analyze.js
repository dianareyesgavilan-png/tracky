export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API key' });

  const { base64, mediaType, text, lang } = req.body;
  const isEs = lang === 'es';

  try {
    let messages;

    if (text) {
      messages = [{
        role: 'user',
        content: isEs
          ? `Eres un nutricionista. Estima los valores nutricionales para: "${text}". Porcion tipica de una comida. Responde UNICAMENTE con este JSON sin ningun texto adicional:\n{"description":"${text}","ingredients":[{"name":"${text}","calories":200,"protein":10,"carbs":25,"fat":8,"fibre":2}],"totals":{"calories":200,"protein":10,"carbs":25,"fat":8,"fibre":2}}`
          : `You are a nutritionist. Estimate nutrition for: "${text}". Typical single serving. Respond ONLY with this JSON, no other text:\n{"description":"${text}","ingredients":[{"name":"${text}","calories":200,"protein":10,"carbs":25,"fat":8,"fibre":2}],"totals":{"calories":200,"protein":10,"carbs":25,"fat":8,"fibre":2}}`
      }];
    } else if (base64 && mediaType) {
      messages = [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: isEs
            ? `Eres un nutricionista. Analiza esta foto de comida y estima los valores nutricionales. Responde UNICAMENTE con este JSON sin ningun texto adicional:\n{"description":"descripcion de la comida","ingredients":[{"name":"nombre ingrediente","calories":100,"protein":5,"carbs":10,"fat":4,"fibre":1}],"totals":{"calories":100,"protein":5,"carbs":10,"fat":4,"fibre":1}}\nPuede haber multiples ingredientes. Todos los numeros son enteros.`
            : `You are a nutritionist. Analyze this food photo and estimate nutritional values. Respond ONLY with this JSON, no other text:\n{"description":"description of the meal","ingredients":[{"name":"ingredient name","calories":100,"protein":5,"carbs":10,"fat":4,"fibre":1}],"totals":{"calories":100,"protein":5,"carbs":10,"fat":4,"fibre":1}}\nThere can be multiple ingredients. All numbers are integers.`
          }
        ]
      }];
    } else {
      return res.status(400).json({ error: 'Missing params' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, messages })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic error:', response.status, errText);
      return res.status(500).json({ error: `Anthropic ${response.status}` });
    }

    const data = await response.json();
    const txt = data.content?.map(i => i.text || '').join('') || '';
    console.log('Raw response:', txt.substring(0, 200));

    // Extract JSON from response
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in:', txt);
      return res.status(500).json({ error: 'No JSON in response' });
    }

    const result = JSON.parse(jsonMatch[0]);
    res.status(200).json(result);
  } catch (e) {
    console.error('Handler error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
