<script lang="ts">
	import { PaneGroup, Pane } from "paneforge";
	import HandleResizer from "./lib/HandleResizer.svelte";
	import AppBar from "./lib/AppBar.svelte";
	import FileEditor from "./lib/FileEditor.svelte";

	let editorValue = $state("");
</script>

<div
	class="h-screen w-screen bg-neutral-800 text-gray-300 flex flex-col font-sans overflow-hidden"
>
	<AppBar />
	<!-- intera schermata tranne l'heading -->
	<PaneGroup direction="vertical" class="w-full flex-1">
		<!-- parte orizzontale divisa in 3 -->
		<Pane
			defaultSize={70}
			minSize={5}
			maxSize={95}
			class="border border-white/10"
		>
			<PaneGroup direction="horizontal">
				<!-- file explorer -->
				<Pane
					defaultSize={15}
					minSize={0}
					maxSize={75}
					class="border border-white/10"
				>
					<div class="p-4">File explorer</div>
				</Pane>
				<HandleResizer direction="vertical" />
				<!-- file editor -->
				<Pane
					defaultSize={65}
					minSize={20}
					maxSize={100}
					class="border border-white/10"
				>
					<FileEditor bind:value={editorValue} />
				</Pane>
				<HandleResizer direction="vertical" />
				<!-- chat con ollama -->
				<Pane
					defaultSize={20}
					minSize={0}
					maxSize={50}
					class="border border-white/10"
				>
					<div class="p-4">Chat con ollama</div>
				</Pane>
			</PaneGroup>
		</Pane>
		<HandleResizer direction="horizontal" />
		<!-- Terminale -->
		<Pane
			defaultSize={30}
			minSize={0}
			maxSize={90}
			class="border border-white/10"
		>
			<div class="p-4">Terminale</div>
		</Pane>
	</PaneGroup>
</div>
