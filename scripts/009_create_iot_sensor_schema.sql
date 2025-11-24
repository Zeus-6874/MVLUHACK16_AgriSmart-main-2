-- Phase 2: IoT Sensor Integration Database Schema
-- This migration adds tables for IoT sensor management, real-time monitoring, and automated irrigation

-- IoT sensors table for sensor device management
CREATE TABLE IF NOT EXISTS public.iot_sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES public.farmers(id),
  field_id UUID REFERENCES public.fields(id),
  sensor_type TEXT NOT NULL, -- moisture, temperature, ph, humidity, light, nitrogen
  sensor_id TEXT UNIQUE NOT NULL, -- Physical sensor identifier from manufacturer
  sensor_model TEXT,
  manufacturer TEXT,
  location JSONB, -- GPS coordinates within field
  installation_date DATE,
  last_maintenance DATE,
  status TEXT DEFAULT 'active', -- active, inactive, maintenance, error
  battery_level DECIMAL, -- Battery level percentage (0-100)
  signal_strength DECIMAL, -- Signal strength (RSSI or similar metric)
  calibration_data JSONB, -- Sensor calibration information
  configuration JSONB, -- Sensor configuration settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor readings table for time-series sensor data
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES public.iot_sensors(id),
  reading_value DECIMAL NOT NULL, -- The actual sensor reading
  unit TEXT, -- Unit of measurement (%, °C, ppm, etc.)
  raw_data JSONB, -- Raw sensor data for advanced analysis
  quality_score DECIMAL DEFAULT 1.0, -- Data quality assessment (0-1)
  anomaly_detected BOOLEAN DEFAULT FALSE, -- Flag for detected anomalies
  anomaly_details JSONB, -- Details about detected anomalies
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor alerts table for threshold-based notifications
CREATE TABLE IF NOT EXISTS public.sensor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES public.iot_sensors(id),
  alert_type TEXT NOT NULL, -- threshold, offline, low_battery, anomaly
  severity TEXT DEFAULT 'medium', -- low, medium, high, critical
  message TEXT,
  threshold_value DECIMAL, -- The threshold that was crossed
  current_value DECIMAL, -- The current reading that triggered alert
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Irrigation schedules table for automated irrigation management
CREATE TABLE IF NOT EXISTS public.irrigation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES public.fields(id),
  sensor_id UUID REFERENCES public.iot_sensors(id), -- Sensor that triggers irrigation
  schedule_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- moisture_threshold, time_based, weather_based
  threshold_value DECIMAL, -- Moisture level threshold
  duration_minutes INTEGER, -- Irrigation duration in minutes
  flow_rate DECIMAL, -- Water flow rate in liters per minute
  water_amount DECIMAL, -- Total water amount in liters
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  configuration JSONB, -- Additional configuration parameters
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Irrigation logs table for tracking irrigation events
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.irrigation_schedules(id),
  field_id UUID REFERENCES public.fields(id),
  sensor_reading_before DECIMAL, -- Sensor reading before irrigation
  sensor_reading_after DECIMAL, -- Sensor reading after irrigation
  duration_minutes INTEGER, -- Actual irrigation duration
  water_amount DECIMAL, -- Actual water used in liters
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'completed', -- scheduled, running, completed, failed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor types configuration table
CREATE TABLE IF NOT EXISTS public.sensor_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_name TEXT UNIQUE NOT NULL,
  description TEXT,
  unit TEXT,
  min_value DECIMAL,
  max_value DECIMAL,
  optimal_min DECIMAL,
  optimal_max DECIMAL,
  default_threshold_low DECIMAL,
  default_threshold_high DECIMAL,
  calibration_frequency INTEGER, -- Days between calibrations
  battery_life_days INTEGER,
  icon TEXT,
  color TEXT
);

-- Insert default sensor types
INSERT INTO public.sensor_types (type_name, description, unit, min_value, max_value, optimal_min, optimal_max, default_threshold_low, default_threshold_high, calibration_frequency, battery_life_days, icon, color) VALUES
('moisture', 'Soil moisture content sensor', '%', 0, 100, 30, 70, 20, 80, 90, 365, 'droplets', 'blue'),
('temperature', 'Soil temperature sensor', '°C', -10, 60, 18, 28, 10, 35, 180, 730, 'thermometer', 'red'),
('ph', 'Soil pH level sensor', 'pH', 0, 14, 6.0, 7.5, 5.5, 8.5, 90, 365, 'flask', 'yellow'),
('humidity', 'Air humidity sensor', '%', 0, 100, 40, 70, 30, 80, 180, 730, 'cloud', 'cyan'),
('light', 'Light intensity sensor', 'lux', 0, 100000, 20000, 50000, 5000, 70000, 180, 365, 'sun', 'orange'),
('nitrogen', 'Soil nitrogen sensor', 'ppm', 0, 1000, 50, 200, 30, 300, 90, 365, 'leaf', 'green')
ON CONFLICT (type_name) DO NOTHING;

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_iot_sensors_farmer_id ON public.iot_sensors(farmer_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_field_id ON public.iot_sensors(field_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_sensor_type ON public.iot_sensors(sensor_type);
CREATE INDEX IF NOT EXISTS idx_iot_sensors_status ON public.iot_sensors(status);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON public.sensor_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_anomaly ON public.sensor_readings(anomaly_detected);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_sensor_id ON public.sensor_alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_severity ON public.sensor_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_sensor_alerts_acknowledged ON public.sensor_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_irrigation_schedules_field_id ON public.irrigation_schedules(field_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_schedules_next_run ON public.irrigation_schedules(next_run);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_field_id ON public.irrigation_logs(field_id);
CREATE INDEX IF NOT EXISTS idx_irrigation_logs_start_time ON public.irrigation_logs(start_time);

-- Enable Row Level Security (RLS)
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for IoT sensors table
CREATE POLICY "farmers_own_iot_sensors" ON public.iot_sensors FOR ALL USING (farmer_id = auth.uid());

-- RLS policies for sensor readings table
CREATE POLICY "farmers_own_sensor_readings" ON public.sensor_readings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.iot_sensors
    WHERE public.iot_sensors.id = public.sensor_readings.sensor_id
    AND public.iot_sensors.farmer_id = auth.uid()
  )
);

-- RLS policies for sensor alerts table
CREATE POLICY "farmers_own_sensor_alerts" ON public.sensor_alerts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.iot_sensors
    WHERE public.iot_sensors.id = public.sensor_alerts.sensor_id
    AND public.iot_sensors.farmer_id = auth.uid()
  )
);

-- RLS policies for irrigation schedules table
CREATE POLICY "farmers_own_irrigation_schedules" ON public.irrigation_schedules FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.fields
    WHERE public.fields.id = public.irrigation_schedules.field_id
    AND public.fields.farmer_id = auth.uid()
  )
);

-- RLS policies for irrigation logs table
CREATE POLICY "farmers_own_irrigation_logs" ON public.irrigation_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.fields
    WHERE public.fields.id = public.irrigation_logs.field_id
    AND public.fields.farmer_id = auth.uid()
  )
);

-- RLS policies for sensor types table (read-only for all authenticated users)
CREATE POLICY "authenticated_users_can_read_sensor_types" ON public.sensor_types FOR SELECT USING (auth.role() = 'authenticated');

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_iot_sensors_updated_at BEFORE UPDATE ON public.iot_sensors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_irrigation_schedules_updated_at BEFORE UPDATE ON public.irrigation_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for automatic sensor health monitoring
CREATE OR REPLACE FUNCTION check_sensor_health()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for sensors that haven't reported in the last 24 hours
  UPDATE public.iot_sensors
  SET status = 'offline'
  WHERE status = 'active'
  AND id NOT IN (
    SELECT DISTINCT sensor_id
    FROM public.sensor_readings
    WHERE timestamp >= NOW() - INTERVAL '24 hours'
  );

  -- Re-activate sensors that have started reporting again
  UPDATE public.iot_sensors
  SET status = 'active'
  WHERE status = 'offline'
  AND id IN (
    SELECT DISTINCT sensor_id
    FROM public.sensor_readings
    WHERE timestamp >= NOW() - INTERVAL '1 hour'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run sensor health check periodically (this would typically be handled by a cron job)
-- CREATE TRIGGER sensor_health_check_trigger
--   AFTER INSERT ON public.sensor_readings
--   FOR EACH ROW EXECUTE FUNCTION check_sensor_health();

-- Add constraint to ensure sensor_id format is valid
ALTER TABLE public.iot_sensors ADD CONSTRAINT valid_sensor_id_format
  CHECK (sensor_id ~ '^[A-Za-z0-9_-]{8,20}$');

-- Add check constraints for data quality score
ALTER TABLE public.sensor_readings ADD CONSTRAINT valid_quality_score
  CHECK (quality_score >= 0 AND quality_score <= 1);

-- Add check constraint for battery level
ALTER TABLE public.iot_sensors ADD CONSTRAINT valid_battery_level
  CHECK (battery_level IS NULL OR (battery_level >= 0 AND battery_level <= 100));