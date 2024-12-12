import { supabase } from '$lib/supabase';
import { error } from '@sveltejs/kit';

export const load = async ({ params, locals }: { params: { id: string }, locals: App.Locals }) => {
  const { id } = params;

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

  // Recupera tutti i giocatori (necessari per la form di compilazione)
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

  // Recupera i rankings con i dettagli dei giocatori (per la visualizzazione)
  const { data: rankingsWithPlayers, error: rankingsWithPlayersError } = await supabase
    .from('rankings')
    .select(`
      *,
      players (*)
    `)
    .eq('tournament_id', id)
    .order('rank', { ascending: true });

  if (rankingsWithPlayersError) {
    console.error('Errore nel recuperare i rankings con i giocatori:', rankingsWithPlayersError);
    return {
      status: 500,
      error: new Error('Errore nel recuperare i rankings con i giocatori.')
    };
  }

  return {
    tournament,
    players,
    existingRankings,
    rankingsWithPlayers
  };
};

interface RankingData {
  tournament_id: string;
  player_id: string;
  rank: number;
}

export const actions = {
  default: async ({ request, params, locals }: { request: Request; params: { id: string }; locals: App.Locals }) => {
    // Set the auth session for this request
    if (locals.session) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: locals.session.access_token,
        refresh_token: locals.session.refresh_token
      });

      if (sessionError) {
        console.error('Error setting session:', sessionError);
        throw error(500, {
          message: 'Errore durante il salvataggio dei rankings.'
        });
      }
    }

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
        
        // Include only if player_id exists and rank is a valid number greater than 0
        if (player_id && rankValue !== '') {
          const rank = parseInt(rankValue, 10);
          if (!isNaN(rank) && rank > 0) {  // Modified condition to exclude rank 0
            rankings.push({
              tournament_id: tournament_id!,
              player_id,
              rank
            });
          }
        }
      }
    }

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

    try {
      // Prima elimina i rankings esistenti per questo torneo
      const { error: deleteError } = await supabase
        .from('rankings')
        .delete()
        .eq('tournament_id', tournament_id);

      if (deleteError) {
        console.error('Errore nell\'eliminazione dei rankings esistenti:', deleteError);
        throw deleteError;
      }

      // Se ci sono nuovi rankings, inseriscili
      if (rankings.length > 0) {
        const { error: insertError } = await supabase
          .from('rankings')
          .insert(rankings);

        if (insertError) {
          console.error('Errore nell\'inserimento dei nuovi rankings:', insertError);
          throw insertError;
        }
      }

      return {
        status: 200,
        data: { message: 'Rankings salvati con successo.' }
      };
    } catch (err) {
      console.error('Errore durante il salvataggio:', err);
      throw error(500, {
        message: 'Errore durante il salvataggio dei rankings.'
      });
    }
  }
};
