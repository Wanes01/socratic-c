<script lang="ts">
	import { ui } from "./lib/state/UIState.svelte";
	import { fs } from "./lib/state/FileState.svelte";
	import { PaneGroup, Pane } from "paneforge";
	import HandleResizer from "./lib/components/ui/HandleResizer.svelte";
	import AppBar from "./lib/components/layout/AppBar.svelte";
	import MultiFileEditor from "./lib/components/editor/MultiFileEditor.svelte";
	import Explorer from "./lib/components/explorer/Explorer.svelte";
	import ContextMenu from "./lib/components/ui/ContextMenu.svelte";
	import ConfirmModal from "./lib/components/ui/ConfirmModal.svelte";
	import Toast from "./lib/components/ui/Toast.svelte";
	import Terminal from "./lib/components/terminal/Terminal.svelte";
	import AIChat from "./lib/components/chat/AIChat.svelte";

	$effect(() => {
		// loads the file tree
		fs.loadFiles();
	});
</script>

<!-- the singleton context menu -->
<ConfirmModal />
{#if ui.contextMenu}
	<ContextMenu
		x={ui.contextMenu.x}
		y={ui.contextMenu.y}
		options={ui.contextMenu.options}
		onclose={() => ui.closeContextMenu()}
	/>
{/if}

{#if ui.toast}
	<Toast />
{/if}

<div
	class="h-screen w-screen bg-neutral-800 text-gray-300 flex flex-col font-inter overflow-hidden text-sm"
>
	<AppBar />
	<PaneGroup direction="horizontal" class="w-full flex-1">
		<!-- file explorer -->
		<Pane
			collapsible={true}
			collapsedSize={0}
			minSize={8}
			defaultSize={10}
			maxSize={40}
			class="border border-white/10"
		>
			<Explorer />
		</Pane>
		<HandleResizer direction="vertical" />
		<!-- Editor e terminale -->
		<Pane
			defaultSize={70}
			minSize={0}
			maxSize={100}
			class="border border-white/10"
		>
			<PaneGroup direction="vertical">
				<!-- Opened file selector and editor -->
				<Pane
					defaultSize={83}
					minSize={20}
					maxSize={100}
					class="border border-white/10"
				>
					<MultiFileEditor />
				</Pane>
				<HandleResizer direction="horizontal" />
				<!-- Terminale -->
				<Pane
					defaultSize={17}
					minSize={0}
					maxSize={90}
					class="border border-white/10"
				>
					<Terminal />
				</Pane>
			</PaneGroup>
		</Pane>
		<HandleResizer direction="vertical" />

		<!-- Chat ollama -->
		<Pane
			defaultSize={20}
			collapsible={true}
			collapsedSize={0}
			minSize={20}
			maxSize={50}
			class="border border-white/10"
		>
			<AIChat />
		</Pane>
	</PaneGroup>
</div>
