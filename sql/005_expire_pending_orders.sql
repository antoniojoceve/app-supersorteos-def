-- Expira órdenes pending más antiguas que X minutos
-- X se pasa desde el backend

WITH expired AS (
  SELECT id
  FROM orders
  WHERE payment_status = 'pending'
    AND created_at < NOW() - INTERVAL '30 minutes'
  FOR UPDATE
)
UPDATE orders
SET payment_status = 'rejected',
    reviewed_at = NOW(),
    admin_note = 'Expirada automáticamente'
WHERE id IN (SELECT id FROM expired);

-- Liberar números asociados
DELETE FROM order_numbers
WHERE order_id IN (SELECT id FROM expired);
