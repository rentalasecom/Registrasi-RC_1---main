/*
  # Fix RLS and Add Initial Data

  1. Security Changes
    - Add RLS policies for initial data insertion
    - Enable RLS on all tables
    
  2. Initial Data
    - Add default admin users
    - Add default settings
    
  3. Changes
    - Remove client-side database setup
    - Ensure proper RLS policies
*/

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for settings
CREATE POLICY "Enable read access for authenticated users" ON settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable update access for authenticated users" ON settings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add RLS policies for admins
CREATE POLICY "Enable read access for authenticated users" ON admins
  FOR SELECT TO authenticated
  USING (true);

-- Insert default admin users if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins) THEN
    INSERT INTO admins (name, email, password_hash, role)
    VALUES 
      ('Admin', 'admin@racercadventure.com', '$2a$10$LI7kASNjX.zQxRiS7MXvdOO9xmJp1CJF7CQgYW8xVYOIm5s9Zwyiy', 'admin'),
      ('Super Admin', 'superadmin@racercadventure.com', '$2a$10$VoCQfvXkJ3c5r.H3bvrhEec8YMfmHdMvA8xKH3HV3E1yHUlFQIr4i', 'superadmin');
  END IF;
END $$;

-- Insert default settings if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM settings) THEN
    INSERT INTO settings (
      id,
      homepage_title,
      homepage_location,
      homepage_banner_url,
      xendit_api_key,
      whatsapp_api_key,
      whatsapp_template
    )
    VALUES (
      1,
      'Race RC Adventure',
      'Jakarta, Indonesia',
      'https://images.pexels.com/photos/163509/toy-car-rally-rc-model-163509.jpeg',
      'xnd_development_your_key_here',
      'your_whatsapp_api_key_here',
      'Terima kasih telah mendaftar di Race RC Adventure. Berikut receipt anda: {{receipt_url}}'
    );
  END IF;
END $$;