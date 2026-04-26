INSERT INTO buildings (name, campus, latitude, longitude, description)
VALUES
  ('Student Union Library Building', 'Hammond', 41.5839000, -87.4749000, 'Starter placeholder for campus map integration')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO parking_lots (name, campus, latitude, longitude, permit_type)
VALUES
  ('Sample Student Parking Lot', 'Hammond', 41.5843000, -87.4753000, 'student')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO resource_links (slug, label, category, official_url)
VALUES
  ('advising', 'Academic Advising', 'student-support', 'https://www.pnw.edu/academic-advising/'),
  ('registrar', 'Registrar', 'student-support', 'https://www.pnw.edu/registrar/')
ON DUPLICATE KEY UPDATE label = VALUES(label), category = VALUES(category), official_url = VALUES(official_url);

