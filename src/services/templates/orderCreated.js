const base = require("./orderBase");

module.exports = ({ raffleTitle, totalAmount }) =>
  base({
    title: "Tu orden fue creada",
    message: `
      Hemos recibido tu orden para el sorteo <strong>${raffleTitle}</strong>.<br />
      Total: <strong>$${totalAmount}</strong><br />
      Estado: pendiente de aprobación.
    `,
  });
