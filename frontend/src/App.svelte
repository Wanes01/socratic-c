<script lang="ts">
	import { PaneGroup, Pane } from "paneforge";
	import HandleResizer from "./lib/components/HandleResizer.svelte";
	import AppBar from "./lib/components/AppBar.svelte";
	import FileEditor from "./lib/components/FileEditor.svelte";
	import Explorer from "./lib/components/explorer/Explorer.svelte";
	import { appState } from "./lib/state/app-state.svelte";

	$effect(() => {
		// loads the file tree
		appState.loadFiles();
	});

	let editorValue = $state("");
</script>

<div
	class="h-screen w-screen bg-neutral-800 text-gray-300 flex flex-col font-inter overflow-hidden text-sm"
>
	<AppBar />
	<PaneGroup direction="horizontal" class="w-full flex-1">
		<!-- file explorer -->
		<Pane
			defaultSize={10}
			minSize={0}
			maxSize={40}
			class="border border-white/10"
		>
			<Explorer />
		</Pane>
		<HandleResizer direction="vertical" />
		<!-- Editor e terminale -->
		<Pane
			defaultSize={75}
			minSize={0}
			maxSize={100}
			class="border border-white/10"
		>
			<PaneGroup direction="vertical">
				<!-- Editor -->
				<Pane
					defaultSize={83}
					minSize={20}
					maxSize={100}
					class="border border-white/10"
				>
					<FileEditor bind:value={editorValue} language=".c" />
				</Pane>
				<HandleResizer direction="horizontal" />
				<!-- Terminale -->
				<Pane
					defaultSize={17}
					minSize={0}
					maxSize={90}
					class="border border-white/10"
				>
					<div class="p-4">Terminale</div>
				</Pane>
			</PaneGroup>
		</Pane>
		<HandleResizer direction="vertical" />

		<!-- Chat ollama -->
		<Pane
			defaultSize={15}
			minSize={0}
			maxSize={50}
			class="border border-white/10"
		>
			<div class="p-4">Chat con ollama</div>
		</Pane>
	</PaneGroup>
</div>
