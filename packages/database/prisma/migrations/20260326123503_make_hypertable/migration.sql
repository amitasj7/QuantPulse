-- Turn the price_history table into a TimescaleDB hypertable
-- partitioned by the 'timestamp' column
SELECT create_hypertable('price_history', 'timestamp');