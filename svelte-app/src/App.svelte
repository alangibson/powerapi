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
  import Ajv, { stringify } from "ajv";
  import AjvDraft04 from "ajv-draft-04";
  import addFormats from "ajv-formats";
  import yaml from "js-yaml";
  import type { Schema } from './lib';
  import SwaggerUiComponent from "./components/SwaggerUI.svelte";
  import MermaidUiComponent from "./components/MermaidUi.svelte";
  import DropdownMenu from "./components/DropdownMenu.svelte";
  // Templates
  import OpenApiV3Template from "./templates/openapi-v3";
  import AsyncApiV3Template from "./templates/asyncapi-v2";
  import SwaggerV2Template from "./templates/swagger-v2";
  import MermaidTemplate from './templates/mermaid';
  // Default schemas
  import AsyncApi200Schema from "./schemas/asyncapi-v2.0.0";
  import Swagger20Schema from "./schemas/swagger-v2.0";
  import OpenApi30Schema from "./schemas/openapi-v3.0";
  import OpenApi31Schema from "./schemas/openapi-v3.1";

  enum DocumentFormat {
    JSON = 'json',
    YAML = 'yaml',
    MERMAID = 'mermaid'
  }

  enum DocumentGrammar {
    AUTO = 'auto',
    OPENAPI = 'openapi',
    ASYNCAPI = 'asyncapi',
    MERMAID = 'mermaid'
  }

  // Should we autodetect document format?
  // let shouldAutodetectDocFormat = true;

  let hasConfluence: boolean = true;

  // Format of document displayed in editor.
  // One of 'yaml', 'json', 'mermaid', 'plantuml'
  let docFormat: DocumentFormat = DocumentFormat.JSON;

  // Document text
  let text: string = "{}"; // string

  // Editor configuration
  let tabSpaces: number = 2;
  
  // CodeMirror object
  // Set in initCodeMirror(), which is called in onMount()
  let editor: EditorView;

  let asyncApiConfig: object = {};

  // Reactively parse editor content, frequently catching JSON parse error
  $: [schema, parseError] = parseDocumentText(text, docFormat);

  // Reactively detect document type
  // Either openapi, asyncapi or auto for autodetection
  // $: [docGrammar, docGrammarVersion] = detectDocGrammar(schema, DocumentGrammar.AUTO);
  let docGrammar: DocumentGrammar = DocumentGrammar.AUTO;
  let docGrammarVersion: string;

  // Reactively define and execute document validator
  $: validator = loadValidator(docGrammar, docGrammarVersion);

  // let valid = false;
  // let validationError = null;
  $: [valid, validationError] = validate(validator, schema);

  /* Detect if schema is a Mermaid document */
  function isMermaid(schema: Schema): boolean {
    const headers = ['graph', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 
      'stateDiagram-v2', 'gantt', 'pie', 'erDiagram', 'journey', 'gitGraph'];
    const header = schema?.body.split(/\r\n|\r|\n/)?.[0].trim().split(' ')?.[0].trim();
    console.debug('Detected Mermaid header type');
    return headers.includes(header);
  }

  /* Detect document type by introspecting schema
   * TODO This is seems dumb. Won't we always know the type of diagram?
   */
  function detectDocGrammar(schema: Schema, defaultType: DocumentGrammar): [DocumentGrammar, string] {
    try {
      console.debug("Autodetecting document type");
      if (schema.openapi) 
        return [DocumentGrammar.OPENAPI, schema.openapi];
      else if (schema.swagger)
      return [DocumentGrammar.OPENAPI, schema.swagger];
      else if (schema.asyncapi) 
        return [DocumentGrammar.ASYNCAPI, schema.asyncapi];
      else if (isMermaid(schema))
        return [DocumentGrammar.MERMAID, '1'];
      else
        return [defaultType, null];
    } catch (e) {
      // Do nothing and wait for document to be valid again
      console.debug("Throwing away error", e);
      return [defaultType, null];
    }
  }

  // Create a document parser for either json or yaml.
  function parseDocumentText(text: string, docFormat: DocumentFormat): [Schema, string] {
    try {
      if (docFormat == DocumentFormat.JSON) 
        return [JSON.parse(text), null];
      else if (docFormat == DocumentFormat.YAML) 
        return [yaml.load(text), null];
      else if (docFormat == DocumentFormat.MERMAID)
        return [ { mermaid: '1', body: text } , null];
      else 
        return [null, `Document format ${docFormat} not supported yet`]
    } catch (e) {
      return [null, e];
    }
  }

  /* Create a schema validator */
  function loadValidator(docGrammar: DocumentGrammar, docGrammarVersion: string) {
    console.debug("loadDocumentSchema", docGrammar, docGrammarVersion);
    const params = { strict: false };
    if (docGrammar == DocumentGrammar.ASYNCAPI && docGrammarVersion == "2.0.0")
      return addFormats(new Ajv(params)).compile(AsyncApi200Schema);
    else if (docGrammar == DocumentGrammar.OPENAPI && docGrammarVersion == "2.0")
      return addFormats(new AjvDraft04(params)).compile(Swagger20Schema);
    else if (docGrammar == DocumentGrammar.OPENAPI && docGrammarVersion == "3.0")
      return addFormats(new AjvDraft04(params)).compile(OpenApi30Schema);
    else if (docGrammar == DocumentGrammar.OPENAPI && docGrammarVersion == "3.1")
      return addFormats(new Ajv(params)).compile(OpenApi31Schema);
    else
      console.warn(`No validator found for ${docGrammar} ${docGrammarVersion}`);
  }

  /* Returns valid boolean and validation error object */
  function validate(validator, schema: Schema) {
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
    else
      return { effects: null };
    // TODO support Mermaid
  });

  /* Initialize CodeMirror editor element
   * When the editor contents change, the global 'text' var is updated.
   */
  function initCodeMirror(): void {
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
            // This is the line that causes the global 'text' var to be updated
            if (v.docChanged) text = v.state.doc.toString();
          }),
        ],
      }),
      parent: document.getElementById("codemirror"),
    });
  }

  /* Toggle between json and yaml */
  function toggleJsonYaml(): void {
    // TODO don't toggle if there is an error condition in the editor content
    let newText;
    if (docFormat == DocumentFormat.YAML) {
      newText = JSON.stringify(schema, null, tabSpaces);
      docFormat = DocumentFormat.JSON;
    } else if (docFormat == DocumentFormat.JSON) {
      newText = yaml.dump(schema);
      docFormat = DocumentFormat.YAML;
    }
    setEditorContents(newText, docGrammar);
  }

  /* Set the contents of the editor window to the provided string */
  function setEditorContents(text: string, newDocGrammar: DocumentGrammar): void {
    // Save the document grammar
    docGrammar = newDocGrammar;

    // HACK Special case for Mermaid
    if (docGrammar == DocumentGrammar.MERMAID)
      docFormat = DocumentFormat.MERMAID;
    else
      docFormat = DocumentFormat.JSON;

    // Update the editor text
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: text,
      },
    });
  }

  function confluenceSave(): void {
    console.warn(`Should save to Confluence: docGrammar=${docGrammar}, docGrammarVersion=${docGrammarVersion}, docFormat=${docFormat}, text=${text}`);
  }

  function confluenceCancel(): void {
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
      callbackNewOpenApiV3={() => setEditorContents(JSON.stringify(OpenApiV3Template, null, tabSpaces), DocumentGrammar.OPENAPI)} 
      callbackNewAsyncApiV2={() => setEditorContents(JSON.stringify(AsyncApiV3Template, null, tabSpaces), DocumentGrammar.ASYNCAPI)}
      callbackNewSwaggerV2={() => setEditorContents(JSON.stringify(SwaggerV2Template, null, tabSpaces), DocumentGrammar.OPENAPI)}
      callbackNewMermaid={() => setEditorContents(MermaidTemplate, DocumentGrammar.MERMAID)}
    />

    <div style="float: right">

      <table style="display: inline;">
        <tr><td>Type</td><td>Version</td><td>Format</td><td>Valid</td></tr>
        <tr><td>{docGrammar}</td><td>{docGrammarVersion}</td><td>{docFormat}</td><td>{valid}</td></tr>
      </table>
      
      {#if hasConfluence}
        <button on:click={confluenceSave}>Save</button>
        <button on:click={confluenceCancel}>Cancel</button>
      {/if}

      <!-- {#if docFormat == DocumentFormat.JSON || docFormat == DocumentFormat.YAML}
        <button on:click={toggleJsonYaml}>{docFormat}</button>
      {/if} -->
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

      {#if docGrammar == DocumentGrammar.ASYNCAPI}
        <asyncapi-component {schema} config={asyncApiConfig} />
      {:else if docGrammar == DocumentGrammar.OPENAPI}
        <SwaggerUiComponent {schema} />
      {:else if docGrammar == DocumentGrammar.MERMAID}
        <MermaidUiComponent {schema} />
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
