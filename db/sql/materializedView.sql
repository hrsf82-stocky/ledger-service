CREATE MATERIALIZED VIEW eurusd_m1
AS
  WITH intervals AS (
    SELECT start, start + interval '1 minute' AS end
  FROM generate_series(current_date - interval '1 month', current_date, interval '1 minute') AS start)
  SELECT DISTINCT
    intervals.start AS dt,
    min(bid_l) OVER w AS bid_l,
    max(bid_h) OVER w AS bid_h,
    first_value(bid_o) OVER w as bid_o,
    last_value(bid_c) OVER w as bid_c,
    sum(bid_v) OVER w AS bid_v,
    min(ask_l) OVER w AS ask_l,
    max(ask_h) OVER w AS ask_h,
    first_value(ask_o) OVER w as ask_o,
    last_value(ask_c) OVER w as ask_c,
    sum(ask_v) OVER w AS ask_v,
    min((bid_l + ask_l) / 2) OVER w AS mid_l,
    max((bid_h + ask_h) / 2) OVER w AS mid_h,
    first_value((bid_o + ask_o) / 2) OVER w as mid_o,
    last_value((bid_c + ask_c) / 2) OVER w as mid_c,
    sum((bid_v + ask_v) / 2) OVER w AS mid_v,
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