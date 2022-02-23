import { html, render, svg } from "https://unpkg.com/lit-html@2.0.1/lit-html.js";
import { view } from "./view.js";
import { init } from "./init.js";

function copy(str) {
	const inp = document.createElement('input');
	document.body.appendChild(inp);
	inp.value = str;
	inp.select();
	document.execCommand('copy', false);
	inp.remove();
}

function showShared() {
	document.querySelector(".shared-modal").classList.toggle("hide");
  setTimeout(() => document.querySelector(".shared-modal").classList.toggle("hide"), 3000);
}


const STATE = {
	codemirror: undefined,
	url: undefined,
	examples: [],
	error: false,
	logs: [],
	name: "name-here",
	lastSaved: {
		name: "",
		text: "",
		link: "",
	}
};

window.addEventListener("message", e => {
	console.log("message", e);

	// if (e.data === "error") STATE.error = true;
	// else {
	// 	STATE.logs = [...STATE.logs, ...e.data];
	// }
	// dispatch("RENDER");

	// const obj = document.querySelector(".log");
});


const ACTIONS = {
	INIT(args, state) {
		init(state);
	},
	RUN(args, state) {
		STATE.error = false;
		STATE.logs = [];

		const program = state.codemirror.view.state.doc.toString();

		const sandbox = document.querySelector(".iframe-sandbox");
		sandbox.contentWindow.postMessage({ program }, '*');

		dispatch("RENDER");

	},
	SHARE({type}, state) {
		const string = state.codemirror.view.state.doc.toString();

		// share with aws link

	},
	DOWNLOAD(args, state) {
		const string = state.codemirror.view.state.doc.toString();
		downloadText(`${state.name}.html`,string);
	},
	LOAD_PROGRAM({ content }, state) {
		const string = state.codemirror.view.state.doc.toString();
		state.codemirror.view.dispatch({
			changes: { from: 0, to: string.length, insert: content }
		});
		dispatch("RUN");
	},
	RENDER() {
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
