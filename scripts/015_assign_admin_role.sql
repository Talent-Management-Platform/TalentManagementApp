-- Assign admin role to current authenticated users
-- This script will make the first user an admin

DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user from auth.users
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Insert or update the user's profile to be an admin
        INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
        SELECT 
            first_user_id,
            email,
            COALESCE(raw_user_meta_data->>'full_name', email),
            'admin'::text,
            NOW(),
            NOW()
        FROM auth.users 
        WHERE id = first_user_id
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            updated_at = NOW();
            
        -- Also create a membership record for org-wide admin access
        INSERT INTO public.memberships (user_id, talent_id, role, created_at, updated_at)
        VALUES (first_user_id, NULL, 'admin', NOW(), NOW())
        ON CONFLICT (user_id, COALESCE(talent_id, '00000000-0000-0000-0000-000000000000'::uuid))
        DO UPDATE SET 
            role = 'admin',
            updated_at = NOW();
            
        RAISE NOTICE 'Admin role assigned to user: %', first_user_id;
    ELSE
        RAISE NOTICE 'No users found to assign admin role';
    END IF;
END $$;
