import { html, render, svg } from "https://unpkg.com/lit-html@2.0.1/lit-html.js";
import { view } from "./view.js";
import { init, initSandbox } from "./init.js";

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
	template: `${window.location.href}templates/turtle-template.js`,
	documentation: `${window.location.href}templates/turtle-template.md`,
	examples: [],
	notifications: [],
	error: false,
	logs: [],
	name: "name-here",
	version: "0.0.1",
	lastSaved: {
		name: "",
		text: "",
		link: "",
	}
};

window.addEventListener("message", e => {

	const location = e.data.stack.match(/<anonymous>:(.+)\)/)[1];
	let [ line, col ] = location.split(":").map(Number);
	line = line - 2;

	STATE.error = true;
	STATE.logs = [...STATE.logs, `${e.data.message} on line ${line} in column ${col}`];
	dispatch("RENDER");
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

		// TODO: share with aws link

	},
	GET_SAVE_STATE(args, state) {
		const string = state.codemirror.view.state.doc.toString();

		const stateString = JSON.stringify({
			name: state.name,
			program: string,
			documentation: state.documentation,
			template: state.template,
			version: state.version
		})

		return stateString;
	},
	SET_SAVE_STATE({ stateString }, state) {
		const { name, program, documentation, template, version } = JSON.parse(stateString);

		state.name = name;
		state.version = version;
		state.documentation = documentation;
		state.template = template; // have to reinit iframe;
		initSandbox(state.template);

		const string = state.codemirror.view.state.doc.toString();
		state.codemirror.view.dispatch({
			changes: { from: 0, to: string.length, insert: program }
		});

		// dispatch("RUN");
	},
	DOWNLOAD: function(args, state) {
		const string = state.codemirror.view.state.doc.toString();
		downloadText(`${state.name}.json`, dispatch("GET_SAVE_STATE"));
	},
	DOCS(args, state) {
		const docs = document.querySelector(".docs");
  	docs.classList.toggle("hide-docs");
	},
	NOTIFICATION({ message }, state) {
		state.notifications = [message, ...state.notifications];

    dispatch("RENDER");
  },
	RENDER() {
		render(view(STATE), document.getElementById("root"));
	}
}

export function dispatch(action, args = {}) {
	console.log(action);

	const trigger = ACTIONS[action];
	if (trigger) return trigger(args, STATE);
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
