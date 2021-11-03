import { events } from "./events.js";
import { defaultProg } from "./defaultProg.js";
import lzutf8 from "lzutf8";

export function init(state) {

	const url = new URL(window.location.href);

	const search = window.location.search;
	const code = new URLSearchParams(search).get("code");
	const file = new URLSearchParams(search).get("file");
	const vert = new URLSearchParams(search).get("vert");
	const rendererType = new URLSearchParams(search).get("rendererType");
	const editorType = new URLSearchParams(search).get("editorType");

	if (vert) document.documentElement.style.setProperty("--vertical-bar", `${vert}%`);
	if (rendererType) state.rendererType = rendererType;
	if (editorType) state.editorType = editorType;

	dispatch("RENDER");
	state.codemirror = document.querySelector("#code-editor");
	events(state);

	if (code) { // encoded code
		const decoded = lzutf8.decompress(code, { inputEncoding: "StorageBinaryString" });
	  	state.codemirror.view.dispatch({
		  changes: {from: 0, insert: decoded}
		});

		dispatch("RUN");
	} else if (file) {
	    const file_url = file.startsWith("http") ? file : `examples/${file}`;

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
	