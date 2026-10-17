-- Run once only on an existing database that still contains the starter dump's sample activity.
-- Every delete matches the known seed row values; user accounts and venue records are untouched.
START TRANSACTION;

DELETE FROM admin_seen
WHERE (id = 1 AND admin_id = 1 AND tab_name = 'pending' AND last_seen = '2026-05-28 18:57:40')
   OR (id = 2 AND admin_id = 1 AND tab_name = 'approved' AND last_seen = '2026-05-28 18:55:42')
   OR (id = 3 AND admin_id = 1 AND tab_name = 'rejected' AND last_seen = '2026-05-28 18:15:18')
   OR (id = 4 AND admin_id = 1 AND tab_name = 'feedback' AND last_seen = '2026-05-28 18:15:18');

DELETE FROM feedback
WHERE (id = 1 AND name IS NULL AND email IS NULL AND message = 'I eat shit' AND created_at = '2026-05-26 08:57:57')
   OR (id = 2 AND name IS NULL AND email IS NULL AND message = 'hi, how are ya?' AND created_at = '2026-05-26 09:28:22')
   OR (id = 3 AND name IS NULL AND email IS NULL AND message = 'duquwdiq' AND created_at = '2026-05-26 10:16:58');

DELETE FROM reservations
WHERE (id = 1 AND teacher_id = 2 AND venue_id = 6 AND date_of_use = '2026-05-27' AND time_start = '17:00:00' AND created_at = '2026-05-26 09:51:32')
   OR (id = 2 AND teacher_id = 2 AND venue_id = 3 AND date_of_use = '2026-05-27' AND time_start = '09:19:00' AND created_at = '2026-05-26 10:17:51')
   OR (id = 3 AND teacher_id = 4 AND venue_id = 1 AND date_of_use = '2026-05-27' AND time_start = '13:00:00' AND created_at = '2026-05-26 16:07:33')
   OR (id = 4 AND teacher_id = 2 AND venue_id = 4 AND date_of_use = '2026-05-27' AND time_start = '18:11:00' AND created_at = '2026-05-26 16:11:47')
   OR (id = 5 AND teacher_id = 2 AND venue_id = 3 AND date_of_use = '2026-05-30' AND time_start = '10:30:00' AND created_at = '2026-05-28 09:32:38')
   OR (id = 6 AND teacher_id = 2 AND venue_id = 6 AND date_of_use = '2026-05-29' AND time_start = '09:00:00' AND created_at = '2026-05-28 10:02:42')
   OR (id = 7 AND teacher_id = 2 AND venue_id = 6 AND date_of_use = '2026-06-02' AND time_start = '18:19:00' AND created_at = '2026-05-28 10:19:26');

COMMIT;