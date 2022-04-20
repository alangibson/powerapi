<script>
  import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";
  import { lineNumbers } from "@codemirror/view";
  import { onMount } from "svelte";
  import SwaggerUI from "swagger-ui";

  onMount(() => {
    let editor = new EditorView({
      state: EditorState.create({
        extensions: [basicSetup, lineNumbers()],
      }),
      parent: document.getElementById("codemirror"),
    });

    SwaggerUI({
      dom_id: "#preview",
    });
  });
</script>

<main>
  <nav>Navbar</nav>
  <div id="editor">
    <div id="codemirror" />
    <div id="preview">&nbsp;</div>
  </div>
</main>

<style>
  nav {
    background-color: black;
    color: white;
  }
  #editor {
    display: flex;
    width: 100%;
    height: 100vh;
  }
  #codemirror {
    flex-basis: 50%;
  }
  #preview {
    background-color: lightblue;
  }
</style>
