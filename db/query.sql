-- Calculated Average Price
SELECT  
    date_trunc('hour', dt) dt,
    ((array_agg(bid ORDER BY dt ASC))[1] +
     (array_agg(ask ORDER BY dt ASC))[1])/2 o,
    (MAX(bid) + MAX(ask))/2 h,
    (MIN(bid) + MIN(ask))/2 l,
    ((array_agg(bid ORDER BY dt DESC))[1] +
     (array_agg(ask ORDER BY dt DESC))[1])/2 c,
    SUM(bid_vol) bid_vol,
    SUM(ask_vol) ask_vol,
    COUNT(*) ticks
FROM EURUSD  
WHERE dt >= '2017-07-01' 
GROUP BY date_trunc('hour', dt)  
ORDER BY dt DESC
LIMIT 5;

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
-- ORDER BY dt  