CREATE DATABASE IF NOT EXISTS student_life_db;
USE student_life_db;

-- =========================
-- ACCOUNTS
-- =========================
CREATE TABLE accounts (
    account_uuid CHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL
);

-- =========================
-- ADDRESSES
-- =========================
CREATE TABLE addresses (
    address_uuid CHAR(36) PRIMARY KEY,
    house_number VARCHAR(20),
    street_name VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20),
    address_precision VARCHAR(50) NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    place_id VARCHAR(255),
    formatted_address VARCHAR(255),
    created_at DATETIME NOT NULL,

    -- Address hierarchy constraint
    CHECK (house_number IS NULL OR street_name IS NOT NULL)
);

-- =========================
-- STUDENTS
-- =========================
CREATE TABLE students (
    student_uuid CHAR(36) PRIMARY KEY,
    account_uuid CHAR(36) NOT NULL UNIQUE,
    student_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    address_uuid CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL,

    FOREIGN KEY (account_uuid) REFERENCES accounts(account_uuid),
    FOREIGN KEY (address_uuid) REFERENCES addresses(address_uuid)
);

-- =========================
-- STAFF
-- =========================
CREATE TABLE staff (
    staff_uuid CHAR(36) PRIMARY KEY,
    account_uuid CHAR(36) NOT NULL UNIQUE,
    staff_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    address_uuid CHAR(36) NOT NULL,
    created_at DATETIME NOT NULL,

    FOREIGN KEY (account_uuid) REFERENCES accounts(account_uuid),
    FOREIGN KEY (address_uuid) REFERENCES addresses(address_uuid)
);

-- =========================
-- CAMPUS LOCATIONS
-- =========================
CREATE TABLE campus_locations (
    location_uuid CHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    place_id VARCHAR(255) NOT NULL
);

-- =========================
-- EVENTS
-- =========================
CREATE TABLE events (
    event_uuid CHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    cost FLOAT NOT NULL,
    location_uuid CHAR(36) NOT NULL,
    created_by_staff_uuid CHAR(36) NOT NULL,

    FOREIGN KEY (location_uuid) REFERENCES campus_locations(location_uuid),
    FOREIGN KEY (created_by_staff_uuid) REFERENCES staff(staff_uuid)
);

-- =========================
-- REGISTRATIONS
-- =========================
CREATE TABLE registrations (
    registration_uuid CHAR(36) PRIMARY KEY,
    student_uuid CHAR(36) NOT NULL,
    event_uuid CHAR(36) NOT NULL,
    registered_at DATETIME NOT NULL,

    FOREIGN KEY (student_uuid) REFERENCES students(student_uuid),
    FOREIGN KEY (event_uuid) REFERENCES events(event_uuid),

    UNIQUE (student_uuid, event_uuid) -- prevent duplicate registrations
);

-- =========================
-- PARKING LOTS
-- =========================
CREATE TABLE parking_lots (
    parking_uuid CHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    capacity INT NOT NULL,
    location_uuid CHAR(36) NOT NULL,
    lot_type VARCHAR(50) NOT NULL,

    FOREIGN KEY (location_uuid) REFERENCES campus_locations(location_uuid)
);

-- =========================
-- RESOURCE LINKS
-- =========================
CREATE TABLE resource_links (
    resource_uuid CHAR(36) PRIMARY KEY,
    event_uuid CHAR(36) NOT NULL,
    url VARCHAR(255) NOT NULL,
    description TEXT,

    FOREIGN KEY (event_uuid) REFERENCES events(event_uuid)
);
