USE student_life_db;

INSERT INTO accounts (
    account_uuid,
    username,
    password_hash,
    role,
    created_at
) VALUES
('A5600', 'guyGale', 'hashedetc1', 'student', '2024-8-15 07:25:00'),
('A5601', 'andyAndy', 'hashedetc2', 'student','2025-01-30 06:55:00'),
('A5602', 'elizabeth3', 'hashedetc3', 'staff', '2025-01-30 09:58:00');

INSERT INTO addresses (address_uuid,
    house_number,
    street_name,
    city,
    state,
    zip_code,
    address_precision,
    latitude,
    longitude,
    place_id,
    formatted_address,
    created_at) VALUES
('A172', '1010', 'Oak Street', 'Hammond', 'Indiana', 46320, 'exact', 41.6320, -87.1000, '6432', '1010 Oak Street, Hammond, IN 46320', NOW()),
('A173', '5555', 'Cedar Street', 'Hammond', 'Indiana', 46320, 'exact', 49.4532, -80.8989, '6433', '5555 Cedar Street, Hammond, IN 46320', NOW()),
('A174', '3467', 'Mabel Street', 'Hammond', 'Indiana', 46325, 'exact', 33.7732, -65.4569, '6434', '3467 Mabel Street, Hammond, IN 46325', NOW());

INSERT INTO students (
    student_uuid,
    account_uuid,
    student_id,
    first_name,
    middle_name,
    last_name,
    address_uuid,
    created_at
) VALUES
('S5679', 'A5600', '156777', 'Gale', 'Anders', 'Smith', 'A172', '2024-08-15 07:30:00'),
('S5680', 'A5601', '156778', 'Andy', 'Grace', 'Way', 'A173', '2025-01-30 07:00:00');

INSERT INTO staff (
    staff_uuid,
    account_uuid,
    staff_id,
    first_name,
    middle_name,
    last_name,
    address_uuid,
    created_at
) VALUES
('ST4777', 'A5602', '123222', 'Elizabeth', 'Mary', 'Stephens', 'A174', '2025-01-30 10:00:00');

INSERT INTO campus_locations (
    location_uuid,
    name,
    description,
    address,
    latitude,
    longitude,
    place_id
) VALUES
('L100', 'Student Union Library Building', 'Library featuring a student lounge, cafeteria, and campus store on the ground floor', '2233 171st St, Hammond, IN 46323', 41.5843, -87.4738, 'P775'),
('L101', 'Gyte', 'Classroom building with advising and tutoring on the first floor', '171st St, Hammond, IN 46323', 41.5859, -87.4750, 'P776');

INSERT INTO events (
    event_uuid,
    name,
    description,
    event_date,
    cost,
    location_uuid,
    created_by_staff_uuid
) VALUES
('E8999', 'Welcome Rally', 'Event to welcome all new and returning students', '2026-05-20 14:00:00', 0, 'L100', 'ST4777'),
('E9000', 'Build a Leo', 'Event for students to make their own plush version of the PNW mascot Leo the Lion', '2026-05-15 16:30:00', 0, 'L101', 'ST4777');

INSERT INTO registrations (
    registration_uuid,
    student_uuid,
    event_uuid,
    registered_at
) VALUES
('R8090', 'S5679', 'E8999', '2026-05-04 10:00:00'),
('R8091', 'S5679', 'E9000', '2026-05-05 05:46:00'),
('R8092', 'S5680', 'E8999', '2026-05-10 09:21:00');

INSERT INTO parking_lots (
    parking_uuid,
    name,
    capacity,
    location_uuid,
    lot_type
) VALUES
('P10', 'North Visitor Parking', NULL, 'L101', 'parking lot'),
('P11', '169th Street Parking Garage', NULL, 'L100', 'parking garage');

INSERT INTO resource_links (
    resource_uuid,
    event_uuid,
    url,
    description
) VALUES
('R100', 'E9000', 'https://mypnwlife.pnw.edu/studentlife/rsvp_boot?id=390085&rel=title', 'link to welcome rally studentlife page'),
('R101', 'E8999', 'https://www.pnw.edu/event/build-a-leo/', 'link to build a leo pnw event page');
