const { Resend } = require("resend");

const RESEND_API_KEY = process.env.RESEND_API_KEY;

let resend = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
} else {
  console.warn("⚠️ RESEND_API_KEY no definida. Emails desactivados.");
}

async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn("📧 Email NO enviado (Resend no configurado)", subject, to);
    return;
  }

  try {
    console.log("📧 Enviando email:", subject, "→", to);

    await resend.emails.send({
      from: "Resend <hello@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("✅ Email enviado correctamente:", subject);
  } catch (err) {
    console.error("❌ Error enviando email:", subject);
    console.error(err);
  }
}

module.exports = { sendEmail };
