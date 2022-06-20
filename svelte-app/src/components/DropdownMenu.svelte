<script lang="ts">
  import { createPopperActions } from "svelte-popperjs";

  const [popperRef, popperContent] = createPopperActions({
    placement: "bottom",
    strategy: "fixed",
  });

  const extraOpts = {
    modifiers: [{ name: "offset", options: { offset: [0, 8] } }],
  };

  let showTooltip = false;

  // Exported props
  export let callbackNewSwaggerV2;
  export let callbackNewOpenApiV3;
  export let callbackNewAsyncApiV2;
  export let callbackNewMermaid;

  function handleClick() {
    showTooltip = !showTooltip;
  }

  function handleNewSwaggerV2() {
    callbackNewSwaggerV2();
    handleClick();
  }

  function handleNewOpenApiV3() {
    callbackNewOpenApiV3();
    handleClick();
  }

  function handleNewAsyncApiV2() {
    callbackNewAsyncApiV2();
    handleClick();
  }

  function handleNewMermaid() {
    callbackNewMermaid();
    handleClick();
  }
</script>

<button use:popperRef on:click={handleClick}> New </button>
{#if showTooltip}
  <ul id="tooltip" use:popperContent={extraOpts}>
    <li on:click={handleNewSwaggerV2}>Swagger (v2)</li>
    <li on:click={handleNewOpenApiV3}>OpenAPI (v3)</li>
    <li on:click={handleNewAsyncApiV2}>AsycAPI (v2)</li>
    <li on:click={handleNewMermaid}>Mermaid</li>
  </ul>
{/if}

<style>
  #tooltip {
    display: inline-block;
    background: black;
    color: white;
    padding: 5px 10px;
    font-size: 13px;
    z-index: 999;
  }
  #tooltip li {
    padding: 12px;
  }
  #tooltip li:hover {
    background-color: white;
    color: black;
  }

  /* #tooltip[data-popper-placement^="top"] > #arrow {
    bottom: -4px;
  }

  #tooltip[data-popper-placement^="bottom"] > #arrow {
    top: -4px;
  }

  #tooltip[data-popper-placement^="left"] > #arrow {
    right: -4px;
  }

  #tooltip[data-popper-placement^="right"] > #arrow {
    left: -4px;
  } */
</style>
