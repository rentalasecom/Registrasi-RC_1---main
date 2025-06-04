/*
  # Initial Database Schema Setup

  1. New Tables
    - `participants`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `address` (text)
      - `whatsapp` (text)
      - `categories` (text array)
      - `price` (numeric)
      - `payment_status` (text)
      - `payment_id` (text, optional)
      - `barcode_url` (text, optional)
      - `receipt_url` (text, optional)
      - `participant_number` (text, optional)
      - `representative_name` (text, optional)
      - `representative_wa` (text, optional)
      - `souvenir_received` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `admins`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (text)

    - `settings`
      - `id` (integer, primary key)
      - `homepage_title` (text)
      - `homepage_location` (text)
      - `homepage_banner_url` (text)
      - `xendit_api_key` (text)
      - `whatsapp_api_key` (text)
      - `whatsapp_template` (text)

  2. Functions
    - Create functions to handle table creation if they don't exist
    - These functions are called by the application on startup

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enum for payment status
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PAID', 'UNPAID');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for admin roles
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('admin', 'superadmin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  whatsapp text NOT NULL,
  categories text[] NOT NULL,
  price numeric NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'UNPAID',
  payment_id text,
  barcode_url text,
  receipt_url text,
  participant_number text,
  representative_name text,
  representative_wa text,
  souvenir_received boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role admin_role NOT NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1,
  homepage_title text NOT NULL,
  homepage_location text NOT NULL,
  homepage_banner_url text NOT NULL,
  xendit_api_key text NOT NULL,
  whatsapp_api_key text NOT NULL,
  whatsapp_template text NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Create function to check if participants table exists
CREATE OR REPLACE FUNCTION create_participants_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'participants') THEN
    CREATE TABLE participants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      email text NOT NULL,
      address text NOT NULL,
      whatsapp text NOT NULL,
      categories text[] NOT NULL,
      price numeric NOT NULL,
      payment_status payment_status NOT NULL DEFAULT 'UNPAID',
      payment_id text,
      barcode_url text,
      receipt_url text,
      participant_number text,
      representative_name text,
      representative_wa text,
      souvenir_received boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if admins table exists
CREATE OR REPLACE FUNCTION create_admins_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins') THEN
    CREATE TABLE admins (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      role admin_role NOT NULL
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if settings table exists
CREATE OR REPLACE FUNCTION create_settings_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settings') THEN
    CREATE TABLE settings (
      id integer PRIMARY KEY DEFAULT 1,
      homepage_title text NOT NULL,
      homepage_location text NOT NULL,
      homepage_banner_url text NOT NULL,
      xendit_api_key text NOT NULL,
      whatsapp_api_key text NOT NULL,
      whatsapp_template text NOT NULL,
      CONSTRAINT single_row CHECK (id = 1)
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous users to insert participants" ON participants;
DROP POLICY IF EXISTS "Allow authenticated users to read participants" ON participants;
DROP POLICY IF EXISTS "Allow authenticated users to update participants" ON participants;
DROP POLICY IF EXISTS "Allow authenticated users to read admins" ON admins;
DROP POLICY IF EXISTS "Allow authenticated users to read settings" ON settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON settings;

-- Create policies for participants table
CREATE POLICY "Allow anonymous users to insert participants"
  ON participants FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read participants"
  ON participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update participants"
  ON participants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for admins table
CREATE POLICY "Allow authenticated users to read admins"
  ON admins FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for settings table
CREATE POLICY "Allow authenticated users to read settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);