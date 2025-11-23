-- Updated sample data to match new schema requirements
-- Insert sample encyclopedia data
INSERT INTO public.encyclopedia (crop_name, scientific_name, description, planting_season, harvest_time, water_requirements, soil_type, fertilizer_needs, common_diseases, prevention_tips) VALUES
('Rice', 'Oryza sativa', 'Rice is a staple cereal grain and one of the most important food crops worldwide.', 'Monsoon (June-July)', '3-4 months', 'High water requirement, flooded fields', 'Clay loam, well-drained', 'NPK 120:60:40 kg/ha', ARRAY['Blast', 'Brown spot', 'Sheath blight'], ARRAY['Use certified seeds', 'Proper water management', 'Balanced fertilization']),
('Wheat', 'Triticum aestivum', 'Wheat is a cereal grain that is a worldwide staple food.', 'Winter (November-December)', '4-5 months', 'Moderate water requirement', 'Well-drained loamy soil', 'NPK 120:60:40 kg/ha', ARRAY['Rust', 'Smut', 'Bunt'], ARRAY['Seed treatment', 'Crop rotation', 'Timely sowing']),
('Maize', 'Zea mays', 'Maize is a cereal grain first domesticated by indigenous peoples in southern Mexico.', 'Kharif (June-July)', '3-4 months', 'Moderate to high water requirement', 'Well-drained fertile soil', 'NPK 120:60:40 kg/ha', ARRAY['Borer', 'Leaf blight', 'Rust'], ARRAY['Use resistant varieties', 'Proper spacing', 'Integrated pest management']),
('Tomato', 'Solanum lycopersicum', 'Tomato is a fruit commonly used as a vegetable in cooking.', 'Winter (October-November)', '3-4 months', 'Moderate water requirement', 'Well-drained sandy loam', 'NPK 120:80:50 kg/ha', ARRAY['Early blight', 'Late blight', 'Wilt'], ARRAY['Crop rotation', 'Drip irrigation', 'Disease-free seeds']),
('Cotton', 'Gossypium', 'Cotton is a soft, fluffy staple fiber that grows in a boll around the seeds.', 'Kharif (May-June)', '5-6 months', 'Moderate water requirement', 'Black cotton soil', 'NPK 120:60:60 kg/ha', ARRAY['Bollworm', 'Bacterial blight', 'Fusarium wilt'], ARRAY['Bt cotton varieties', 'Integrated pest management', 'Proper spacing']);

-- Insert sample schemes data
INSERT INTO public.schemes (scheme_name, description, eligibility, benefits, application_process, contact_info, state, category) VALUES
('PM-KISAN', 'Direct income support to farmers', 'Small and marginal farmers', 'Rs. 6000 per year in 3 installments', 'Online application through PM-KISAN portal', 'pmkisan.gov.in', 'All India', 'Financial Support'),
('Soil Health Card', 'Soil testing and nutrient management', 'All farmers', 'Free soil testing and recommendations', 'Contact local agriculture office', 'soilhealth.dac.gov.in', 'All India', 'Soil Management'),
('Pradhan Mantri Fasal Bima Yojana', 'Crop insurance scheme', 'All farmers', 'Insurance coverage for crop losses', 'Through banks and insurance companies', 'pmfby.gov.in', 'All India', 'Insurance'),
('Kisan Credit Card', 'Credit facility for farmers', 'All farmers', 'Easy access to credit for farming needs', 'Through banks and cooperative societies', 'kcc.gov.in', 'All India', 'Credit'),
('National Mission for Sustainable Agriculture', 'Sustainable farming practices', 'All farmers', 'Technical support and subsidies', 'Through state agriculture departments', 'nmsa.dac.gov.in', 'All India', 'Sustainability');

-- Updated market prices to use price_per_quintal instead of price_per_kg
INSERT INTO public.market_prices (crop_name, market_name, price_per_quintal, date, state, district) VALUES
('Rice', 'Delhi Mandi', 2550.00, CURRENT_DATE, 'Delhi', 'New Delhi'),
('Wheat', 'Mumbai APMC', 2200.00, CURRENT_DATE, 'Maharashtra', 'Mumbai'),
('Maize', 'Bangalore Market', 1875.00, CURRENT_DATE, 'Karnataka', 'Bangalore'),
('Rice', 'Kolkata Market', 2400.00, CURRENT_DATE, 'West Bengal', 'Kolkata'),
('Wheat', 'Pune APMC', 2150.00, CURRENT_DATE, 'Maharashtra', 'Pune'),
('Tomato', 'Chennai Market', 4500.00, CURRENT_DATE, 'Tamil Nadu', 'Chennai'),
('Cotton', 'Ahmedabad APMC', 5600.00, CURRENT_DATE, 'Gujarat', 'Ahmedabad'),
('Onion', 'Nashik Market', 3800.00, CURRENT_DATE, 'Maharashtra', 'Nashik'),
('Potato', 'Agra Mandi', 1800.00, CURRENT_DATE, 'Uttar Pradesh', 'Agra'),
('Sugarcane', 'Lucknow Market', 350.00, CURRENT_DATE, 'Uttar Pradesh', 'Lucknow');

-- Insert sample weather data
INSERT INTO public.weather_data (location, temperature, humidity, rainfall, wind_speed, weather_condition, date) VALUES
('Delhi', 28.5, 65.0, 0.0, 12.5, 'Partly Cloudy', CURRENT_DATE),
('Mumbai', 32.0, 78.0, 2.5, 15.0, 'Light Rain', CURRENT_DATE),
('Bangalore', 26.0, 60.0, 0.0, 8.0, 'Clear', CURRENT_DATE),
('Kolkata', 30.0, 72.0, 1.0, 10.0, 'Cloudy', CURRENT_DATE),
('Chennai', 33.0, 75.0, 0.0, 18.0, 'Hot', CURRENT_DATE),
('Pune', 29.0, 58.0, 0.0, 9.0, 'Clear', CURRENT_DATE),
('Ahmedabad', 35.0, 45.0, 0.0, 14.0, 'Hot', CURRENT_DATE),
('Hyderabad', 31.0, 62.0, 0.0, 11.0, 'Partly Cloudy', CURRENT_DATE);

-- Insert sample crop varieties data
INSERT INTO public.crop_varieties (variety_name, quality_grade) VALUES
('Basmati 1121', 'A'),
('IR64', 'B'),
('Sona Masuri', 'A'),
('HD-2967', 'A'),
('WH-147', 'B'),
('Lokvan', 'A'),
('Pioneer 30V92', 'A'),
('DKC61-69', 'B');
