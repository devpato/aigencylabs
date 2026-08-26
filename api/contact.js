/**
 * Contact form endpoint.
 *
 * Receives JSON from the form on the home page, validates it, and sends the
 * submission as an email through Resend (https://resend.com).
 *
 * Required environment variables (set them in Vercel, Settings > Environment Variables):
 *   RESEND_API_KEY  API key from the Resend dashboard
 *   CONTACT_TO      Where submissions are delivered, e.g. hello@theaigencylab.com
 *
 * Optional:
 *   CONTACT_FROM    Sender address on a domain verified in Resend.
 *                   Defaults to "AIgency Labs <noreply@theaigencylab.com>".
 */

const MAX = { name: 120, email: 200, company: 160, interest: 80, message: 5000 };

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Deliberately loose: real addresses are validated by whether the reply lands.
const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const clean = (value, limit) => String(value ?? '').trim().slice(0, limit);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

  // Honeypot: a real person never fills a field they cannot see. Answer 200 so
  // bots get no signal about why nothing happened.
  if (clean(body._honey, 100)) return res.status(200).json({ ok: true });

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const company = clean(body.company, MAX.company);
  const interest = clean(body.interest, MAX.interest);
  const message = clean(body.message, MAX.message);

  if (!name || !email || !interest || !message) {
    return res.status(400).json({ ok: false, error: 'Please fill in all required fields.' });
  }
  if (!looksLikeEmail(email)) {
    return res.status(400).json({ ok: false, error: 'That email address does not look right.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM || 'AIgency Labs <noreply@theaigencylab.com>';

  if (!apiKey || !to) {
    console.error('contact: missing RESEND_API_KEY or CONTACT_TO environment variable');
    return res.status(500).json({ ok: false, error: 'The form is not configured yet.' });
  }

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Company', company || 'Not given'],
    ['Interested in', interest],
  ];

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#1d1d1f">
      <h2 style="font-size:18px;margin:0 0 16px">New inquiry from theaigencylab.com</h2>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:6px 18px 6px 0;color:#6e6e73">${label}</td><td style="padding:6px 0"><strong>${escapeHtml(value)}</strong></td></tr>`
          )
          .join('')}
      </table>
      <div style="padding:16px;background:#f5f5f7;border-radius:12px;white-space:pre-wrap">${escapeHtml(message)}</div>
    </div>`;

  const text = [
    'New inquiry from theaigencylab.com',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    message,
  ].join('\n');

  try {
    const resend = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email, // replying in your inbox goes straight to the sender
        subject: `New inquiry: ${name}${company ? ` (${company})` : ''}`,
        html,
        text,
      }),
    });

    if (!resend.ok) {
      const detail = await resend.text().catch(() => '');
      console.error('contact: resend responded', resend.status, detail);
      return res.status(502).json({ ok: false, error: 'The message could not be sent.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact: request failed', err);
    return res.status(502).json({ ok: false, error: 'The message could not be sent.' });
  }
};

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
