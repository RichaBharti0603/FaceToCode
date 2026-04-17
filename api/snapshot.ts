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

  const { id, userId } = req.query;

  if (req.method === 'GET') {
    // Mode A: Fetch User's Snapshots
    if (userId) {
      const { data, error } = await supabase
        .from('snapshots')
        .select('id, preview_url, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return res.status(500).json({ error: 'Search failed' });
      return res.status(200).json(data);
    }

    // Mode B: Fetch Single Snapshot
    if (!id) return res.status(400).json({ error: 'Missing parameters' });

    const { data, error } = await supabase
      .from('snapshots')
      .select('content, preview_url')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { content, user_id, preview_image } = req.body;
    if (!content) return res.status(400).json({ error: 'Missing content' });

    const newId = Math.random().toString(36).substring(2, 10);
    let preview_url = null;

    // Handle Storage Upload if preview provided
    if (preview_image) {
      try {
        const cleanBase64 = preview_image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(cleanBase64, 'base64');
        const fileName = `${user_id || 'anon'}/${newId}.png`;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('snapshots')
          .upload(fileName, imageBuffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase
            .storage
            .from('snapshots')
            .getPublicUrl(fileName);
          preview_url = publicUrlData.publicUrl;
        }
      } catch (err) {
        console.error("Storage upload error:", err);
      }
    }

    const { error } = await supabase
      .from('snapshots')
      .insert([{ 
        id: newId, 
        content, 
        user_id: user_id || null,
        preview_url: preview_url
      }]);

    if (error) return res.status(500).json({ error: 'Save failed' });
    return res.status(200).json({ id: newId, preview_url });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
