-- MediCompare Production Seed Data

-- Clear existing data if re-seeding
TRUNCATE TABLE price_history, searches, favorites, pharmacy_inventory, medicines, pharmacies, profiles CASCADE;

-- 1. Profiles (Admin & Demo User)
INSERT INTO profiles (id, name, email, password_hash, phone, city, pincode, role) VALUES
  ('aa000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@medicompare.com', '$2b$10$IK3wsWE4oFYrKavDvceyDO0N70JThMWu/pUTpvZWz24W0QU1LqnAS', '+91 98765 43210', 'Bengaluru', '560001', 'admin'),
  ('aa000000-0000-0000-0000-000000000002', 'Rahul Sharma', 'user@medicompare.com', '$2b$10$yqb0N9/yCs/peSmXuHPnd.Do.pxv6ZLK5QEScEjhk6whrIVufDl96', '+91 98123 45678', 'Bengaluru', '560038', 'user');

-- 2. Medicines (Valid Hexadecimal UUIDs starting with bb...)
INSERT INTO medicines (id, name, brand_name, generic_name, composition, strength, dosage_form, pack_size, prescription_required) VALUES
  ('bb000000-0000-0000-0000-000000000001', 'Paracetamol 500 mg Tablet', 'Crocin 500 / Calpol 500', 'Paracetamol / Acetaminophen', 'Paracetamol IP 500 mg', '500 mg', 'Tablet', 'Pack of 10', FALSE),
  ('bb000000-0000-0000-0000-000000000002', 'Paracetamol 650 mg Tablet', 'Dolo 650 / Calpol 650', 'Paracetamol / Acetaminophen', 'Paracetamol IP 650 mg', '650 mg', 'Tablet', 'Pack of 15', FALSE),
  ('bb000000-0000-0000-0000-000000000003', 'Paracetamol 250 mg / 5ml Oral Suspension', 'Calpol Pead Suspension', 'Paracetamol', 'Paracetamol IP 250 mg per 5 ml', '250 mg / 5ml', 'Oral Suspension', '60 ml Bottle', FALSE),
  ('bb000000-0000-0000-0000-000000000004', 'Pantoprazole 40 mg Gastro-Resistant Tablet', 'Pan 40 / Pantocid 40', 'Pantoprazole Sodium', 'Pantoprazole Sodium IP 40 mg', '40 mg', 'Tablet', 'Pack of 15', TRUE),
  ('bb000000-0000-0000-0000-000000000005', 'Pantoprazole 40 mg + Domperidone 30 mg SR Capsule', 'Pan-D / Pantocid-D SR', 'Pantoprazole + Domperidone', 'Pantoprazole 40 mg + Domperidone 30 mg', '40 mg + 30 mg', 'Capsule', 'Pack of 10', TRUE),
  ('bb000000-0000-0000-0000-000000000006', 'Metformin 500 mg Prolonged Release Tablet', 'Glycomet 500 SR', 'Metformin Hydrochloride', 'Metformin Hydrochloride IP 500 mg', '500 mg', 'Tablet', 'Pack of 20', TRUE),
  ('bb000000-0000-0000-0000-000000000007', 'Metformin 1000 mg Prolonged Release Tablet', 'Glycomet 1000 SR', 'Metformin Hydrochloride', 'Metformin Hydrochloride IP 1000 mg', '1000 mg', 'Tablet', 'Pack of 15', TRUE),
  ('bb000000-0000-0000-0000-000000000008', 'Cetirizine 10 mg Tablet', 'Cetzine / Okacet', 'Cetirizine Hydrochloride', 'Cetirizine Dihydrochloride IP 10 mg', '10 mg', 'Tablet', 'Pack of 10', FALSE),
  ('bb000000-0000-0000-0000-000000000009', 'Montelukast 10 mg + Levocetirizine 5 mg Tablet', 'Montair-LC / Telekast-L', 'Montelukast Sodium + Levocetirizine', 'Montelukast 10 mg + Levocetirizine 5 mg', '10 mg + 5 mg', 'Tablet', 'Pack of 10', TRUE),
  ('bb000000-0000-0000-0000-000000000010', 'Azithromycin 500 mg Tablet', 'Azee 500 / Azithral 500', 'Azithromycin Dihydrate', 'Azithromycin Dihydrate IP 500 mg', '500 mg', 'Tablet', 'Pack of 5', TRUE),
  ('bb000000-0000-0000-0000-000000000011', 'Amoxicillin 500 mg + Clavulanic Acid 125 mg Tablet', 'Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', 'Amoxicillin Trihydrate 500 mg + Potassium Clavulanate 125 mg', '625 mg', 'Tablet', 'Pack of 10', TRUE),
  ('bb000000-0000-0000-0000-000000000012', 'Telmisartan 40 mg Tablet', 'Telma 40 / Telmikind 40', 'Telmisartan', 'Telmisartan IP 40 mg', '40 mg', 'Tablet', 'Pack of 15', TRUE),
  ('bb000000-0000-0000-0000-000000000013', 'Atorvastatin 10 mg Tablet', 'Atorva 10 / Storvas 10', 'Atorvastatin Calcium', 'Atorvastatin Calcium IP 10 mg', '10 mg', 'Tablet', 'Pack of 15', TRUE),
  ('bb000000-0000-0000-0000-000000000014', 'Salbutamol 100 mcg Inhaler', 'Asthalin Inhaler', 'Salbutamol / Albuterol', 'Salbutamol Sulphate IP 100 mcg per actuation', '100 mcg', 'Inhaler', '200 Metred Doses', TRUE),
  ('bb000000-0000-0000-0000-000000000015', 'Omeprazole 20 mg Gastro-Resistant Capsule', 'Omez 20', 'Omeprazole', 'Omeprazole IP 20 mg', '20 mg', 'Capsule', 'Pack of 20', TRUE),
  ('bb000000-0000-0000-0000-000000000016', 'Ibuprofen 400 mg Tablet', 'Brufen 400', 'Ibuprofen', 'Ibuprofen IP 400 mg', '400 mg', 'Tablet', 'Pack of 15', FALSE);

-- 3. Pharmacies (Valid Hexadecimal UUIDs starting with cc...)
INSERT INTO pharmacies (id, name, address, city, pincode, latitude, longitude, phone, opening_time, closing_time, rating, delivery_available, pickup_available) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'Apollo Pharmacy — 100ft Road', 'No. 742, 100 Feet Rd, HAL 2nd Stage, Indiranagar', 'Bengaluru', '560038', 12.9784, 77.6408, '+91 80 2521 1122', '07:00:00', '23:30:00', 4.8, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000002', 'MedPlus Pharmacy — 80ft Road', 'Shop 14, 4th Block, 80 Feet Road, Koramangala', 'Bengaluru', '560034', 12.9352, 77.6245, '+91 80 4120 4455', '08:00:00', '23:00:00', 4.6, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000003', 'Wellness Forever 24/7', 'Ground Floor, Prestige Meridian, M.G. Road', 'Bengaluru', '560001', 12.9756, 77.6097, '+91 80 6789 0000', '00:00:00', '23:59:59', 4.9, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000004', 'Guardian Pharmacy — HSR Sector 2', '27th Main, Sector 2, HSR Layout', 'Bengaluru', '560102', 12.9121, 77.6446, '+91 80 2572 8899', '08:30:00', '22:30:00', 4.4, FALSE, TRUE),
  ('cc000000-0000-0000-0000-000000000005', 'Jan Aushadhi Kendra (Govt Generic Store)', 'Community Centre, 4th Block, Jayanagar', 'Bengaluru', '560011', 12.9250, 77.5938, '+91 80 2663 3344', '09:00:00', '20:00:00', 4.7, FALSE, TRUE),
  ('cc000000-0000-0000-0000-000000000006', 'Frank Ross Pharmacy — Whitefield Main Rd', 'ITPB Main Road, Whitefield', 'Bengaluru', '560066', 12.9698, 77.7500, '+91 80 4321 8765', '08:00:00', '22:00:00', 4.3, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000007', 'Sanjeevani Chemist — Outer Circle CP', 'G-12, Outer Circle, Connaught Place', 'New Delhi', '110001', 28.6315, 77.2167, '+91 11 2341 5566', '08:00:00', '23:00:00', 4.5, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000008', 'Fortis HealthWorld Pharmacy', 'E-Block, South Extension Part II', 'New Delhi', '110049', 28.5714, 77.2215, '+91 11 4655 7788', '07:30:00', '23:30:00', 4.7, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000009', 'Noble Plus Chemist & Druggist', 'Hill Road, Near Bandra Station, Bandra West', 'Mumbai', '400050', 19.0596, 72.8295, '+91 22 2640 1234', '07:00:00', '23:59:59', 4.8, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000010', 'Lifecare Chemist — Andheri East', 'Chakala Road, Andheri East', 'Mumbai', '400069', 19.1136, 72.8697, '+91 22 2838 9988', '08:00:00', '22:30:00', 4.4, TRUE, TRUE);

-- 4. Pharmacy Inventory
-- Paracetamol 500 mg Tablet (Pack of 10) - MRP: 22.00
INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, price, mrp, availability, stock_quantity, delivery_available, pickup_available) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', 20.00, 22.00, 'in_stock', 150, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000001', 18.50, 22.00, 'in_stock', 85, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000001', 22.00, 22.00, 'in_stock', 300, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000001', 17.00, 22.00, 'limited_stock', 12, FALSE, TRUE),
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000001', 7.50, 22.00, 'in_stock', 500, FALSE, TRUE), -- Jan Aushadhi (high savings!)
  ('cc000000-0000-0000-0000-000000000006', 'bb000000-0000-0000-0000-000000000001', 19.50, 22.00, 'in_stock', 60, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000007', 'bb000000-0000-0000-0000-000000000001', 19.00, 22.00, 'in_stock', 120, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000009', 'bb000000-0000-0000-0000-000000000001', 21.00, 22.00, 'in_stock', 90, TRUE, TRUE);

-- Paracetamol 650 mg Tablet (Pack of 15) - MRP: 34.00
INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, price, mrp, availability, stock_quantity, delivery_available, pickup_available) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000002', 31.00, 34.00, 'in_stock', 220, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000002', 29.50, 34.00, 'in_stock', 140, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000002', 33.50, 34.00, 'in_stock', 180, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000002', 28.00, 34.00, 'in_stock', 45, FALSE, TRUE),
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000002', 12.00, 34.00, 'in_stock', 400, FALSE, TRUE),
  ('cc000000-0000-0000-0000-000000000006', 'bb000000-0000-0000-0000-000000000002', 30.00, 34.00, 'out_of_stock', 0, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000008', 'bb000000-0000-0000-0000-000000000002', 32.00, 34.00, 'in_stock', 95, TRUE, TRUE);

-- Pantoprazole 40 mg Tablet (Pack of 15) - MRP: 155.00
INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, price, mrp, availability, stock_quantity, delivery_available, pickup_available) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000004', 139.50, 155.00, 'in_stock', 60, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000004', 128.00, 155.00, 'in_stock', 40, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000004', 148.00, 155.00, 'in_stock', 110, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000004', 122.00, 155.00, 'limited_stock', 8, FALSE, TRUE),
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000004', 45.00, 155.00, 'in_stock', 250, FALSE, TRUE),
  ('cc000000-0000-0000-0000-000000000006', 'bb000000-0000-0000-0000-000000000004', 135.00, 155.00, 'in_stock', 30, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000007', 'bb000000-0000-0000-0000-000000000004', 133.00, 155.00, 'in_stock', 55, TRUE, TRUE);

-- Metformin 500 mg PR (Pack of 20) - MRP: 58.00
INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, price, mrp, availability, stock_quantity, delivery_available, pickup_available) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000006', 52.00, 58.00, 'in_stock', 90, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000006', 48.00, 58.00, 'in_stock', 70, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000006', 56.00, 58.00, 'in_stock', 150, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000006', 46.50, 58.00, 'in_stock', 35, FALSE, TRUE),
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000006', 18.00, 58.00, 'in_stock', 320, FALSE, TRUE),
  ('cc000000-0000-0000-0000-000000000006', 'bb000000-0000-0000-0000-000000000006', 50.00, 58.00, 'in_stock', 40, TRUE, TRUE);

-- Cetirizine 10 mg (Pack of 10) - MRP: 25.00
INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, price, mrp, availability, stock_quantity, delivery_available, pickup_available) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000008', 22.50, 25.00, 'in_stock', 120, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000008', 21.00, 25.00, 'in_stock', 80, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000008', 24.50, 25.00, 'in_stock', 160, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000004', 'bb000000-0000-0000-0000-000000000008', 19.50, 25.00, 'limited_stock', 15, FALSE, TRUE),
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000008', 9.00, 25.00, 'in_stock', 400, FALSE, TRUE);

-- Azithromycin 500 mg (Pack of 5) - MRP: 130.00
INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, price, mrp, availability, stock_quantity, delivery_available, pickup_available) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000010', 118.00, 130.00, 'in_stock', 75, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000010', 112.00, 130.00, 'in_stock', 50, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000010', 125.00, 130.00, 'in_stock', 90, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000010', 48.00, 130.00, 'in_stock', 180, FALSE, TRUE);

-- Augmentin 625 Duo (Pack of 10) - MRP: 220.00
INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, price, mrp, availability, stock_quantity, delivery_available, pickup_available) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000011', 198.00, 220.00, 'in_stock', 40, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000011', 188.00, 220.00, 'in_stock', 35, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000011', 210.00, 220.00, 'in_stock', 70, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000011', 85.00, 220.00, 'in_stock', 120, FALSE, TRUE);

-- Telmisartan 40 mg (Pack of 15) - MRP: 110.00
INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, price, mrp, availability, stock_quantity, delivery_available, pickup_available) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000012', 98.00, 110.00, 'in_stock', 85, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000012', 92.00, 110.00, 'in_stock', 60, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000012', 105.00, 110.00, 'in_stock', 100, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000012', 32.00, 110.00, 'in_stock', 200, FALSE, TRUE);

-- Salbutamol 100 mcg Inhaler - MRP: 175.00
INSERT INTO pharmacy_inventory (pharmacy_id, medicine_id, price, mrp, availability, stock_quantity, delivery_available, pickup_available) VALUES
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000014', 162.00, 175.00, 'in_stock', 45, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000014', 155.00, 175.00, 'in_stock', 30, TRUE, TRUE),
  ('cc000000-0000-0000-0000-000000000003', 'bb000000-0000-0000-0000-000000000014', 170.00, 175.00, 'in_stock', 55, TRUE, TRUE);

-- 5. Price History (Simulated 7d, 30d, 90d trends for Paracetamol 500 mg and Pantoprazole 40 mg)
INSERT INTO price_history (pharmacy_id, medicine_id, price, recorded_at) VALUES
  -- Paracetamol 500 mg at Apollo
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', 21.50, NOW() - INTERVAL '90 days'),
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', 21.00, NOW() - INTERVAL '60 days'),
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', 20.50, NOW() - INTERVAL '30 days'),
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', 20.00, NOW() - INTERVAL '7 days'),
  ('cc000000-0000-0000-0000-000000000001', 'bb000000-0000-0000-0000-000000000001', 20.00, NOW()),

  -- Paracetamol 500 mg at MedPlus
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000001', 20.00, NOW() - INTERVAL '90 days'),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000001', 19.50, NOW() - INTERVAL '60 days'),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000001', 19.00, NOW() - INTERVAL '30 days'),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000001', 18.50, NOW() - INTERVAL '7 days'),
  ('cc000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000001', 18.50, NOW()),

  -- Paracetamol 500 mg at Jan Aushadhi
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000001', 7.50, NOW() - INTERVAL '90 days'),
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000001', 7.50, NOW() - INTERVAL '30 days'),
  ('cc000000-0000-0000-0000-000000000005', 'bb000000-0000-0000-0000-000000000001', 7.50, NOW());

-- 6. Favorites for demo user
INSERT INTO favorites (user_id, medicine_id, pharmacy_id) VALUES
  ('aa000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000001', NULL),
  ('aa000000-0000-0000-0000-000000000002', 'bb000000-0000-0000-0000-000000000006', NULL),
  ('aa000000-0000-0000-0000-000000000002', NULL, 'cc000000-0000-0000-0000-000000000001');

-- 7. Searches for demo user
INSERT INTO searches (user_id, query, medicine_id) VALUES
  ('aa000000-0000-0000-0000-000000000002', 'Paracetamol 500', 'bb000000-0000-0000-0000-000000000001'),
  ('aa000000-0000-0000-0000-000000000002', 'Metformin', 'bb000000-0000-0000-0000-000000000006'),
  ('aa000000-0000-0000-0000-000000000002', 'Pantoprazole', 'bb000000-0000-0000-0000-000000000004');
