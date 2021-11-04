import { html, render, svg } from 'lit-html';
import lzutf8 from 'lzutf8';
import { view } from "./view.js";
import { init } from "./init.js";


function setInnerHTML(elm, html) {
  elm.innerHTML = html;
  Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
  	const text = oldScript.innerHTML;
  	eval(text);
  	// (new Function("dom", text))(elm); // need to make imports work, this messes up document methods


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
	editorType: "html", // | js
	rendererType: "iframe", // dom | shadow-dom
	shareType: "airtable",
	examples: [],
	name: "name-here",
};

// const esm = ({ raw }, ...vals) => URL.createObjectURL(new Blob([String.raw({ raw }, ...vals)], {type: 'text/javascript'}));

// const run = async (code) => import(code);

// const code0 = esm`
//   export function f() { return 'blob 2' }
//   console.log("blob 1")
// `;

// const code1 = esm`
//   import { f } from "${code0}";
//   console.log(f())
// `;

// import(code1);
// let imported;

const ACTIONS = {
	INIT(args, state) {
		init(state);
	},
	RUN(args, state) {
		const string = state.codemirror.view.state.doc.toString();
		// const container = document.querySelector(".viewer");

		// if (state.useShadowDom) {
		// 	let shadowRoot = container.shadowRoot ?? container.attachShadow({mode: 'open'});
		// 	setInnerHTML(shadowRoot, html);
		// }

		if (state.editorType === "js") {
			const hasImport = /import\s/.test(string);
			if (hasImport) {
				// how to inject includes into this scope?
				const blob = URL.createObjectURL(new Blob([string], {type: 'text/javascript'}));
				import(blob).then(res => {
					// imported = res;
					// console.log(imported);
					// TODO: these are accumulating how can I clear them out?
				});
				URL.revokeObjectURL(blob);
			} else {
				// console.time("eval");
		  // 	eval(string);
		  // 	console.timeEnd("eval");

		  	// console.time("func");
		  	const included = { html, render, svg }; // these only work if no other imports
		  	(new Function(...Object.keys(included), string))(...Object.values(included));
		  	// console.timeEnd("func");
			}
		}

		if (state.editorType === "html" && state.rendererType === "iframe") { // iframe
			const iframe = document.querySelector(".viewer");

			var blob = new Blob([string], { type: 'text/html' });
			URL.revokeObjectURL(state.url)
			state.url = URL.createObjectURL(blob);
			iframe.src = state.url;
		}

		if (state.editorType === "html" && state.rendererType === "shadow-dom") { // iframe
			const main = document.querySelector("main");
			let shadowRoot = main.shadowRoot ?? main.attachShadow({mode: 'open'});
			setInnerHTML(shadowRoot, string);
		}

		if (state.editorType === "html" && state.rendererType === "dom") { // iframe
			const main = document.querySelector("main");
			setInnerHTML(main, string);
		}
	},
	SHARE_TYPE({ type }, state) {
		state.shareType = type;
		dispatch("RENDER");
	},
	SHARE({type}, state) {
		const string = state.codemirror.view.state.doc.toString();

		if (state.shareType === "binary-url" && type === "link") {
			const encoded = lzutf8.compress(string, { outputEncoding: "StorageBinaryString" });
			const address = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
	    copy(address);
		}

		if (state.shareType === "airtable" && type === "link") {
			const url = 'https://airbridge.hackclub.com/v0.2/Saved%20Projects/Live%20Editor%20Projects/?authKey=reczbhVzrrkChMMiN1635964782lucs2mn97s';
			(async () => {
  			const res = await fetch(url, {
			    method: "POST",
			    headers: {'Content-Type': 'application/json'},
			    body: JSON.stringify({
			      "Content": string
			    })
			  }).then(r => r.json())

  			copy(res.fields["Link"]);
			})()
		}

		if (type === "file") {
			downloadText(`${state.name}.${state.editorType}`,string);
		}	

	},
	RENDERER_TYPE({ type }, state) {
		state.rendererType = type;
		dispatch("RENDER");
		dispatch("RUN");
	},
	EDITOR_TYPE({ type }, state) {
		// if (type === "iframe") state.useShadowDom = false;
		// else state.useShadowDom = true;
		const string = state.codemirror.view.state.doc.toString();
		state.editorType = type;
		dispatch("RENDER");
		state.codemirror = document.querySelector("#code-editor");
		state.codemirror.view.dispatch({
			changes: { from: 0, insert: string }
		});
		dispatch("RUN");
	},
	LOAD_EXAMPLE({ content }, state) {
		const string = state.codemirror.view.state.doc.toString();
		state.codemirror.view.dispatch({
			changes: { from: 0, to: string.length, insert: content }
		});
		dispatch("RUN");
	},
	RENDER() {
		console.log("rendered");
		render(view(STATE), document.getElementById("root"));
	}
}

export function dispatch(action, args = {}) {
	const trigger = ACTIONS[action];
	if (trigger) trigger(args, STATE);
	else console.log("Action not recongnized:", action);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain" });

  var link = document.createElement("a"); // Or maybe get it from the current document
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}`;
  link.click();
  URL.revokeObjectURL(link);
}
