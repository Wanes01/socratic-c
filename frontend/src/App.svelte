<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";
</script>

<div
	class="h-screen w-screen bg-neutral-800 text-gray-300 font-sans overflow-hidden"
>
	<!-- intera schermata tranne l'heading -->
	<PaneGroup direction="vertical" class="h-full w-full">
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
					defaultSize={25}
					minSize={0}
					maxSize={75}
					class="border border-white/10"
				>
					<div class="p-4">File explorer</div>
				</Pane>
				<PaneResizer
					class="w-1 bg-neutral-700 hover:bg-blue-500 transition-colors"
				/>
				<!-- file editor -->
				<Pane
					defaultSize={55}
					minSize={20}
					maxSize={100}
					class="border border-white/10"
				>
					<div class="p-4">File editor</div>
				</Pane>
				<PaneResizer
					class="w-1 bg-neutral-700 hover:bg-blue-500 transition-colors"
				/>
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
		<PaneResizer
			class="h-1 bg-neutral-700 hover:bg-blue-500 transition-colors"
		/>
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
