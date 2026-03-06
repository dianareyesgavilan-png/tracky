export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API key' });

  const { base64, mediaType, text, lang, title } = req.body;
  const isEs = lang === 'es';

  try {
    let messages;

    if (text) {
      // Manual ingredient lookup by name
      messages = [{
        role: 'user',
        content: isEs
          ? `Eres un nutricionista experto. Estima los valores nutricionales para: "${text}". Asume una porcion tipica. Responde UNICAMENTE con este JSON sin ningun texto adicional:\n{"description":"${text}","ingredients":[{"name":"nombre con porcion estimada","calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}}`
          : `You are an expert nutritionist. Estimate nutrition for: "${text}". Assume a typical portion. Respond ONLY with this JSON:\n{"description":"${text}","ingredients":[{"name":"ingredient with estimated portion","calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}}`
      }];
    } else if (base64 && mediaType) {
      const hasTitle = title && title.trim().length > 0;

      const prompt = hasTitle
        ? (isEs
          ? `Eres un nutricionista experto. El usuario dice que este plato es: "${title}".
Usa la foto SOLO para estimar las proporciones y cantidades visibles.
Ya sabes que es ${title}, entonces:
1. Lista los ingredientes tipicos de ${title} con sus porciones estimadas segun lo que ves en la foto
2. Calcula las calorias y macros correctos para esas porciones
3. Se preciso con el metodo de coccion tipico de ${title}

Responde UNICAMENTE con este JSON sin ningun texto adicional:
{"description":"${title}","ingredients":[{"name":"ingrediente con porcion en gramos","calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}}`
          : `You are an expert nutritionist. The user says this dish is: "${title}".
Use the photo ONLY to estimate visible portions and quantities.
You already know it's ${title}, so:
1. List the typical ingredients of ${title} with portions estimated from what you see in the photo
2. Calculate accurate calories and macros for those portions
3. Be precise with the typical cooking method of ${title}

Respond ONLY with this JSON, no other text:
{"description":"${title}","ingredients":[{"name":"ingredient with portion in grams","calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}}`)
        : (isEs
          ? `Eres un nutricionista experto analizando una foto de comida. Analiza cuidadosamente:
1. Identifica TODOS los componentes del plato (proteinas, carbohidratos, vegetales, salsas, aderezos)
2. Estima las porciones segun el tamaño visual del plato (plato estandar = 25-28cm)
3. Considera el metodo de coccion visible (frito, grillado, al vapor, crudo)
4. Si hay ingredientes compuestos (ej. arroz con leche, empanada), listalos como un solo ingrediente
5. Se conservador con las porciones

Responde UNICAMENTE con este JSON sin ningun texto adicional:
{"description":"descripcion breve del plato","ingredients":[{"name":"ingrediente con porcion en gramos","calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}}`
          : `You are an expert nutritionist analyzing a food photo. Analyze carefully:
1. Identify ALL components on the plate (proteins, carbs, vegetables, sauces, dressings)
2. Estimate portions based on visual plate size (standard plate = 25-28cm)
3. Consider visible cooking method (fried, grilled, steamed, raw)
4. If there are compound ingredients (e.g. rice pudding, pie), list as a single ingredient
5. Be conservative with portions

Respond ONLY with this JSON, no other text:
{"description":"brief dish description","ingredients":[{"name":"ingredient with portion in grams","calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}],"totals":{"calories":0,"protein":0,"carbs":0,"fat":0,"fibre":0}}`);

      messages = [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: prompt }
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
    const jsonMatch = txt.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'No JSON in response' });

    const result = JSON.parse(jsonMatch[0]);
    res.status(200).json(result);
  } catch (e) {
    console.error('Handler error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
