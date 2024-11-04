// src/routes/tournaments/[id]/ranking/+page.server.js
import { createClient } from '@supabase/supabase-js';

// Configura Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const load = async ({ params }) => {
  const { id } = params;
  console.log('Caricamento ranking per torneo ID:', id);

  // Recupera i dettagli del torneo
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();

  if (tournamentError) {
    console.error('Errore nel recuperare il torneo:', tournamentError);
    return {
      status: 500,
      error: new Error('Errore nel recuperare il torneo.')
    };
  }

  console.log('Dati del torneo:', tournament);

  // Recupera la lista di tutti i giocatori
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('*');

  if (playersError) {
    console.error('Errore nel recuperare i giocatori:', playersError);
    return {
      status: 500,
      error: new Error('Errore nel recuperare i giocatori.')
    };
  }

  console.log('Lista dei giocatori:', players);

  // Recupera i rankings esistenti per questo torneo
  const { data: existingRankings, error: rankingsError } = await supabase
    .from('rankings')
    .select('*')
    .eq('tournament_id', id);

  if (rankingsError) {
    console.error('Errore nel recuperare i rankings:', rankingsError);
    return {
      status: 500,
      error: new Error('Errore nel recuperare i rankings.')
    };
  }

  console.log('Rankings esistenti:', existingRankings);

  return {
    tournament,
    players,
    existingRankings
  };
};

export const actions = {
  default: async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();

    const tournament_id = formData.get('tournament_id');
    const rankings = [];

    // Itera attraverso i giocatori per raccogliere i rankings
    for (let [key, value] of formData.entries()) {
      const match = key.match(/^rankings\[(\d+)\]\.rank$/);
      if (match) {
        const index = match[1];
        const player_id = formData.get(`rankings[${index}].player_id`);
        const rank = parseInt(value, 10);
        if (player_id && !isNaN(rank)) {
          rankings.push({
            player_id: parseInt(player_id, 10),
            rank: rank
          });
        }
      }
    }

    console.log('Dati ricevuti dalla submission:', { tournament_id, rankings });

    // Validazione
    if (!tournament_id || rankings.length === 0) {
      return {
        status: 400,
        body: { message: 'Dati non validi.' }
      };
    }

    // Verifica che l'ID del torneo corrisponda alla route
    if (parseInt(tournament_id, 10) !== parseInt(id, 10)) {
      return {
        status: 400,
        body: { message: 'ID del torneo non valido.' }
      };
    }

    // Controlla che tutte le posizioni siano uniche e tra 1 e 8
    const ranks = rankings.map(r => r.rank);
    const uniqueRanks = new Set(ranks);

    if (ranks.includes(NaN)) {
      return {
        status: 400,
        body: { message: 'Tutti i giocatori devono avere una posizione valida.' }
      };
    }

    if (uniqueRanks.size !== ranks.length) {
      return {
        status: 400,
        body: { message: 'Le posizioni devono essere uniche.' }
      };
    }

    for (let rank of ranks) {
      if (rank < 1 || rank > 8) {
        return {
          status: 400,
          body: { message: 'Le posizioni devono essere comprese tra 1 e 8.' }
        };
      }
    }

    // **Utilizzo di `upsert` per aggiornare o inserire i rankings**
    const { data, error } = await supabase
      .from('rankings')
      .upsert(
        rankings.map(r => ({
          tournament_id: tournament_id,
          player_id: r.player_id,
          rank: r.rank
        })),
        { onConflict: ['tournament_id', 'player_id'] }
      );

    if (error) {
      console.error('Errore nell\'inserimento/updating dei rankings:', error);
      return {
        status: 500,
        body: { message: 'Errore nell\'inserimento/updating dei rankings.' }
      };
    }

    console.log('Rankings inseriti/updating con successo:', data);

    return {
      status: 200,
      body: { message: 'Rankings inseriti con successo!' }
    };
  }
};

