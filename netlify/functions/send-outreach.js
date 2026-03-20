exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Resend API key not configured.' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { businessName, businessType, toEmail } = body;

  if (!businessName || !toEmail) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing businessName or toEmail.' }) };
  }

  const typeLabel = businessType || 'business';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f7f6f3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f3;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid rgba(0,0,0,0.08);">

          <!-- Header bar -->
          <tr>
            <td style="background:#185FA5;padding:18px 32px;">
              <span style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Real Merchant Services</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="margin:0 0 20px;font-size:15px;color:#1a1917;line-height:1.6;">
                Hi ${businessName} team,
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#1a1917;line-height:1.6;">
                My name is Brandon Rose and I work with Real Merchant Services. We specialize in helping ${typeLabel}s like yours reduce what you're paying in credit card processing fees — often saving business owners <strong>hundreds to thousands of dollars a year</strong> with zero disruption to how you currently operate.
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#1a1917;line-height:1.6;">
                I'd love to stop by for a quick 10-minute conversation to show you what we're doing for other ${typeLabel}s in the area. No pressure — just a free analysis of your current rates so you can see if there's savings on the table.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#1a1917;line-height:1.6;">
                Would that work for you this week?
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#185FA5;border-radius:8px;">
                    <a href="mailto:brandon.rose@realmerchantservices.com?subject=Yes, let's connect"
                       style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.02em;">
                      Reply to connect →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid rgba(0,0,0,0.08);margin:0;" />
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:24px 32px 32px;">
              <p style="margin:0;font-size:14px;font-weight:600;color:#1a1917;">Brandon Rose</p>
              <p style="margin:4px 0 0;font-size:13px;color:#6b6a66;">Account Executive · Real Merchant Services</p>
              <p style="margin:6px 0 0;font-size:13px;color:#6b6a66;">
                <a href="tel:8134210803" style="color:#185FA5;text-decoration:none;">813-421-0803</a>
                &nbsp;·&nbsp;
                <a href="mailto:brandon.rose@realmerchantservices.com" style="color:#185FA5;text-decoration:none;">brandon.rose@realmerchantservices.com</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <p style="margin:20px 0 0;font-size:11px;color:#9e9d99;text-align:center;">
          You're receiving this because your business was identified as a potential fit for our services.<br/>
          To opt out, reply with "unsubscribe" and we'll remove you immediately.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + resendKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Brandon Rose <brandon.rose@realmerchantservices.com>',
        to: [toEmail],
        subject: 'Quick question for ' + businessName,
        html: htmlBody,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: data.message || 'Resend error.' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, id: data.id }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
