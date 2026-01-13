const pool = require("../config/db");

const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id,
        r.title AS raffle,
        o.number,
        u.email AS user,
        o.status,
        o.created_at
      FROM orders o
      JOIN raffles r ON r.id = o.raffle_id
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ORDERS ERROR:", err);
    res.status(500).json({ error: "Error obteniendo pedidos" });
  }
};

module.exports = { getAllOrders };
