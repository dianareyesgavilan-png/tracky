export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { base64, mediaType } = req.body;
  if (!base64 || !mediaType) return res.status(400).json({ error: 'Missing base64 or mediaType' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: `Analyze this meal photo. Return ONLY valid JSON, no markdown:\n{"description":"one sentence describing meal and portions","ingredients":[{"name":"ingredient with portion","calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}}\nAll numbers are integers. Grams for macros, kcal for calories.` }
          ]
        }]
      })
    });

    const data = await response.json();
    const txt = data.content?.map(i => i.text || '').join('') || '';
    const result = JSON.parse(txt.replace(/```json|```/g, '').trim());
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
