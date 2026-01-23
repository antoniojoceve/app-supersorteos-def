CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL,
  raffle_id UUID NOT NULL,

  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount > 0),

  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'approved', 'rejected')),

  payment_reference TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  receipt_url TEXT NOT NULL,

  admin_note TEXT,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID,

  CONSTRAINT orders_review_consistency CHECK (
    (payment_status = 'pending' AND reviewed_at IS NULL AND reviewed_by IS NULL)
    OR
    (payment_status IN ('approved', 'rejected') AND reviewed_at IS NOT NULL AND reviewed_by IS NOT NULL)
  )
);

ALTER TABLE orders
ADD CONSTRAINT fk_orders_user
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE orders
ADD CONSTRAINT fk_orders_raffle
FOREIGN KEY (raffle_id) REFERENCES raffles(id);

ALTER TABLE orders
ADD CONSTRAINT fk_orders_reviewed_by
FOREIGN KEY (reviewed_by) REFERENCES users(id);

CREATE INDEX idx_orders_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_raffle_id ON orders(raffle_id);
