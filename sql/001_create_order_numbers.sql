CREATE TABLE order_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  order_id  UUID NOT NULL,
  raffle_id UUID NOT NULL,

  number INT NOT NULL CHECK (number > 0),

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE order_numbers
ADD CONSTRAINT fk_order_numbers_order
FOREIGN KEY (order_id) REFERENCES orders(id)
ON DELETE CASCADE;

ALTER TABLE order_numbers
ADD CONSTRAINT fk_order_numbers_raffle
FOREIGN KEY (raffle_id) REFERENCES raffles(id);

CREATE UNIQUE INDEX unique_raffle_number
ON order_numbers (raffle_id, number);
