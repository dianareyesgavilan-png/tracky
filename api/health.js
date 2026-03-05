export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, date, steps, weight, workouts } = req.body;
  if (!userId || !date) return res.status(400).json({ error: 'Missing userId or date' });

  // We store data in a KV-like way using a simple response
  // The client will merge this with existing localStorage data
  const healthData = {};

  if (weight) healthData.weight = String(weight);

  if (steps || (workouts && workouts.length > 0)) {
    const parts = [];
    if (workouts && workouts.length > 0) {
      const w = workouts[0];
      healthData.workout = {
        type: w.type || 'Workout',
        duration: w.duration || '',
        intensity: w.calories > 400 ? 'High' : w.calories > 200 ? 'Moderate' : 'Low',
        time: w.time || '',
        fromHealth: true,
        steps: steps || null,
        calories: w.calories || null,
      };
    } else if (steps) {
      healthData.workout = {
        type: `${steps.toLocaleString()} steps`,
        duration: '',
        intensity: steps > 10000 ? 'High' : steps > 6000 ? 'Moderate' : 'Low',
        fromHealth: true,
        steps,
      };
    }
  }

  res.status(200).json({ success: true, date, userId, data: healthData });
}
