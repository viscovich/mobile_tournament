import { writable } from 'svelte/store';

// Store to hold the currently selected tournament edition ID
export const selectedTournamentId = writable<number | null>(null);
