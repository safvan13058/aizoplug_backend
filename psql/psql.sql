
-- User Table (other vals from home schmea)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,  -- uniq user id
    name VARCHAR(255) NOT NULL,  -- fullname of usr
    email VARCHAR(255) UNIQUE NOT NULL,  -- email adrs
    wallet_balance DECIMAL(10,2) DEFAULT 0,  -- wallet balace
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehcles Table 
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,  -- uniq vechicle id
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,  -- reg. number
    vin_number VARCHAR(50) UNIQUE NOT NULL,  -- VIN numbr
    user_id INT REFERENCES users(id) ON DELETE CASCADE,  -- owner
    wheel_type INT CHECK (wheel_type IN (2, 3, 4)),  -- 2/3/4 wheeler
    make VARCHAR(255) NOT NULL,  -- brand name
    model VARCHAR(255) NOT NULL,  -- vechile model
    auto_charging_enabled BOOLEAN DEFAULT FALSE,  -- auto-chrg flag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chrging Stations Table

CREATE TABLE charging_stations (
    id SERIAL PRIMARY KEY,  -- station id
    user_id INT REFERENCES user(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,  -- statn name
    latitude DECIMAL(10,7) NOT NULL,  -- lat
    longitude DECIMAL(10,7) NOT NULL,  -- long
    amenities TEXT,  -- ammeneties in JSON/CSV
    contact_info TEXT,  -- contct details
    dynamic_pricing JSONB,  -- dynmic price model
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Connectors Table
CREATE TABLE connectors (
    id SERIAL PRIMARY KEY,  -- conector id
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,  -- which station
    type VARCHAR(50) NOT NULL,  -- CCS/CHAdMO etc
    power_output DECIMAL(5,2),  -- kW output
    ocpp_id VARCHAR(255),  -- id of connector like hub indx in switch
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Chargng Sessions Table
CREATE TABLE charging_sessions (
    id SERIAL PRIMARY KEY,  -- session id
    user_id INT REFERENCES users(id) ON DELETE CASCADE,  -- who chrgd
    vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,  -- which car
    connector_id INT REFERENCES connectors(id) ON DELETE CASCADE,  -- which conector
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- when startd
    end_time TIMESTAMP,  -- when finishd
    energy_used DECIMAL(6,2),  -- kWhs used
    cost DECIMAL(10,2),  -- cost based on dynmic price
    payment_method VARCHAR(50) CHECK (payment_method IN ('wallet', 'RFID', 'QR')),  -- how paid
    status VARCHAR(50) CHECK (status IN ('ongoing', 'completed', 'failed')) DEFAULT 'ongoing',  -- sesion status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (cost <= (SELECT wallet_balance FROM users WHERE id = user_id)),  -- check if enough money
    promotion_id INT REFERENCES promotional_rates(id),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    sponsored_by INT REFERENCES users(id),  -- Host payin for friend / themself /such cases
    sponsorship_note TEXT                   -- Note for sponsrd charge
);

-- Transactons Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    session_id INT REFERENCES charging_sessions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(50) CHECK (
        transaction_type IN (
            'top-up',           -- Add money
            'charge',           -- Pay for chrg
            'refund',           -- Money back
            'host_earning',     -- Host gets paid
            'host_payout',      -- Host takes mony out
            'sponsored_charge',  -- Host payin for friend / themself /such cases
            'amenity_usage' -- For amenity use
        )
    ),
    payment_gateway_id VARCHAR(255),
    bank_details JSONB,      -- For host payouts
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (transaction_type != 'charge' OR amount <= (SELECT wallet_balance FROM users WHERE id = user_id))
);


-- Notificashns Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,  -- notif id
    user_id INT REFERENCES users(id) ON DELETE CASCADE,  -- who gets it
    message TEXT NOT NULL,  -- notif msg
    status VARCHAR(50) CHECK (status IN ('unread', 'read')) DEFAULT 'unread',  -- read staus
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,  -- review id
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,  -- which station
    user_id INT REFERENCES users(id) ON DELETE CASCADE,  -- who reviewd
    rating INT CHECK (rating BETWEEN 1 AND 5),  -- stars (1-5)
    comment TEXT,  -- review commnt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Host Payments Tabel
CREATE TABLE host_payments (
    id SERIAL PRIMARY KEY,  -- payment recrd id
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,  -- which statn
    host_id INT REFERENCES users(id) ON DELETE CASCADE,  -- which host
    payment_percentage DECIMAL(5,2) NOT NULL,  -- % of revenu
    amount_earned DECIMAL(10,2) DEFAULT 0,  -- how much erned
    payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'paid')) DEFAULT 'pending',  -- paymnt status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RFID Crads Table
CREATE TABLE rfid_cards (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    card_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'blocked')),
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- Bookin Slots
CREATE TABLE booking_slots (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,
    connector_id INT REFERENCES connectors(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('booked', 'cancelled', 'completed')),
    booking_fee DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (start_time < end_time)
);

-- Favorit Stations  -Optnl (For qick access to frequent statons)

CREATE TABLE favorite_stations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,  -- who fav'd it
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,  -- favd statn
    nickname VARCHAR(50),  -- custom name (eg "Home Chrgr", "Office")
    priority INT DEFAULT 0,  -- for sortin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, station_id)
);

-- Smart Chrging Schdules  For auto/schedled charging
CREATE TABLE charging_schedules (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,
    vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP NOT NULL,    
    recurring BOOLEAN DEFAULT FALSE,  -- weekly/daily repeats
    recurrence_pattern VARCHAR(50),  -- eg 'WEEKLY_MON_WED', 'DAILY'
    target_charge_level INT,  -- target % chrg
    max_cost DECIMAL(10,2),  -- max spend
    max_kwh DECIMAL(6,2),  -- max energy 
    status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staton Issues - For reportng prblems (advaced featr)
CREATE TABLE station_issues (    
    id SERIAL PRIMARY KEY,      
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,
    reported_by INT REFERENCES users(id) ON DELETE CASCADE,
    issue_type VARCHAR(50),  -- eg 'CONECTOR_BRKN', 'PAYMENT_ISSUE'
    description TEXT,        
    photo_urls TEXT[],  -- pics of issue
    status VARCHAR(20) CHECK (status IN ('reported', 'investigating', 'resolved')),
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Platfom Pricing
CREATE TABLE platform_pricing (
    id SERIAL PRIMARY KEY,
    pricing_type VARCHAR(50) NOT NULL,  -- 'standrd', 'peak', 'off_peak'
    base_rate DECIMAL(10,2) NOT NULL,   -- Per kWh amt
    service_charge DECIMAL(10,2),        -- extra srvc fee
    tax_percentage DECIMAL(5,2),         -- tax %
    min_charge DECIMAL(10,2),            -- minumum charge amt
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP,           
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staton Amenitys Config Table (xtra servces)
CREATE TABLE station_amenities (
    id SERIAL PRIMARY KEY,
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,
    amenity_type VARCHAR(50) NOT NULL, -- 'chrging_outlet', 'blb', 'fan', 'massge_chair'
    amenity_name VARCHAR(100) NOT NULL,
    description TEXT,
    billing_type VARCHAR(20) CHECK (billing_type IN ('time_based', 'consumption_based', 'fixed')),
    rate_per_unit DECIMAL(10,2) NOT NULL, -- Per min/kwh/fixed
    unit_type VARCHAR(20), -- 'minite', 'hour', 'kWh', 'usge'
    max_units DECIMAL(10,2), -- Max unts alowed (optionl)
    status VARCHAR(20) CHECK (status IN ('available', 'in_use', 'maintenance', 'disabled')) DEFAULT 'available',
    device_id VARCHAR(255), -- IOT devce ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Amenity Usge trackng table - For monitring
CREATE TABLE amenity_usage_sessions (
    id SERIAL PRIMARY KEY,
    amenity_id INT REFERENCES station_amenities(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    charging_session_id INT REFERENCES charging_sessions(id) ON DELETE SET NULL, -- Can link to chargng (optnl)
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    units_consumed DECIMAL(10,2), -- kwh/mins dependng on type
    cost DECIMAL(10,2),
    status VARCHAR(20) CHECK (status IN ('ongoing', 'completed', 'cancelled', 'failed')) DEFAULT 'ongoing',
    payment_method VARCHAR(50) CHECK (payment_method IN ('wallet', 'RFID', 'QR')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (cost <= (SELECT wallet_balance FROM users WHERE id = user_id)) -- check enuf munny
);

-- Amenty Billng Table (for keepn track)
CREATE TABLE amenity_billing {
    id SERIAL PRIMARY KEY,
    usage_session_id INT REFERENCES amenity_usage_sessions(id) ON DELETE CASCADE,
    transaction_id INT REFERENCES transactions(id) ON DELETE SET NULL,
    billing_amount DECIMAL(10,2) NOT NULL,
    billing_status VARCHAR(20) CHECK (billing_status IN ('pending', 'processed', 'failed', 'refunded')) DEFAULT 'pending',
    billing_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
};

-- Host-Specfic Pricng (for custom host rates)
CREATE TABLE host_pricing (
    id SERIAL PRIMARY KEY,
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,
    connector_id INT REFERENCES connectors(id) ON DELETE CASCADE,
    pricing_type VARCHAR(50) NOT NULL,   -- 'standrd', 'peak', 'off_peak', 'special'
    base_rate DECIMAL(10,2) NOT NULL,    -- Per kWh rate
    service_charge DECIMAL(10,2),        -- host srvc fee
    tax_percentage DECIMAL(5,2),         -- tax rate
    min_charge DECIMAL(10,2),            -- min charge
    peak_hours JSONB,                    -- peak hrs config
    special_rates JSONB,                 -- spcl days rates
    bulk_discounts JSONB,                -- bulk discnts
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_pricing CHECK (base_rate >= 0 AND service_charge >= 0)
);

-- Time-Basd Pricng Rules
CREATE TABLE pricing_schedules (
    id SERIAL PRIMARY KEY,
    pricing_id INT REFERENCES host_pricing(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    rate_multiplier DECIMAL(3,2),        -- multply base_rate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Promocional Pricng (for all types of discnts)
CREATE TABLE promotional_rates (
    id SERIAL PRIMARY KEY,
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    promo_type VARCHAR(20) CHECK (promo_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10,2) NOT NULL,  -- % or fixed amnt
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    start_time TIME,                        -- daily time limit (optionl)
    end_time TIME,                          -- daily time limit (optionl)
    min_session_amount DECIMAL(10,2),       -- min amt to apply
    max_discount DECIMAL(10,2),             -- max discnt cap
    usage_limit INT,                        -- how many times can be used
    used_count INT DEFAULT 0,               -- times used so far
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_promotion CHECK (
        discount_value > 0 AND 
        start_date < end_date AND
        (start_time IS NULL OR end_time IS NULL OR start_time < end_time)
    )
);