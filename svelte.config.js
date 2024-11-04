// svelte.config.js
import adapter from '@sveltejs/adapter-node'; // Import del nuovo adapter
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter(),
    // Altre opzioni se necessario
  }
};

export default config;

