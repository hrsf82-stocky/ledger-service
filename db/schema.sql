DROP TABLE IF EXISTS EURUSD;

CREATE TABLE EURUSD (
  dt timestamp without time zone NOT NULL,
  bid numeric NOT NULL,
  ask numeric NOT NULL,
  bid_vol bigint,
  ask_vol bigint,
  CONSTRAINT "PKey" PRIMARY KEY (dt)  
);

-- SET DateStyle = 'ISO,YMD';

-- COPY EURUSD FROM '/Users/Kenny/Dropbox/Code/javascript/HRSF82/projects/MacD/prices/EURUSD-2017_07_01-2017_10_24.csv' CSV;  

