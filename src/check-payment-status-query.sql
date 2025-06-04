-- Check participant payment status
SELECT 
  payment_status, 
  payment_id, 
  receipt_url, 
  updated_at
FROM participants 
WHERE id = '629a30df-d7ee-43c6-9da2-25c6ba186bc1';

-- Check payment history
SELECT 
  status,
  timestamp,
  notes
FROM payment_history 
WHERE payment_id = '683ec66aa0ee90c011587f4e'
ORDER BY timestamp DESC;
