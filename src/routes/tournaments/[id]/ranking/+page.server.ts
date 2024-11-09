// src/routes/tournaments/[id]/ranking/+page.server.ts
import { createClient } from '@supabase/supabase-js';
import { redirect } from '@sveltejs/kit';

// Configura Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const load = async ({ params }: { params: { id: string } }) => {
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

interface RankingData {
  tournament_id: string;
  player_id: string;
  rank: number;
}

export const actions = {
  default: async ({ request, params }: { request: Request; params: { id: string } }) => {
    const { id } = params;
    const formData = await request.formData();

    const tournament_id = formData.get('tournament_id')?.toString();
    const rankings: RankingData[] = [];

    // Itera attraverso i giocatori per raccogliere i rankings
    for (let [key, value] of formData.entries()) {
      const match = key.match(/^rankings\[(\d+)\]\.rank$/);
      if (match) {
        const index = match[1];
        const player_id = formData.get(`rankings[${index}].player_id`)?.toString();
        const rankValue = value.toString().trim();
        
        // Include only if player_id exists and rank is a valid number
        if (player_id && rankValue !== '') {
          const rank = parseInt(rankValue, 10);
          if (!isNaN(rank)) {
            rankings.push({
              tournament_id: tournament_id!,
              player_id,
              rank
            });
          }
        }
      }
    }

    console.log('Dati ricevuti dalla submission:', { tournament_id, rankings });

    // Validazione base
    if (!tournament_id) {
      return {
        status: 400,
        data: { message: 'ID del torneo mancante.' }
      };
    }

    // Verifica che l'ID del torneo corrisponda alla route
    if (tournament_id !== id) {
      return {
        status: 400,
        data: { message: 'ID del torneo non valido.' }
      };
    }

    // Prima elimina i rankings esistenti per questo torneo
    const { error: deleteError } = await supabase
      .from('rankings')
      .delete()
      .eq('tournament_id', tournament_id);

    if (deleteError) {
      console.error('Errore nell\'eliminazione dei rankings esistenti:', deleteError);
      return {
        status: 500,
        data: { message: 'Errore nell\'eliminazione dei rankings esistenti.' }
      };
    }

    // Se ci sono nuovi rankings, inseriscili
    if (rankings.length > 0) {
      const { error: insertError } = await supabase
        .from('rankings')
        .insert(rankings);

      if (insertError) {
        console.error('Errore nell\'inserimento dei nuovi rankings:', insertError);
        return {
          status: 500,
          data: { message: 'Errore nell\'inserimento dei nuovi rankings.' }
        };
      }
    }

    // Redirect to home page after successful save
    throw redirect(303, '/');
  }
};
