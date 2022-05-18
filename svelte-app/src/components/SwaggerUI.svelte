<script lang="ts">
  import { onMount } from "svelte";
  import SwaggerUI from "swagger-ui";

  export let schema;
  let swaggerUi;

  $: {
    if (swaggerUi) swaggerUi.getStore().dispatch({
      type: "spec_update_json",
      payload: schema,
    });
  }

  onMount(() => {
    // Construct SwaggerUI renderer
    swaggerUi = SwaggerUI({
      dom_id: "#openapi",
      spec: schema,
    });
  });
</script>

<div id="openapi" />
