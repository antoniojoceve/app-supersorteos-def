const pool = require("../config/db");
const { sendEmail } = require("../services/emailService");
const orderCreatedTemplate = require("../services/templates/orderCreated");
const orderApprovedTemplate = require("../services/templates/orderApproved");
const orderRejectedTemplate = require("../services/templates/orderRejected");

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
    ticket_count,
    payment_method,
    payment_reference,
    receipt_url,
  } = req.body;

  if (
    !raffle_id ||
    !Number.isInteger(ticket_count) ||
    ticket_count <= 0 ||
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
    const totalAmount = price * ticket_count;
;

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

    // 4️⃣ Obtener números ya ocupados
  const takenRes = await client.query(
    `
    SELECT number
    FROM order_numbers
    WHERE raffle_id = $1
    `,
    [raffle_id]
  );

  const takenNumbers = new Set(takenRes.rows.map(r => r.number));

  // 5️⃣ Obtener total de números del sorteo
  const totalNumbersRes = await client.query(
    `SELECT total_numbers FROM raffles WHERE id = $1`,
    [raffle_id]
  );

  const totalNumbers = totalNumbersRes.rows[0].total_numbers;

  // 6️⃣ Verificar disponibilidad
  if (totalNumbers - takenNumbers.size < ticket_count) {
    throw new Error("No hay suficientes números disponibles");
  }

  // 7️⃣ Generar números aleatorios únicos
  const assignedNumbers = new Set();

  while (assignedNumbers.size < ticket_count) {
    const n = Math.floor(Math.random() * totalNumbers) + 1;
    if (!takenNumbers.has(n)) {
      assignedNumbers.add(n);
    }
  }

  for (const number of assignedNumbers) {
    await client.query(
      `
      INSERT INTO order_numbers (order_id, raffle_id, number)
      VALUES ($1, $2, $3)
      `,
      [orderId, raffle_id, number]
    );
  }

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

await sendEmail({
  to: user.email,
  subject: "Orden creada - Super Sorteos",
  html: orderCreatedTemplate({
    raffleTitle: raffle.title,
    totalAmount: order.total_amount,
  }),
});

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

    await sendEmail({
      to: user.email,
      subject: "Orden aprobada - Super Sorteos",
      html: orderApprovedTemplate({
        raffleTitle: raffle.title,
        totalAmount: order.total_amount,
      }),
    });

    res.json({ message: "Orden aprobada correctamente" });
  } catch (err) {
    console.error("APPROVE ORDER ERROR:", err);
    res.status(500).json({ error: "Error interno" });
  }
};

const rejectOrder = async (req, res) => {
  const orderId = req.params.id;
  const adminId = req.user.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Verificar que la orden exista y esté pendiente
    const orderRes = await client.query(
      `
      SELECT payment_status
      FROM orders
      WHERE id = $1
      FOR UPDATE
      `,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      throw new Error("Orden no encontrada");
    }

    if (orderRes.rows[0].payment_status !== "pending") {
      throw new Error("Orden no válida o ya revisada");
    }

    // 2️⃣ Borrar números asignados (LIBERAR)
    await client.query(
      `
      DELETE FROM order_numbers
      WHERE order_id = $1
      `,
      [orderId]
    );

    // 3️⃣ Marcar orden como rechazada
    await client.query(
      `
      UPDATE orders
      SET
        payment_status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = $2
      WHERE id = $1
      `,
      [orderId, adminId]
    );

    await client.query("COMMIT");

    await sendEmail({
      to: user.email,
      subject: "Orden rechazada - Super Sorteos",
      html: orderRejectedTemplate({
        raffleTitle: raffle.title,
      }),
    });

    res.json({ message: "Orden rechazada y números liberados" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("REJECT ORDER ERROR:", err.message);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
};


module.exports = {
  getAllOrders,
  createOrder,
  approveOrder,
  rejectOrder
};
