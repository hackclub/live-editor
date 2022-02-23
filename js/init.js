import { events } from "./events.js";
import { defaultProg } from "./defaultProg.js";
import { dispatch } from "./dispatch.js";
import { html, render, svg } from "https://unpkg.com/lit-html@2.0.1/lit-html.js";

export function initSandbox(templateAddress) {
	const sandbox = document.querySelector(".iframe-sandbox");

	const string = `
		<style>
			body {
				margin: 0px;
			}
		</style>
		<script defer type="module">
			import evalUserCode from "${templateAddress}";

			window.onmessage = function(e) {
        const { data } = e;
        const { program } = data;

        try {
        	evalUserCode(program);
        } catch (err) {
        	e.source.postMessage(err, e.origin);
        }
      };
		</script>
		<body></body>
	`

	const blob = new Blob([string], { type: 'text/html' });
	sandbox.src = URL.createObjectURL(blob);
}

export function init(state) {

	const url = new URL(window.location.href);

	const search = window.location.search;
	const code = new URLSearchParams(search).get("code");
	const file = new URLSearchParams(search).get("file");
	const vert = new URLSearchParams(search).get("vert");

	if (vert) document.documentElement.style.setProperty("--vertical-bar", `${vert}%`);

	dispatch("RENDER");
	state.codemirror = document.querySelector("#code-editor");

	initSandbox(state.template);

	events(state);

	if (file) { // if file then load from url
  	
    fetch(file,  {mode: 'cors'})
			.then( file => file
			.text()
			.then( txt => {
			    dispatch("SET_SAVE_STATE", { stateString: txt });

			    // should I auto-run, can be nice but also good to give user chance to see code
			}));

		
	} else { // else load default
		state.codemirror.view.dispatch({
			changes: { from: 0, insert: defaultProg.trim() }
		});

		// dispatch("RUN");
	}

	const saved = window.localStorage.getItem("cm-prog");
	
	if (saved) { // give option to load saved in notification
		dispatch("NOTIFICATION", { message: html`
			You have a file cached would you like to 
			<button @click=${() => dispatch("SET_SAVE_STATE", { stateString: saved })}>load it</button>.
		`});

		// helpful during dev

		dispatch("SET_SAVE_STATE", { stateString: saved });
		// dispatch("RUN");
	}

}












	