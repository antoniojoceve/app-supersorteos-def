-- Table: public.tickets

-- DROP TABLE IF EXISTS public.tickets;

CREATE TABLE IF NOT EXISTS public.tickets
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    raffle_id uuid,
    user_id uuid,
    order_id uuid,
    "number" integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT tickets_pkey PRIMARY KEY (id),
    CONSTRAINT tickets_raffle_id_number_key UNIQUE (raffle_id, "number"),
    CONSTRAINT tickets_order_id_fkey FOREIGN KEY (order_id)
        REFERENCES public.orders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT tickets_raffle_id_fkey FOREIGN KEY (raffle_id)
        REFERENCES public.raffles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.tickets
    OWNER to postgresql_supersorteos_user;