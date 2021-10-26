import { html, render } from 'lit-html';
import lzutf8 from 'lzutf8';
import { view } from "./view.js";
import { init } from "./init.js";


function setInnerHTML(elm, html) {
  elm.innerHTML = html;
  Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
  	const text = oldScript.innerHTML;
  	(new Function("dom", text))(elm); // need to make imports work, this messes up document methods
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
	useShadowDom: false,
	showExamples: false,
	examples: [],
};

const ACTIONS = {
	INIT(args, state) {
		init(state);
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
	EXAMPLES: ({ show }, state) => {
		state.showExamples = show;
		dispatch("RENDER");
	},
	CHANGE_RENDERER({ type }, state) {
		if (type === "iframe") state.useShadowDom = false;
		else state.useShadowDom = true;
		dispatch("RENDER");
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
