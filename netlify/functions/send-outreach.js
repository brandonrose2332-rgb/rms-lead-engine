exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Resend API key not configured.' }) };
  }

  let body;
  try { body = JSON.parse(event.body); } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { businessName, businessType, toEmail, template, notes } = body;
  if (!businessName || !toEmail || !template) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields.' }) };
  }

  const type = businessType || 'business';
  const notesLine = notes ? `<p style="margin:0 0 20px;font-size:15px;color:#1a1917;line-height:1.6;background:#f7f6f3;border-left:3px solid #185FA5;padding:12px 16px;border-radius:0 8px 8px 0;font-style:italic;">"${notes}"</p>` : '';

  const templates = {
    thinking: {
      subject: `Following up — ${businessName}`,
      preview: 'No pressure at all — just wanted to leave this with you.',
      body: `
        <p style="margin:0 0 20px;font-size:15px;color:#1a1917;line-height:1.6;">Hey, it was great stopping by ${businessName} today.</p>
        <p style="margin:0 0 20px;font-size:15px;color:#1a1917;line-height:1.6;">I know you mentioned you'd think it over — totally makes sense. No pressure on my end at all.</p>
        ${notesLine}
        <p style="margin:0 0 20px;font-size:15px;color:#1a1917;line-height:1.6;">Just wanted to leave you with the short version: most ${type}s we work with were overpaying on processing without realizing it. We do a free side-by-side comparison of your current rates vs what we can offer — if there's no savings, I'll tell you straight up and we go our separate ways.</p>
        <p style="margin:0 0 32px;font-size:15px;color:#1a1917;line-height:1.6;">If you want to take a look, just reply here or give me a call. Happy to work around your schedule.</p>
      `
    },
    info: {
      subject: `The info you asked about — ${businessName}`,
      preview: 'Here\'s exactly how it works and what to expect.',
      body: `
        <p style="margin:0 0 20px;font-size:15px;color:#1a1917;line-height:1.6;">Great talking with you today at ${businessName} — here's the breakdown you asked for.</p>
        ${notesLine}
        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#1a1917;">How it works:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-size:14px;color:#1a1917;vertical-align:top;width:28px;">1.</td><td style="padding:10px 0 10px 4px;border-bottom:1px solid rgba(0,0,0,0.07);font-size:14px;color:#1a1917;line-height:1.5;"><strong>Free rate analysis</strong> — I pull your current processing statement and show you exactly what you're paying vs what we charge. Takes 10 minutes.</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-size:14px;color:#1a1917;vertical-align:top;">2.</td><td style="padding:10px 0 10px 4px;border-bottom:1px solid rgba(0,0,0,0.07);font-size:14px;color:#1a1917;line-height:1.5;"><strong>Zero disruption</strong> — you keep your same terminal or we provide one. Nothing changes for your customers.</td></tr>
          <tr><td style="padding:10px 0;font-size:14px;color:#1a1917;vertical-align:top;">3.</td><td style="padding:10px 0 10px 4px;font-size:14px;color:#1a1917;line-height:1.5;"><strong>Month-to-month</strong> — no long-term contracts. If you're not happy, you can leave. Simple.</td></tr>
        </table>
        <p style="margin:0 0 32px;font-size:15px;color:#1a1917;line-height:1.6;">Most ${type}s we work with save between $200–$800/month depending on volume. Happy to run the numbers on yours — just reply or call me directly.</p>
      `
    },
    close: {
      subject: `Let's get you set up — ${businessName}`,
      preview: 'Here\'s the next step to get started.',
      body: `
        <p style="margin:0 0 20px;font-size:15px;color:#1a1917;line-height:1.6;">Awesome talking with you today at ${businessName} — excited to get this moving for you.</p>
        ${notesLine}
        <p style="margin:0 0 20px;font-size:15px;color:#1a1917;line-height:1.6;">Here's exactly what happens next:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-size:14px;color:#1a1917;vertical-align:top;width:28px;">1.</td><td style="padding:10px 0 10px 4px;border-bottom:1px solid rgba(0,0,0,0.07);font-size:14px;color:#1a1917;line-height:1.5;">Send me your most recent processing statement so I can build your savings analysis.</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.07);font-size:14px;color:#1a1917;vertical-align:top;">2.</td><td style="padding:10px 0 10px 4px;border-bottom:1px solid rgba(0,0,0,0.07);font-size:14px;color:#1a1917;line-height:1.5;">I'll walk you through the comparison — usually same day or next morning.</td></tr>
          <tr><td style="padding:10px 0;font-size:14px;color:#1a1917;vertical-align:top;">3.</td><td style="padding:10px 0 10px 4px;font-size:14px;color:#1a1917;line-height:1.5;">Once you're happy with the numbers, we handle the paperwork and you're live within a few days.</td></tr>
        </table>
        <p style="margin:0 0 32px;font-size:15px;color:#1a1917;line-height:1.6;">Call or text me directly and we'll knock this out — I want to make this as easy as possible for you.</p>
      `
    }
  };

  const t = templates[template];
  if (!t) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid template.' }) };

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f7f6f3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f3;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid rgba(0,0,0,0.08);">
        <tr><td style="background:#185FA5;padding:18px 32px;">
          <span style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Real Merchant Services</span>
        </td></tr>
        <tr><td style="padding:36px 32px 28px;">
          ${t.body}
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:#185FA5;border-radius:8px;">
              <a href="tel:8134210803" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Call Brandon → 813-421-0803</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid rgba(0,0,0,0.08);margin:0;"/></td></tr>
        <tr><td style="padding:24px 32px 32px;">
          <p style="margin:0;font-size:14px;font-weight:600;color:#1a1917;">Brandon Rose</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b6a66;">Account Executive · Real Merchant Services</p>
          <p style="margin:6px 0 0;font-size:13px;color:#6b6a66;">
            <a href="tel:8134210803" style="color:#185FA5;text-decoration:none;">813-421-0803</a>
            &nbsp;·&nbsp;
            <a href="mailto:brandon.rose@realmerchantservices.com" style="color:#185FA5;text-decoration:none;">brandon.rose@realmerchantservices.com</a>
          </p>
        </td></tr>
      </table>
      <p style="margin:20px 0 0;font-size:11px;color:#9e9d99;text-align:center;">Reply with "unsubscribe" to opt out.</p>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Brandon Rose <brandon.rose@realmerchantservices.com>',
        to: [toEmail],
        subject: t.subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) return { statusCode: res.status, body: JSON.stringify({ error: data.message || 'Resend error.' }) };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true, id: data.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
