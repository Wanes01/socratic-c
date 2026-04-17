<script lang="ts">
	import { ui } from "./lib/state/ui-state.svelte";
	import { fs } from "./lib/state/files-state.svelte";
	import { cs } from "./lib/state/chat-state.svelte";
	import { untrack } from "svelte";
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
	import { marked } from "marked";
	import { markedHighlight } from "marked-highlight";
	import hljs from "highlight.js";
	import "highlight.js/styles/atom-one-dark.css";

	const MODELS_REFETCH_SECONDS = 20;

	// sets markdown code highlighting
	marked.use(
		markedHighlight({
			langPrefix: "hljs language-",
			highlight(code, lang) {
				if (lang && hljs.getLanguage(lang)) {
					return hljs.highlight(code, { language: lang }).value;
				}
				return hljs.highlightAuto(code).value;
			},
		}),
	);

	$effect(() => {
		// refreshes models
		const refreshModels = async () => {
			try {
				await cs.refreshAvailableModels();
			} catch (err) {
				console.error("Errore refresh modelli:", err);
			}
		};

		untrack(async () => {
			try {
				// on mount fetches the available language models and the file tree
				await Promise.all([refreshModels(), fs.loadFiles()]);
				cs.setDefaultProvider();
			} catch (err) {
				console.error("Errore inizializzazione app:", err);
			}
		});

		/* Update the available models at regular intervals. This is done to notify
		the user in the event of a network disconnection. */
		const interval = setInterval(
			refreshModels,
			MODELS_REFETCH_SECONDS * 1000,
		);

		return () => clearInterval(interval);
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
		<!-- File editor and terminal -->
		<Pane
			defaultSize={70}
			minSize={0}
			maxSize={100}
			class="border border-white/10"
		>
			<PaneGroup direction="vertical">
				<Pane
					defaultSize={83}
					minSize={20}
					maxSize={100}
					class="border border-white/10"
				>
					{#if fs.selectedExercise}
						<MultiFileEditor />
					{:else}
						<div
							class="flex flex-col w-full h-full items-center justify-center"
						>
							<p class="text-xl italic text-neutral-500/40">
								Seleziona un esercizio...
							</p>
						</div>
					{/if}
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

		<!-- LLM chat -->
		<Pane
			defaultSize={20}
			collapsible={true}
			collapsedSize={0}
			minSize={17}
			maxSize={50}
			class="border border-white/10"
		>
			<AIChat />
		</Pane>
	</PaneGroup>
</div>
