const base = require("./orderBase");

module.exports = ({ raffleTitle, totalAmount }) =>
  base({
    title: "Tu orden fue aprobada 🎉",
    message: `
      Tu orden para el sorteo <strong>${raffleTitle}</strong> ha sido aprobada.<br />
      Total: <strong>$${totalAmount}</strong><br />
      ¡Ya estás participando oficialmente!
    `,
  });
