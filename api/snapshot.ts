import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    if (!id) return res.status(400).json({ error: 'Missing ID' });

    const { data, error } = await supabase
      .from('snapshots')
      .select('content')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Snapshot not found' });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Missing content' });

    const newId = Math.random().toString(36).substring(2, 10); // Generate simple unique ID

    const { error } = await supabase
      .from('snapshots')
      .insert([{ id: newId, content }]);

    if (error) return res.status(500).json({ error: 'Failed to save snapshot' });
    return res.status(200).json({ id: newId });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
