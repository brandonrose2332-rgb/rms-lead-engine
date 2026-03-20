const { createClient } = require('@supabase/supabase-js');

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Database not configured.' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // GET — fetch all referrals (admin)
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ referrals: data }) };
  }

  // POST — submit a new referral
  if (event.httpMethod === 'POST') {
    let body;
    try { body = JSON.parse(event.body); } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request.' }) };
    }

    const { agentName, agentCode, businessName, ownerName, phone, email, relationship, notes } = body;
    if (!agentName || !businessName || !phone) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing required fields.' }) };
    }

    const { data, error } = await supabase.from('referrals').insert([{
      agent_name: agentName,
      agent_code: agentCode || agentName.toLowerCase().replace(/\s+/g, '-'),
      business_name: businessName,
      owner_name: ownerName || '',
      phone,
      email: email || '',
      relationship: relationship || '',
      notes: notes || '',
      status: 'New',
      monthly_residual: 0,
      commission_owed: 0,
    }]).select();

    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, referral: data[0] }) };
  }

  // PATCH — update a referral (status, residual)
  if (event.httpMethod === 'PATCH') {
    let body;
    try { body = JSON.parse(event.body); } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request.' }) };
    }

    const { id, ...updates } = body;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id.' }) };

    // Auto-calculate commission if residual updated
    if (updates.monthly_residual !== undefined) {
      updates.commission_owed = parseFloat((updates.monthly_residual * 0.20).toFixed(2));
    }

    const { data, error } = await supabase.from('referrals').update(updates).eq('id', id).select();
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, referral: data[0] }) };
  }


  // DELETE — remove a referral
  if (event.httpMethod === 'DELETE') {
    let body;
    try { body = JSON.parse(event.body); } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request.' }) };
    }
    const { id } = body;
    if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id.' }) };
    const { error } = await supabase.from('referrals').delete().eq('id', id);
    if (error) return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed.' }) };
};
