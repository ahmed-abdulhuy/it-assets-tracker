-- =====================================================
-- MIGRATION: Device Status Management
-- Run this against your existing database
-- =====================================================

-- ── 1. Canonical status list ──────────────────────
CREATE TABLE device_statuses (
    status       VARCHAR(50) PRIMARY KEY,
    label        VARCHAR(100) NOT NULL,
    color        VARCHAR(20)  NOT NULL,
    description  TEXT,
    is_terminal  BOOLEAN NOT NULL DEFAULT FALSE
);

-- ── 2. Allowed transitions ────────────────────────
CREATE TABLE device_status_transitions (
    from_status     VARCHAR(50) NOT NULL REFERENCES device_statuses(status),
    to_status       VARCHAR(50) NOT NULL REFERENCES device_statuses(status),
    label           VARCHAR(100),
    description     TEXT,
    requires_return BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (from_status, to_status)
);

-- ── 3. Seed statuses ─────────────────────────────
INSERT INTO device_statuses (status, label, color, description, is_terminal) VALUES
    ('available',   'Available',   '#3ecf6e', 'Ready to be assigned to an employee.',              FALSE),
    ('assigned',    'Assigned',    '#f0a500', 'Currently assigned to an employee.',                FALSE),
    ('maintenance', 'Maintenance', '#4d9de0', 'Undergoing repair or servicing.',                   FALSE),
    ('retired',     'Retired',     '#666666', 'End of life. No longer in active use.',             TRUE),
    ('lost',        'Lost',        '#f05252', 'Device cannot be located.',                         FALSE);

-- ── 4. Seed transitions ───────────────────────────
INSERT INTO device_status_transitions
    (from_status, to_status, label, description, requires_return) VALUES
    ('available',   'maintenance', 'Send to Repair',   'Move this device to maintenance for servicing.',                          FALSE),
    ('available',   'retired',     'Retire Device',    'Permanently retire this device. This action cannot be reversed.',         FALSE),
    ('available',   'lost',        'Mark as Lost',     'Mark this device as lost or unaccounted for.',                            FALSE),
    ('assigned',    'maintenance', 'Send to Repair',   'Device will be recalled from the employee and sent for repair.',          TRUE),
    ('assigned',    'lost',        'Mark as Lost',     'Device will be recalled from the employee and marked as lost.',           TRUE),
    ('maintenance', 'available',   'Mark as Repaired', 'Repair is complete. Device is ready for assignment.',                     FALSE),
    ('maintenance', 'retired',     'Retire Device',    'Device is beyond repair and will be permanently retired.',                FALSE),
    ('lost',        'available',   'Mark as Found',    'Device has been recovered and is ready for assignment.',                   FALSE),
    ('lost',        'retired',     'Retire Device',    'Device is unrecoverable and will be permanently retired.',                FALSE);

-- ── 5. Add CHECK constraint to devices.status ───
ALTER TABLE devices
    ADD CONSTRAINT chk_devices_status
    CHECK (status IN ('available','assigned','maintenance','retired','lost'));

-- ── 6. Status change audit log ───────────────────
CREATE TABLE device_status_log (
    log_id       SERIAL PRIMARY KEY,
    device_id  INTEGER NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    from_status  VARCHAR(50) REFERENCES device_statuses(status),
    to_status    VARCHAR(50) NOT NULL REFERENCES device_statuses(status),
    changed_by   VARCHAR(100),
    note         TEXT,
    changed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status_log_device ON device_status_log(device_id);