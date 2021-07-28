import { html, render, lzutf8 } from './imports.js';
import { view } from "./view.js";
import { events } from "./events.js";


function setInnerHTML(elm, html) {
  elm.innerHTML = html;
  Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
  	const text = oldScript.innerHTML;
  	(new Function("document", text))(elm); // need to make imports work, this messes up document methods
  	// const newScript = document.createElement("script");
    // Array.from(oldScript.attributes)
    //   .forEach( attr => newScript.setAttribute(attr.name, attr.value) );
    // newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    // oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}

function copy(str) {
	const inp = document.createElement('input');
	document.body.appendChild(inp);
	inp.value = str;
	inp.select();
	document.execCommand('copy', false);
	inp.remove();
}

const STATE = {
	codemirror: undefined,
	url: undefined,
	useShadowDom: true,
};

const ACTIONS = {
	INIT(args, state) {
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

			// state.codemirror.foldRange(0, count+i);

            dispatch("RUN");
	    } else if (file) {
          let file_url = file;
          if (!file.startsWith("http")) {
              file_url = `examples/${file}`;
          }

	      fetch(file_url,  {mode: 'cors'})
	        .then(file => file
	          .text().then( txt => {
	            state.codemirror.view.dispatch({
				  changes: {from: 0, insert: txt}
				});

				// state.codemirror.foldRange(0, count+i);

	            dispatch("RUN");
	          })
	        );
	    } else { /* default */ } 
	},
	RUN(args, state) {
		const html = state.codemirror.view.state.doc.toString();
		const container = document.querySelector(".viewer");

		if (state.useShadowDom) {
			let shadowRoot = container.shadowRoot ?? container.attachShadow({mode: 'open'});
			setInnerHTML(shadowRoot, html);
		} else { // iframe
			const iframe = container;

			var blob = new Blob([html], { type: 'text/html' });
			URL.revokeObjectURL(state.url)
  			state.url = URL.createObjectURL(blob);
  			iframe.src = state.url;


			// this following approach should be faster but doesn't quite work
			// think i need to "clear iframe"

			// clearing appraoches?
			// iframe.src = "about:blank";
  			// iframe.outerHTML = '<iframe></iframe>' // clears the iframe

			// iframe.contentDocument.open();
			// iframe.contentDocument.write(html);
			// iframe.contentDocument.close();
		}
	},
	SHARE(args, state) {
		const string = state.codemirror.view.state.doc.toString();
		const encoded = lzutf8.compress(string, { outputEncoding: "StorageBinaryString" });
		const address = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
    	copy(address);
	},
	CHANGE_RENDERER({ type }, state) {
		if (type === "iframe") state.useShadowDom = false;
		else state.useShadowDom = true;
		dispatch("RENDER");
		dispatch("RUN");
	},
	RENDER() {
		console.log("rendered")
	}
}

export function dispatch(action, args = {}, rerender = true) {
	const trigger = ACTIONS[action];
	if (trigger) trigger(args, STATE);
	else console.log("Action not recongnized:", action);

	if (rerender) {
		render(view(STATE), document.getElementById("root"));
	}
}
