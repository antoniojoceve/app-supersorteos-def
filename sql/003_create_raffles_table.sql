-- Table: public.raffles

-- DROP TABLE IF EXISTS public.raffles;

CREATE TABLE IF NOT EXISTS public.raffles
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    price_per_ticket numeric(10,2) NOT NULL,
    total_numbers integer NOT NULL,
    status text COLLATE pg_catalog."default" DEFAULT 'active'::text,
    draw_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT raffles_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.raffles
    OWNER to postgresql_supersorteos_user;