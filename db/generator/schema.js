const Promise = require('bluebird');

module.exports = (db) => {
  if (!db.query) {
    console.error('database has no query function');
  }

  return db.query(`
      CREATE TABLE IF NOT EXISTS pairs (
        id serial NOT NULL,
        name varchar(6) NOT NULL UNIQUE,
        major boolean NOT NULL,
        base varchar(3) NOT NULL,
        quote varchar(3) NOT NULL,
        CONSTRAINT "pairs_pkey" PRIMARY KEY (id)  
      );`)
    .then(() => (
      db.query(`
        CREATE TABLE IF NOT EXISTS ticks (
          id serial NOT NULL,
          dt timestamp with time zone NOT NULL,
          bid numeric NOT NULL,
          ask numeric NOT NULL,
          bid_vol bigint NOT NULL,
          ask_vol bigint NOT NULL,
          id_pairs integer NOT NULL,
          CONSTRAINT "ticks_pkey" PRIMARY KEY (id),
          CONSTRAINT "fk_ticks_pairs" FOREIGN KEY (id_pairs) REFERENCES pairs (id)
        );`)))
    .then(() => (
      db.query(`
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
        );`)))
    .then(() => (
      db.query(`
        CREATE UNIQUE INDEX index_s5bars_on_idpairs_and_dt
        ON s5bars 
        USING btree
        (id_pairs, dt
        );`)))
    .error(console.error);
};
