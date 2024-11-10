import { supabase } from '$lib/supabase';
import type { Handle } from '@sveltejs/kit';
import type { Session } from '@supabase/supabase-js';

export const handle: Handle = async ({ event, resolve }) => {
    // Get the authorization header which contains the session token
    const authHeader = event.request.headers.get('authorization');
    
    if (authHeader) {
        try {
            const token = authHeader.replace('Bearer ', '');
            const { data: { session }, error } = await supabase.auth.getSession();

            if (!error && session) {
                event.locals.session = session;
            } else {
                console.error('Error getting session:', error);
                event.locals.session = null;
            }
        } catch (e) {
            console.error('Error processing auth header:', e);
            event.locals.session = null;
        }
    } else {
        event.locals.session = null;
    }

    // Continue with the request
    const response = await resolve(event);
    return response;
};
