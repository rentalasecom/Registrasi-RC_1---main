-- Create payment_history table
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id text NOT NULL,
  status text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment history"
  ON payment_history FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert payment history"
  ON payment_history FOR INSERT
  WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_payment_history_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update timestamps
CREATE TRIGGER update_payment_history_timestamps
  BEFORE UPDATE ON payment_history
  FOR EACH ROW
  EXECUTE PROCEDURE update_payment_history_timestamps();
