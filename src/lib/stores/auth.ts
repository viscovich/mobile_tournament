import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

// Create a store for the user
export const userStore = writable<User | null>(null);

// Create a derived store for authentication state
export const isAuthenticated = writable<boolean>(false);

// Update both stores when setting the user
export function setUser(user: User | null) {
    userStore.set(user);
    isAuthenticated.set(!!user);
}

// Subscribe to userStore changes to update isAuthenticated
userStore.subscribe((user) => {
    isAuthenticated.set(!!user);
});
