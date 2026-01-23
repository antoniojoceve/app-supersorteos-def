const { sendEmail } = require("./emailService");
const orderExpiredTemplate = require("./templates/orderExpired");
const base = require("./orderBase");

module.exports = ({ raffleTitle }) =>
  base({
    title: "Tu orden expiró",
    message: `
      Tu orden para el sorteo <strong>${raffleTitle}</strong> expiró por falta de confirmación.<br />
      Los números reservados han sido liberados.
    `,
  });