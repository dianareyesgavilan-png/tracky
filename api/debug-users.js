export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(200).json({ configured: false, status: null, count: null });
  }

  try {
    const response = await fetch(`${url}/rest/v1/users?select=id&limit=20`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    const body = await response.json().catch(() => null);
    return res.status(200).json({
      configured: true,
      status: response.status,
      ok: response.ok,
      count: Array.isArray(body) ? body.length : null,
      errorCode: !response.ok && body ? body.code || null : null,
      errorMessage: !response.ok && body ? body.message || null : null,
    });
  } catch (error) {
    return res.status(200).json({ configured: true, status: null, ok: false, count: null, errorMessage: error.message });
  }
}
