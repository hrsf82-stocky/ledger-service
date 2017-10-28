CREATE MATERIALIZED VIEW eurusd_m1
AS
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
  ORDER BY intervals.start
WITH DATA;
