import { events } from "./events.js";
import { defaultProg } from "./defaultProg.js";

export function init(state) {
	dispatch("RENDER");
	state.codemirror = document.querySelector("#code-editor");
	events(state);

	const url = new URL(window.location.href);

	const search = window.location.search;
	const code = new URLSearchParams(search).get("code");
	const file = new URLSearchParams(search).get("file");
	const vert = new URLSearchParams(search).get("vert");
	const renderer = new URLSearchParams(search).get("renderer");

	if (vert) document.documentElement.style.setProperty("--vertical-bar", `${vert}%`);
	if (renderer === "iframe") state.useShadowDom = false;
	if (renderer === "shadow-dom") state.useShadowDom = true;

	if (code) { // encoded code
		const decoded = lzutf8.decompress(code, { inputEncoding: "StorageBinaryString" });
	  	state.codemirror.view.dispatch({
		  changes: {from: 0, insert: decoded}
		});

		dispatch("RUN");
	} else if (file) {
	    let file_url = file;
	    if (!file.startsWith("http")) {
	        file_url = `examples/${file}`;
	    }

	  fetch(file_url,  {mode: 'cors'})
	    .then(file => file
	      .text().then( txt => {
	        state.codemirror.view.dispatch({ changes: {from: 0, insert: txt} });
	        dispatch("RUN");
	      })
	    );
	} else { 
		const saved = window.localStorage.getItem("cm-prog")
	  state.codemirror.view.dispatch({
	    changes: { from: 0, insert: !saved ? defaultProg.trim() : saved }
	  });

	  dispatch("RUN");
	} 
}
	