<script>
	// definisci la promise ma non la spetti qui
	const response = fetch("api/test").then((res) => res.json());
</script>

<main>
	<p class="text-red-600 font-bold">
		Ciao! Questo è un test per la configurazione con tailwind! Questo è il
		tuo numero:
		{#await response}
			IN CARICAMENTO FIGA
		{:then numero}
			{numero.numero}
		{/await}
	</p>
</main>
