const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  try {
    await resend.emails.send({
      from: "Super Sorteos <no-reply@supersorteos.com>",
      to,
      subject,
      html,
    });
  } catch (err) {
    // ⚠️ IMPORTANTE: el email NO rompe el flujo
    console.error("Error enviando email:", err);
  }
}

module.exports = { sendEmail };
