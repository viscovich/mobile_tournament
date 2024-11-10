<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css'; 
  import HomeIcon from '$lib/components/HomeIcon.svelte';
  import RankingIcon from '$lib/components/RankingIcon.svelte';
  import PlayersIcon from '$lib/components/PlayersIcon.svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { setUser } from '$lib/stores/auth';
  import type { Session, User } from '@supabase/supabase-js';
  
  interface PageData {
    players?: any[];
    session: Session | null;
  }
  
  export let data: PageData;

  onMount(() => {
    let mounted = true;

    // Initialize auth state
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          setUser(session.user);
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      }
    };

    // Call initialization
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && mounted) {
        setUser(session.user);
      } else if (mounted) {
        setUser(null);
      }
    });

    // Return cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  });

  // Set initial session from server
  $: if (data.session?.user) {
    setUser(data.session.user);
  } else {
    setUser(null);
  }
</script>
  
<div
  class="relative flex flex-col bg-[#231a10] justify-between overflow-x-hidden pb-20"
  style="font-family: Lexend, 'Noto Sans', sans-serif;"
>
  <slot></slot>
  
  <!-- Bottom Navigation Menu -->
  <nav class="fixed bottom-0 left-0 right-0 flex gap-2 border-t border-[#493722] bg-[#342818] px-4 pb-3 pt-2 z-50">
    <a
      class="flex flex-1 flex-col items-center justify-end gap-1 rounded-full {$page.url.pathname === '/' ? 'text-white' : 'text-[#cbb090]'}"
      href="/"
    >
      <HomeIcon size="24px" color={$page.url.pathname === '/' ? '#ffffff' : '#cbb090'} />
      <p class="text-xs font-medium tracking-[0.015em]">
        Home
      </p>
    </a>

    <a
      class="flex flex-1 flex-col items-center justify-end gap-1 {$page.url.pathname === '/players' ? 'text-white' : 'text-[#cbb090]'}"
      href="/players"
    >
      <PlayersIcon size="24px" color={$page.url.pathname === '/players' ? '#ffffff' : '#cbb090'} />
      <p class="text-xs font-medium tracking-[0.015em]">
        Players
      </p>
    </a>
    <a
      class="flex flex-1 flex-col items-center justify-end gap-1 {$page.url.pathname === '/global-ranking' ? 'text-white' : 'text-[#cbb090]'}"
      href="/global-ranking"
    >   
      <RankingIcon size="24px" color={$page.url.pathname === '/global-ranking' ? '#ffffff' : '#cbb090'} />
      <p class="text-xs font-medium tracking-[0.015em]">
        Global Ranking
      </p>
    </a>
  </nav>
</div>
