const pool = require("../config/db");

const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id,
        r.title        AS raffle_title,
        u.email        AS user_email,
        o.total_amount,
        o.payment_status,
        o.created_at
      FROM orders o
      JOIN raffles r ON r.id = o.raffle_id
      JOIN users u   ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("ORDERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const createOrder = async (req, res) => {
  const userId = req.user.id;
  const {
    raffle_id,
    numbers,
    payment_method,
    payment_reference,
    receipt_url,
  } = req.body;

  if (
    !raffle_id ||
    !Array.isArray(numbers) ||
    numbers.length === 0 ||
    !payment_method ||
    !payment_reference ||
    !receipt_url
  ) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Obtener sorteo
    const raffleRes = await client.query(
      "SELECT price_per_ticket FROM raffles WHERE id = $1",
      [raffle_id]
    );

    if (raffleRes.rows.length === 0) {
      throw new Error("Sorteo no existe");
    }

    const price = raffleRes.rows[0].price_per_ticket;

    // 2️⃣ Calcular total
    const totalAmount = price * numbers.length;

    // 3️⃣ Crear orden
    const orderRes = await client.query(
      `
      INSERT INTO orders (
        user_id,
        raffle_id,
        total_amount,
        payment_status,
        payment_method,
        payment_reference,
        receipt_url
      )
      VALUES ($1, $2, $3, 'pending', $4, $5, $6)
      RETURNING id
      `,
      [
        userId,
        raffle_id,
        totalAmount,
        payment_method,
        payment_reference,
        receipt_url,
      ]
    );

    const orderId = orderRes.rows[0].id;

    // ⛔ aquí luego irá order_numbers

    await client.query("COMMIT");

    res.status(201).json({
      message: "Orden creada correctamente",
      order_id: orderId,
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("CREATE ORDER ERROR:", err.message);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};

const approveOrder = async (req, res) => {
  const orderId = req.params.id;
  const adminId = req.user.id;

  try {
    const result = await pool.query(
      `
      UPDATE orders
      SET
        payment_status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = $1
      WHERE id = $2
        AND payment_status = 'pending'
      RETURNING id
      `,
      [adminId, orderId]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        error: "Orden no válida o ya revisada",
      });
    }

    res.json({ message: "Orden aprobada correctamente" });
  } catch (err) {
    console.error("APPROVE ORDER ERROR:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

const rejectOrder = async (req, res) => {
  const orderId = req.params.id;
  const adminId = req.user.id;
  const { admin_note } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE orders
      SET
        payment_status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = $1,
        admin_note = $2
      WHERE id = $3
        AND payment_status = 'pending'
      RETURNING id
      `,
      [adminId, admin_note || null, orderId]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        error: "Orden no válida o ya revisada",
      });
    }

    res.json({ message: "Orden rechazada correctamente" });
  } catch (err) {
    console.error("REJECT ORDER ERROR:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  approveOrder,
  rejectOrder
};
