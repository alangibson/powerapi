import './global.css';
import 'swagger-ui/dist/swagger-ui.css';
// import "@asyncapi/react-component/lib/styles/fiori.css";

import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
	}
});

export default app;
