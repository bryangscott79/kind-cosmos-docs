-- The old "create own profile" policy with RESTRICTIVE was already dropped. 
-- The new "insert own profile" already exists as PERMISSIVE from the first migration.
-- Just need to verify the other two were recreated correctly.
-- Let's check by dropping the potentially RESTRICTIVE ones and recreating if needed.
DROP POLICY IF EXISTS "Users can create own profile " ON public.profiles;
