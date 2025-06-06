CREATE TABLE users (
    id SERIAL PRIMARY KEY,  -- uniq user id
    name VARCHAR(255) NOT NULL,  -- fullname of usr
    email VARCHAR(255) UNIQUE NOT NULL,  -- email adrs
    wallet_balance DECIMAL(10,2) DEFAULT 0,  -- wallet balace
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    wallet_number UUID DEFAULT gen_random_uuid() UNIQUE,
    balance NUMERIC(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
    wallet_type VARCHAR(50) DEFAULT 'general',
    is_default BOOLEAN DEFAULT FALSE,
    last_transaction_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_bank_accounts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  account_type VARCHAR(10) CHECK (account_type IN ('bank', 'upi')),
  account_holder_name VARCHAR(255),
  account_number VARCHAR(50),  -- OR UPI ID
  ifsc VARCHAR(20),
  phone VARCHAR(15),
  email VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE OR REPLACE FUNCTION update_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_wallet_updated_at
BEFORE UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_updated_at();

CREATE TABLE wallet_transactions_log (
    id SERIAL PRIMARY KEY,
    wallet_id INT REFERENCES wallets(id) ON DELETE CASCADE, 
    user_id INT REFERENCES users(id) ON DELETE CASCADE,    
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('top_up', 'spend', 'transfer_in', 'transfer_out')),
    amount NUMERIC(12, 2) CHECK (amount > 0),
    balance_after NUMERIC(12, 2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_logs (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  payment_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  reason TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    session_id INT REFERENCES charging_sessions(id) ON DELETE SET NULL,
    type VARCHAR (225) ,--credit/debit
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(50) CHECK (
        transaction_type IN (
            'top-up',           -- Add money
            'charge',           -- Pay for chrg
            'refund',           -- Money back
            'host_earning',     -- Host gets paid
            'host_payout',      -- Host takes money out
            'sponsored_charge',  -- Host payin for friend / themself /such cases
            'amenity_usage' -- For amenity use
        )
    ),
    payment_gateway_id VARCHAR(255),
    bank_details JSONB,      -- For host payouts
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,  -- uniq vechicle id
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,  -- reg. number
    vin_number VARCHAR(50) UNIQUE NOT NULL,  -- VIN numbr
    user_id INT REFERENCES users(id) ON DELETE CASCADE,  -- owner
    wheel_type INT CHECK (wheel_type IN (2, 3, 4)),  -- 2/3/4 wheeler
    make VARCHAR(255) NOT NULL,  -- brand name
    model VARCHAR(255) NOT NULL,  -- vechile model
    auto_charging_enabled BOOLEAN DEFAULT FALSE,  -- auto-chrg flag
    currently_selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE charging_stations (
    id SERIAL PRIMARY KEY,  -- station id
    -- user_id iNT REFERENCES user(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,  -- statn name
    latitude DECIMAL(10,7) NOT NULL,  -- lat
    longitude DECIMAL(10,7) NOT NULL,  -- long
    amenities TEXT,  -- ammeneties in JSON/CSV
    contact_info TEXT,  -- contct details          
    dynamic_pricing JSONB,  -- dynmic price model  
    enable BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_station_partners (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,
    share_percentage DECIMAL(5,2) DEFAULT 0.0, -- optional: share %
    role VARCHAR(50), -- optional: like 'owner', 'partner'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, station_id) -- prevent duplicate pairings
);

-- Connectors Table
CREATE TABLE connectors (
    id SERIAL PRIMARY KEY,  -- conector id
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,  -- which station
    type VARCHAR(50) NOT NULL,  -- CCS/CHAdMO etc
    power_output DECIMAL(5,2),  -- kW output
    state VARCHAR(225),
    status VARCHAR(225),
    ocpp_id VARCHAR(255),  -- id of connector like hub indx in switch
    last_updated TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plug_switches (
    id SERIAL PRIMARY KEY,  -- unique switch id
    station_id INT REFERENCES charging_stations(id) ON DELETE CASCADE,
    device_id  VARCHAR(225) REFERENCES devices(deviceId) ON DELETE CASCADE,  -- which connector this switch controls 
    hub_index VARCHAR(100) NOT NULL,  -- unique identifier for the switch within a station/hub
    type VARCHAR(50),    -- e.g. relay, smart_switch 
    status VARCHAR(50),  -- e.g. on, off, fault 
    dynamic_pricing JSON,
    last_heartbeat TIMESTAMP,  -- last time the switch pinged
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_favorites_station (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    station_id INT NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT TRUE,  -- TRUE if currently favorited, FALSE if unfavorited
    favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, station_id)  -- Prevent duplicate favorites for same user-station pair
);
CREATE TABLE station_images (
    id SERIAL PRIMARY KEY,
    station_id INT NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,  -- true if it's the main image
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Chargng Sessions Table
CREATE TABLE charging_sessions (
    id SERIAL PRIMARY KEY,  -- session id
    user_id INT REFERENCES users(id) ON DELETE CASCADE,  -- who chrgd
    vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,  -- which car
    connector_id INT REFERENCES connectors(id) ON DELETE CASCADE,  -- which conector
    plug_switches_id INT REFERENCES  plug_switches(id) ON DELETE CASCADE,  -- which conector
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- when startd
    end_time TIMESTAMP,  -- when finishd
    updated_at TIMESTAMP,
    energy_used DECIMAL(6,2),  -- kWhs used
    power DECIMAL(6,2),  -- kWhs used
    ampere DECIMAL(6,2),  -- kWhs used
    voltage DECIMAL(6,2),  -- kWhs used
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

