<script lang="ts">
  import { EditorView, basicSetup } from "@codemirror/basic-setup";
  import { EditorState, Compartment } from "@codemirror/state";
  import { lineNumbers, keymap } from "@codemirror/view";
  import { indentWithTab } from "@codemirror/commands";
  import { onMount } from "svelte";
  import "@asyncapi/web-component/lib/asyncapi-web-component";
  import { json } from "@codemirror/lang-json";
  import { StreamLanguage } from '@codemirror/language';
  import { yaml as yamlMode } from "@codemirror/legacy-modes/mode/yaml"
  import Ajv from "ajv";
  import AjvDraft04 from "ajv-draft-04";
  import addFormats from "ajv-formats";
  import yaml from "js-yaml";
  import SwaggerUiComponent from "./components/SwaggerUI.svelte";
  import DropdownMenu from "./components/DropdownMenu.svelte";
  import OpenApiV3Template from "./templates/openapi-v3";
  import AsyncApiV3Template from "./templates/asyncapi-v2";
  import SwaggerV2Template from "./templates/swagger-v2";
  import AsyncApi200Schema from "./schemas/asyncapi-v2.0.0";
  import Swagger20Schema from "./schemas/swagger-v2.0";
  import OpenApi30Schema from "./schemas/openapi-v3.0";
  import OpenApi31Schema from "./schemas/openapi-v3.1";

  // Should we autodetect document format?
  // let shouldAutodetectDocFormat = true;

  let hasConfluence = true;

  // One of 'yaml', 'json', 'mermaid', 'plantuml'
  let docFormat = "json";
  // Document text
  let text = "{}"; // string

  // Editor configuration
  let tabSpaces = 2;
  // CodeMirror object
  let editor;

  let asyncApiConfig = {};

  // Reactively parse editor content, frequently catching JSON parse error
  $: [schema, parseError] = loadParser(text, docFormat);

  // Reactively detect document type
  // Either openapi, asyncapi or auto for autodetection
  $: [docType, docTypeVersion] = detectDocType(schema, 'auto');

  // TODO Reactively detect document format

  // Reactively define and execute document validator
  $: validator = loadValidator(docType, docTypeVersion);

  // let valid = false;
  // let validationError = null;
  $: [valid, validationError] = validate(validator, schema);

  function detectDocType(schema, defaultType) {
    try {
      console.debug("Autodetecting document type");
      if (schema.openapi) 
        return ["openapi", schema.openapi];
      else if (schema.swagger)
      return ["openapi", schema.swagger];
      else if (schema.asyncapi) 
        return ["asyncapi", schema.asyncapi];
      else
        return [defaultType, null];
    } catch (e) {
      // Do nothing and wait for document to be valid again
      console.debug("Throwing away error", e);
      return [defaultType, null];
    }
  }

  /* Create a document parser */
  function loadParser(text, docFormat) {
    try {
      if (docFormat == "json") 
        return [JSON.parse(text), null];
      else if (docFormat == 'yaml') 
        return [yaml.load(text), null];
      else 
        return [null, `Document format ${docFormat} not supported yet`]
    } catch (e) {
      return [null, e];
    }
  }

  /* Create a schema validator */
  function loadValidator(docType, docTypeVersion) {
    console.debug("loadDocumentSchema", docType, docTypeVersion);
    const params = { strict: false };
    if (docType == "asyncapi" && docTypeVersion == "2.0.0")
      return addFormats(new Ajv(params)).compile(AsyncApi200Schema);
    else if (docType == "openapi" && docTypeVersion == "2.0")
      return addFormats(new AjvDraft04(params)).compile(Swagger20Schema);
    else if (docType == "openapi" && docTypeVersion == "3.0")
      return addFormats(new AjvDraft04(params)).compile(OpenApi30Schema);
    else if (docType == "openapi" && docTypeVersion == "3.1")
      return addFormats(new Ajv(params)).compile(OpenApi31Schema);
  }

  /* Returns valid boolean and validation error object */
  function validate(validator, schema) {
    if (validator && schema) {
      try {
        return [validator(schema), validator.errors];
      } catch (e) {
        return [false, e];
      }
    }
    return [false, null];
  }

  const languageConf = new Compartment();

  /* Automatically configure editor language
   * https://codemirror.net/6/examples/config/
   */
  const autoLanguage = EditorState.transactionExtender.of((tr) => {
    if (!tr.docChanged) return null;
    if (docFormat == 'json')
      return { effects: languageConf.reconfigure(json()) };
    else if (docFormat == 'yaml')
      return { effects: languageConf.reconfigure(StreamLanguage.define(yamlMode)) };
    // TODO support other languages
  });

  /* Initialize CodeMirror editor element */
  function initCodeMirror() {
    editor = new EditorView({
      state: EditorState.create({
        extensions: [
          basicSetup,
          EditorView.lineWrapping,
          languageConf.of(json()), // Language is JSON by default
          autoLanguage,
          keymap.of([indentWithTab]),
          lineNumbers(),
          // TODO typescript -> v: ViewUpdate
          EditorView.updateListener.of((v) => {
            if (v.docChanged) text = v.state.doc.toString();
          }),
        ],
      }),
      parent: document.getElementById("codemirror"),
    });
  }

  /* Toggle between json and yaml */
  function toggleJsonYaml() {
    // TODO don't toggle if there is an error condition in the editor content
    let newText;
    if (docFormat == "yaml") {
      newText = JSON.stringify(schema, null, tabSpaces);
      docFormat = "json";
    } else if (docFormat == "json") {
      newText = yaml.dump(schema);
      docFormat = "yaml";
    }
    setEditorContents(newText);
  }

  /* Set the contents of the editor window to the provided string */
  function setEditorContents(text) {
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: text,
      },
    });
  }

  function newDoc(editor, spec) {
    // TODO don't assume JSON
    setEditorContents(JSON.stringify(spec, null, tabSpaces));
  }

  function confluenceSave() {
    console.warn(`Should save to Confluence: docType=${docType}, docTypeVersion=${docTypeVersion}, docFormat=${docFormat}, text=${text}`);
  }

  function confluenceCancel() {
    console.warn(`Should cancel and go back to Confluence`);
  }

  onMount(() => {
    initCodeMirror();
  });
</script>

<main>
  <nav>
    PowerAPI 

    <DropdownMenu
      callbackNewOpenApiV3={() => newDoc(editor, OpenApiV3Template)}
      callbackNewAsyncApiV2={() => newDoc(editor, AsyncApiV3Template)}
      callbackNewSwaggerV2={() => newDoc(editor, SwaggerV2Template)}
    />

    <div style="float: right">

      <!-- <table style="display: inline;">
        <tr><td>Type</td><td>Version</td><td>Valid</td></tr>
        <tr><td>{docType}</td><td>{docTypeVersion}</td><td>{valid}</td></tr>
      </table> -->
      
      {#if hasConfluence}
        <button on:click={confluenceSave}>Save</button>
        <button on:click={confluenceCancel}>Cancel</button>
      {/if}

      {#if docFormat == "json" || docFormat == "yaml"}
        <button on:click={toggleJsonYaml}>{docFormat}</button>
      {/if}
    </div>
    
  </nav>
  <div id="editor">
    <div id="codemirror" />
    <div id="preview">

      {#if !valid && (parseError || validationError)}
        <div id="errors" style="background-color: rgba(255,0,0,0.2); padding: 8px">
          <h2>Errors</h2>

          {#if parseError}
          <h3>Parse Errors</h3>
          <pre>
            {parseError}
          </pre>
          {/if}
          
          {#if validationError}
          <h3>Validation Errors</h3>
          <pre>
            {JSON.stringify(validationError, null, 2)}
          </pre>
          {/if}

        </div>
      {/if}

      {#if docType == "asyncapi"}
        <asyncapi-component {schema} config={asyncApiConfig} />
      {:else if docType == "openapi"}
        <SwaggerUiComponent {schema} />
      {:else}
        <div id="getting-started">
          <h2>Getting Started</h2>
          <p>
            Create either an OpenAPI (aka Swagger) or AsyncAPI document in the
            editor.
          </p>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  nav {
    padding: 8px;
    background-color: black;
    color: white;
  }
  
  #editor {
    display: flex;
    width: 100%;
    /* TODO subtract nav bar height */
    height: 90vh; 
  }

  #codemirror {
    flex-basis: 50%;
    border-right: 1px solid black;
    height: inherit;
  }

  #codemirror > .cm-editor {
    height: inherit;
  }

  #getting-started {
    padding: 8px;
  }

  /* .cm-content, .cm-gutter { min-height: 150px; }*/
  /* .cm-gutters { margin: 1px; }  */
  /* .cm-scroller {  */
    /* overflow: auto;  */
    /* height: 90vh; */
  /* } */
  /* .cm-wrap { border: 1px solid silver } */

  #preview {
    width: 100%;
    overflow-wrap: anywhere;
    overflow-y: scroll;
  }
</style>
