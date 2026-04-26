CREATE TABLE IF NOT EXISTS students (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  pnw_email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buildings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  campus VARCHAR(100) NOT NULL DEFAULT 'Hammond',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  description TEXT
);

CREATE TABLE IF NOT EXISTS parking_lots (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  campus VARCHAR(100) NOT NULL DEFAULT 'Hammond',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  permit_type VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME,
  building_id BIGINT,
  description TEXT,
  CONSTRAINT fk_events_building
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

CREATE TABLE IF NOT EXISTS registrations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  event_id BIGINT NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_registrations_student
    FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_registrations_event
    FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT uq_student_event UNIQUE (student_id, event_id)
);

CREATE TABLE IF NOT EXISTS resource_links (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(120) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  category VARCHAR(120) NOT NULL,
  official_url VARCHAR(500) NOT NULL
);

