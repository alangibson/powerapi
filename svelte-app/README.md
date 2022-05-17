
# TODO

- Save settings to local browser storage
- Allow resizing editor width
- Support Typescript
- Confluence endpoints

- Support Graphviz: https://github.com/aduh95/viz.js
- Support DBML: https://github.com/softwaretechnik-berlin/dbml-renderer
- Support GraphQL: https://github.com/graphql/graphiql
- Support Mermaid: https://mermaid-js.github.io

## Get started

Install the dependencies...

```bash
cd svelte-app
npm install
```

...then start webpack:

```bash
npm run dev
```

Navigate to [localhost:8080](http://localhost:8080). You should see your app running. Edit a component file in `src`, save it, and the page should reload with your changes.


## Deploying to the web

### With [now](https://zeit.co/now)

Install `now` if you haven't already:

```bash
npm install -g now
```

Then, from within your project folder:

```bash
now
```

As an alternative, use the [Now desktop client](https://zeit.co/download) and simply drag the unzipped project folder to the taskbar icon.

### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
npm install -g surge
```

Then, from within your project folder:

```bash
npm run build
surge public
```