<!-- src/routes/ranking/[tournamentId]/+page.svelte -->
<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';
  import { writable } from 'svelte/store';

  let tournament;
  let players = [];
  let rankings = [];
  let tournamentId;

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

  const updateRank = async (playerId, newRank) => {
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

  const getPoints = (rank) => {
    switch(rank) {
      case 1: return 100;
      case 2: return 75;
      case 3: return 50;
      case 4: return 25;
      default: return 0;
    }
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
      <div class="flex items-center justify-between bg-[#231a10] px-4 min-h-[72px] py-2 rounded-xl">
        <div>
          <p class="text-white text-base font-medium">{player.name}</p>
          <p class="text-[#cbb090] text-sm">
            Points: {getPoints(rankings.find(r => r.player_id === player.id)?.rank) || 0}
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            on:click={() => {
              const currentRank = rankings.find(r => r.player_id === player.id)?.rank || 0;
              if (currentRank > 1) updateRank(player.id, currentRank - 1);
            }}
            class="text-white"
            disabled={!rankings.find(r => r.player_id === player.id)?.rank || rankings.find(r => r.player_id === player.id).rank <= 1}
          >
            -
          </button>
          <span class="text-white">
            {rankings.find(r => r.player_id === player.id)?.rank || 'Unranked'}
          </span>
          <button
            on:click={() => {
              const currentRank = rankings.find(r => r.player_id === player.id)?.rank || 0;
              if (currentRank < 8) updateRank(player.id, currentRank + 1);
            }}
            class="text-white"
            disabled={!rankings.find(r => r.player_id === player.id)?.rank || rankings.find(r => r.player_id === player.id).rank >= 8}
          >
            +
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

