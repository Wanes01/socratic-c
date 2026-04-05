<script>
	let response = "";
	let isStreaming = false;
	let prompt = "";

	async function sendRequest() {
		if (!prompt.trim() || isStreaming) return;

		response = "";
		isStreaming = true;

		const res = await fetch("/api/ollama", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				messages: [{ role: "user", content: prompt }],
			}),
		});

		const reader = res.body.getReader();
		const decoder = new TextDecoder();

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			const text = decoder.decode(value);
			text.split("\n")
				.filter((l) => l.startsWith("data: "))
				.forEach((line) => {
					const data = JSON.parse(line.slice(6));
					if (data.token) response += data.token;
				});
		}

		isStreaming = false;
	}
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-8">
	<div
		class="w-full max-w-2xl bg-white rounded-2xl shadow p-6 flex flex-col gap-4"
	>
		<h1 class="text-lg font-medium text-gray-800">SSE Test</h1>

		<textarea
			bind:value={prompt}
			placeholder="Scrivi un messaggio..."
			rows="3"
			class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
		></textarea>

		<button
			on:click={sendRequest}
			disabled={isStreaming}
			class="self-end bg-blue-600 text-white text-sm px-5 py-2 rounded-xl disabled:opacity-50"
		>
			{isStreaming ? "Streaming..." : "Invia"}
		</button>

		{#if response || isStreaming}
			<div
				class="border border-gray-100 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-800 min-h-[80px] whitespace-pre-wrap"
			>
				{response}{#if isStreaming}<span class="animate-pulse">▋</span
					>{/if}
			</div>
		{/if}
	</div>
</div>
