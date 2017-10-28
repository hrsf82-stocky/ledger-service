DROP TABLE IF EXISTS eurusd CASCADE;
DROP TABLE IF EXISTS pairs CASCADE;
DROP TABLE IF EXISTS ticks CASCADE;
DROP TABLE IF EXISTS s5bars CASCADE;

-- CREATE TABLE eurusd (
--   dt timestamp with time zone NOT NULL,
--   bid numeric NOT NULL,
--   ask numeric NOT NULL,
--   bid_vol bigint,
--   ask_vol bigint,
--   CONSTRAINT "eurusd_pkey" PRIMARY KEY (dt)  
-- );

-- SET DateStyle = 'ISO,YMD';

-- COPY EURUSD FROM '/Users/Kenny/Dropbox/Code/javascript/HRSF82/projects/MacD/prices/EURUSD-2017_10_01-2017_10_24.csv' CSV;  

CREATE TABLE pairs (
  id serial NOT NULL,
  name varchar(6) NOT NULL UNIQUE,
  major boolean NOT NULL,
  base varchar(3) NOT NULL,
  quote varchar(3) NOT NULL,
  CONSTRAINT "pairs_pkey" PRIMARY KEY (id)  
);

CREATE TABLE ticks (
  id serial NOT NULL,
  dt timestamp with time zone NOT NULL,
  bid numeric NOT NULL,
  ask numeric NOT NULL,
  bid_vol bigint NOT NULL,
  ask_vol bigint NOT NULL,
  id_pairs integer NOT NULL,
  CONSTRAINT "ticks_pkey" PRIMARY KEY (id),
  CONSTRAINT "fk_ticks_pairs" FOREIGN KEY (id_pairs) REFERENCES pairs (id)
);

CREATE TABLE s5bars (
  id serial NOT NULL,
  dt timestamp with time zone NOT NULL,
  bid_h numeric NOT NULL,
  bid_l numeric NOT NULL,
  bid_o numeric NOT NULL,
  bid_c numeric NOT NULL,
  bid_v bigint NOT NULL,
  ask_h numeric NOT NULL,
  ask_l numeric NOT NULL,
  ask_o numeric NOT NULL,
  ask_c numeric NOT NULL,
  ask_v bigint NOT NULL,
  ticks integer NOT NULL,
  id_pairs integer NOT NULL,
  CONSTRAINT "s5bars_pkey" PRIMARY KEY (id),
  CONSTRAINT "fk_s5bars_pairs" FOREIGN KEY (id_pairs) REFERENCES pairs (id)
);

CREATE UNIQUE INDEX index_s5bars_on_idpairs_and_dt
ON s5bars 
USING btree
(id_pairs, dt);

INSERT INTO pairs (name, major, base, quote) 
VALUES ('EURUSD', TRUE, 'EUR', 'USD'), 
      ('GBPUSD', TRUE, 'GBP', 'USD'), 
      ('USDCAD', TRUE, 'USD', 'CAD'), 
      ('USDCHF', TRUE, 'USD', 'CHF'), 
      ('USDJPY', TRUE, 'USD', 'JPY'), 
      ('EURGBP', TRUE, 'EUR', 'GBP'), 
      ('EURCHF', TRUE, 'EUR', 'CHF'), 
      ('AUDUSD', TRUE, 'AUD', 'USD'), 
      ('EURJPY', TRUE, 'EUR', 'JPY'), 
      ('GBPJPY', TRUE, 'GBP', 'JPY');
