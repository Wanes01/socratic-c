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
	<PaneGroup direction="horizontal" class="w-full flex-1">
		<!-- file explorer -->
		<Pane
			defaultSize={10}
			minSize={0}
			maxSize={40}
			class="border border-white/10"
		>
			<div class="p-4">File explorer</div>
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
					<FileEditor bind:value={editorValue} />
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
