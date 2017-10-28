-- Calculated Average Price
-- SELECT  
--     date_trunc('hour', dt) dt,
--     ((array_agg(bid ORDER BY dt ASC))[1] +
--      (array_agg(ask ORDER BY dt ASC))[1])/2 o,
--     (MAX(bid) + MAX(ask))/2 h,
--     (MIN(bid) + MIN(ask))/2 l,
--     ((array_agg(bid ORDER BY dt DESC))[1] +
--      (array_agg(ask ORDER BY dt DESC))[1])/2 c,
--     SUM(bid_vol) bid_vol,
--     SUM(ask_vol) ask_vol,
--     COUNT(*) ticks
-- FROM EURUSD  
-- WHERE dt >= '2017-07-01' 
-- GROUP BY date_trunc('hour', dt)  
-- ORDER BY dt DESC
-- LIMIT 5;

-- Bid Price
-- SELECT  
--     date_trunc('hour', dt) dt,
--     (array_agg(bid ORDER BY dt ASC))[1] o,
--     MAX(bid) h,
--     MIN(bid) l,
--     (array_agg(bid ORDER BY dt DESC))[1] c,
--     SUM(bid_vol) bid_vol,
--     SUM(ask_vol) ask_vol,
--     COUNT(*) ticks
-- FROM EURUSD  
-- WHERE dt BETWEEN '2017-07-01' AND '2017-10-24'  
-- GROUP BY date_trunc('hour', dt)  
-- ORDER BY dt;

WITH intervals AS (
  SELECT start, start + interval '1hour' AS end
  FROM generate_series('2017-07-01 12:00', '2017-10-27 12:00', interval '1 hour') AS start)
SELECT DISTINCT
  intervals.start AS date,
  min(bid_l) OVER w AS bid_low,
  max(bid_h) OVER w AS bid_high,
  first_value(bid_o) OVER w as bid_open,
  last_value(bid_c) OVER w as bid_close,
  sum(bid_v) OVER w AS bid_vol,
  sum(ticks) OVER w AS ticks
FROM intervals 
JOIN s5bars s5 ON 
  s5.id_pairs = 1 AND
  s5.dt >= intervals.start AND
  s5.dt < intervals.end
WINDOW w AS (PARTITION BY intervals.start ORDER BY
  s5.dt ASC rows BETWEEN UNBOUNDED PRECEDING AND
  UNBOUNDED FOLLOWING)
ORDER BY intervals.start;
