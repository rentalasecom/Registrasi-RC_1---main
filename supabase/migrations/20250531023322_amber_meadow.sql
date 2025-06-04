/*
  # Update participants table RLS policies

  1. Security Changes
    - Enable RLS on participants table
    - Add policy for anonymous users to insert new participants
    - Add policy for authenticated users to read all participants
    - Add policy for authenticated users to update participants

  This migration ensures that:
    - Public users can register (insert) new participants
    - Only authenticated users (admins) can read and update participant data
*/

-- Enable RLS on participants table (if not already enabled)
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert participants" ON participants;
DROP POLICY IF EXISTS "Allow authenticated users to read participants" ON participants;
DROP POLICY IF EXISTS "Allow authenticated users to update participants" ON participants;
DROP POLICY IF EXISTS "Allow anonymous users to insert participants" ON participants;

-- Create policy for anonymous users to insert participants (for registration)
CREATE POLICY "Allow anonymous users to insert participants"
ON participants
FOR INSERT
TO anon
WITH CHECK (true);

-- Create policy for authenticated users to read participants
CREATE POLICY "Allow authenticated users to read participants"
ON participants
FOR SELECT
TO authenticated
USING (true);

-- Create policy for authenticated users to update participants
CREATE POLICY "Allow authenticated users to update participants"
ON participants
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);