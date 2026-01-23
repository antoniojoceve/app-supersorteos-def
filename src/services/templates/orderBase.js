module.exports = function orderBaseTemplate({ title, message }) {
  return `
    <div style="font-family: Arial, sans-serif; background:#111; color:#fff; padding:20px">
      <h2>${title}</h2>
      <p>${message}</p>
      <p style="margin-top:20px; font-size:12px; color:#aaa">
        Super Sorteos
      </p>
    </div>
  `;
};
