<script lang="ts">
  import { onMount } from "svelte";
  import mermaid from "mermaid";
  import type { Schema } from "../lib";

  export let schema: Schema;

  let container: HTMLDivElement;

  let isInitialized = false;

  let errorMessage: string = null;

  export function initMermaid() {
    mermaid.mermaidAPI.initialize({ startOnLoad: false });
    isInitialized = true;
  }

  export function setMermaid(elementId: string, graphDefinition: string) {

    mermaid.mermaidAPI.parse(graphDefinition);

    mermaid.mermaidAPI.render(
      elementId,
      graphDefinition,
      (svgCode: string) => (container.innerHTML = svgCode)
    );

  }

  $: {
    // HACK 'mermaid' doesn't seem to do anything here
    if (isInitialized)
      try {
        setMermaid("mermaid", schema.body);
        errorMessage = null;
      } catch (e) {
        console.error(e);
        errorMessage = e.str;
      }
  }

  onMount(() => {
    initMermaid();
  });
</script>

<div id="mermaidContainer">
  {#if errorMessage}
    <div class="error">
      {errorMessage}
    </div>
  {/if}

  <div id="container" bind:this={container} />
</div>

<style>
  .error {
    background-color: rgba(255, 0, 0, 0.5);
    border: 1px solid darkred;
    padding: 1.5vw;
    white-space: pre;
  }
</style>
