<!-- src/routes/ranking/[tournamentId]/+page.svelte -->
<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import { writable } from 'svelte/store';

  interface Tournament {
    id: number;
    name: string;
    date: string;
    location: string;
  }

  interface Player {
    id: number;
    name: string;
  }

  interface Ranking {
    id: number;
    tournament_id: number;
    player_id: number;
    rank: number;
  }

  let tournament: Tournament | null = null;
  let players: Player[] = [];
  let rankings: Ranking[] = [];
  let tournamentId: string;

  onMount(() => {
    tournamentId = $page.params.tournamentId;
    fetchTournament();
    fetchPlayers();
    fetchRankings();
  });

  const fetchTournament = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();
    if (error) console.error(error);
    else tournament = data;
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase.from('players').select('*').order('name', { ascending: true });
    if (error) console.error(error);
    else players = data;
  };

  const fetchRankings = async () => {
    const { data, error } = await supabase.from('rankings').select('*').eq('tournament_id', tournamentId);
    if (error) console.error(error);
    else rankings = data;
  };

  const updateRank = async (playerId: number, newRank: number) => {
    const existing = rankings.find(r => r.player_id === playerId);
    if (existing) {
      const { error } = await supabase
        .from('rankings')
        .update({ rank: newRank })
        .eq('id', existing.id);
      if (error) console.error(error);
      else fetchRankings();
    } else {
      const { error } = await supabase
        .from('rankings')
        .insert([{ tournament_id: tournamentId, player_id: playerId, rank: newRank }]);
      if (error) console.error(error);
      else fetchRankings();
    }
  };

  const getPoints = (rank: number | undefined): number => {
    if (rank === undefined) return 0;
    switch(rank) {
      case 1: return 100;
      case 2: return 75;
      case 3: return 50;
      case 4: return 25;
      default: return 0;
    }
  };

  const getCurrentRank = (playerId: number): number => {
    const ranking = rankings.find(r => r.player_id === playerId);
    return ranking?.rank || 0;
  };
</script>

<div class="p-4">
  {#if tournament}
    <h3 class="text-white text-lg font-bold mb-4">
      {tournament.name} - Rankings
    </h3>
  {/if}
  <div class="space-y-2">
    {#each players as player}
      {@const currentRank = getCurrentRank(player.id)}
      <div class="flex items-center justify-between bg-[#231a10] px-4 py-2 rounded-xl">
        <div>
          <p class="text-white text-base font-medium">{player.name}</p>
          <p class="text-[#cbb090] text-sm">
            Points: {getPoints(currentRank)}
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            on:click={() => {
              if (currentRank > 1) updateRank(player.id, currentRank - 1);
            }}
            class="text-white"
            disabled={currentRank <= 1}
          >
            -
          </button>
          <span class="text-white">
            {currentRank || 'Unranked'}
          </span>
          <button
            on:click={() => {
              if (currentRank < 8) updateRank(player.id, currentRank + 1);
            }}
            class="text-white"
            disabled={currentRank >= 8}
          >
            +
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>
