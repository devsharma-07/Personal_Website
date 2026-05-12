// api/contact.js — Vercel Serverless Function
// Handles contact form submissions

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Log submission (replace with email service like Resend, SendGrid, etc.)
  console.log('Contact form submission:', {
    name,
    email,
    message,
    timestamp: new Date().toISOString(),
  });

  // ── Optional: Send via Resend ──────────────────────────────
  // Uncomment and add RESEND_API_KEY to your Vercel env variables
  //
  // const { Resend } = await import('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'contact@yourdomain.com',
  //   to: 'you@yourdomain.com',
  //   subject: `New inquiry from ${name}`,
  //   text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  // });

  return res.status(200).json({ success: true });
}
