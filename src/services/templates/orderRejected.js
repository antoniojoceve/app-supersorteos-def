const base = require("./orderBase");

module.exports = ({ raffleTitle }) =>
  base({
    title: "Tu orden fue rechazada",
    message: `
      Tu orden para el sorteo <strong>${raffleTitle}</strong> fue rechazada.<br />
      Los números reservados han sido liberados.
    `,
  });
