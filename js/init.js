import { events } from "./events.js";
import { defaultProg } from "./defaultProg.js";

export function init(state) {

	const url = new URL(window.location.href);

	const search = window.location.search;
	const code = new URLSearchParams(search).get("code");
	const file = new URLSearchParams(search).get("file");
	const vert = new URLSearchParams(search).get("vert");

	if (vert) document.documentElement.style.setProperty("--vertical-bar", `${vert}%`);

	dispatch("RENDER");
	state.codemirror = document.querySelector("#code-editor");

	const sandbox = document.querySelector(".iframe-sandbox");

	const templateAddress = "http://localhost:8080/templates/turtle-template.js";

	const string = `
		<style>
			body {
				margin: 0px;
			}
		</style>
		<script type="module">
			import evalUserCode from "${templateAddress}";

			// window.onerror = e => {
			// 	window.parent.postMessage([e], '*');
			// 	window.parent.postMessage("error", '*');
			// }

			// const log = window.console.log;
			// window.console.log = (...args) => {
			// 	window.parent.postMessage(args, '*');
			// 	log(...args);
			// }

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

	events(state);

	if (file) {
    let file_url = file;

  	if (!file.startsWith("http")) file = `examples/${file}`;

    fetch(file_url,  {mode: 'cors'})
		.then( file => file
		.text()
		.then( txt => {
		    state.codemirror.view.dispatch({ changes: {from: 0, insert: txt} });
		    dispatch("RUN");
		}));
		
	} else { 
		const saved = window.localStorage.getItem("cm-prog")
		state.codemirror.view.dispatch({
			changes: { from: 0, insert: !saved ? defaultProg.trim() : saved }
		});

		dispatch("RUN");
	}
}












	