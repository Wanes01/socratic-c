<script>
    import Button from "./Button.svelte";
</script>

<div class="flex flex-row p-3 justify-between items-center">
    <p class="font-mono font-extrabold text-2xl text-white">
        socrati<span class="text-purple-400">c_c</span>
    </p>
    <div class="flex flex-row gap-3">
        <Button text="Compila" icon="compile.svg" />
        <Button text="Esegui" icon="run.svg" />
        <Button text="Chiedi un suggerimento all'IA" icon="question.svg" />
    </div>
</div>
