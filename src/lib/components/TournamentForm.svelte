<!-- src/lib/components/TournamentForm.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/supabase';

  interface Tournament {
    id: number;
    name: string;
    date: string;
    location: string;
  }

  export let tournament: Tournament | null = null; // Se null, è per aggiungere un nuovo torneo
  const dispatch = createEventDispatcher<{
    close: void;
    refresh: void;
  }>();

  let name = tournament ? tournament.name : '';
  let date = tournament ? tournament.date : '';
  let location = tournament ? tournament.location : '';
  let error = '';

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!name.trim()) {
      error = 'Il nome è obbligatorio.';
      return;
    }

    if (tournament) {
      // Aggiorna il torneo esistente
      const { data, error: updateError } = await supabase
        .from('tournaments')
        .update({ name, date, location })
        .eq('id', tournament.id);

      if (updateError) {
        console.error('Errore nell\'aggiornamento del torneo:', updateError);
        error = updateError.message;
      } else {
        dispatch('refresh'); // Emmetti evento di refresh
        dispatch('close');   // Emmetti evento di chiusura
      }
    } else {
      // Crea un nuovo torneo
      const { data, error: insertError } = await supabase
        .from('tournaments')
        .insert([{ name, date, location }]);

      if (insertError) {
        console.error('Errore nell\'aggiunta del torneo:', insertError);
        error = insertError.message;
      } else {
        dispatch('refresh'); // Emmetti evento di refresh
        dispatch('close');   // Emmetti evento di chiusura
      }
    }
  };

  const handleClose = () => {
    dispatch('close');
  };
</script>

<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
  <form class="bg-[#231a10] p-8 rounded-xl w-full max-w-md shadow-xl border-2 border-[#cbb090]/20" on:submit={handleSubmit}>
    <h2 class="text-2xl font-bold mb-8 text-white">{tournament ? 'Modifica Torneo' : 'Aggiungi Nuovo Torneo'}</h2>

    {#if error}
      <div class="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
        {error}
      </div>
    {/if}

    <div class="mb-6">
      <label class="block text-[#cbb090] text-sm font-bold mb-2">Nome</label>
      <input 
        type="text" 
        bind:value={name} 
        class="mt-1 block w-full border-2 border-[#cbb090] bg-[#231a10] text-white rounded-xl p-3 focus:outline-none focus:border-[#f49725] hover:border-[#f49725]/70 placeholder-[#cbb090]/50 transition-all duration-200" 
        required 
        placeholder="Inserisci il nome del torneo"
      />
    </div>

    <div class="mb-6">
      <label class="block text-[#cbb090] text-sm font-bold mb-2">Data</label>
      <input 
        type="date" 
        bind:value={date} 
        class="mt-1 block w-full border-2 border-[#cbb090] bg-[#231a10] text-white rounded-xl p-3 focus:outline-none focus:border-[#f49725] hover:border-[#f49725]/70 transition-all duration-200" 
        required 
      />
    </div>

    <div class="mb-8">
      <label class="block text-[#cbb090] text-sm font-bold mb-2">Luogo</label>
      <input 
        type="text" 
        bind:value={location} 
        class="mt-1 block w-full border-2 border-[#cbb090] bg-[#231a10] text-white rounded-xl p-3 focus:outline-none focus:border-[#f49725] hover:border-[#f49725]/70 placeholder-[#cbb090]/50 transition-all duration-200" 
        required 
        placeholder="Inserisci il luogo del torneo"
      />
    </div>

    <div class="flex justify-end space-x-4">
      <button 
        type="button"
        on:click={handleClose}
        class="flex items-center justify-center rounded-xl h-11 px-6 bg-[#231a10] border-2 border-[#cbb090] text-[#cbb090] text-sm font-bold tracking-wider hover:border-[#f49725] hover:text-[#f49725] transition-all duration-200"
      >
        Annulla
      </button>
      <button 
        type="submit"
        class="flex items-center justify-center rounded-xl h-11 px-6 bg-[#f49725] text-[#231a10] text-sm font-bold tracking-wider hover:bg-[#f49725]/90 shadow-lg transition-all duration-200"
      >
        {tournament ? 'Aggiorna' : 'Aggiungi'}
      </button>
    </div>
  </form>
</div>
