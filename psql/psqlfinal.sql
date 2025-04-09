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

CREATE TABLE charging_stations (
    id SERIAL PRIMARY KEY,  -- station id
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
    state VARCHAR(225),
    status VARCHAR(225),
    ocpp_id VARCHAR(255),  -- id of connector like hub indx in switch
    last_updated TIMESTAMP,
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

