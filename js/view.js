import { html } from "https://unpkg.com/lit-html@2.0.1/lit-html.js";
import "./codemirror/codemirror-html.js";

function shareOptions(state) {
  return html`
    <div class="expand-menu menu-option menu-choice">
      share
      <div class="menu-choices">
      	<input type="text" .placeholder=${state.name} @keyup=${e => { 
      		state.name = e.target.value === "" ? "anon" : e.target.value 
      	}}></input>
        <button @click=${() => dispatch("SHARE", { type: "link" })}>link</button>
        <button @click=${() => dispatch("SHARE", { type: "file" })}>file</button>
      </div>
    </div>
  `
}

const toggleHide = (className) => document.querySelector(`.${className}`).classList.toggle("hide");

export function view(state) {
	return html`
		<div class="left-pane">
			<codemirror-html id="code-editor"></codemirror-html>
			<div class=${["log", state.error ? "error" : "", state.logs.length === 0 ? "shrink" : ""].join(" ")}>
				${state.logs.map(x => html`<div>${JSON.stringify(x)}</div>`)}
			</div>
			<div class="menu">
				<button class="menu-option" @click=${() => dispatch("RUN")}>run (shift + enter)</button>
				${shareOptions(state)}
				<button class="menu-option" @click=${() => toggleHide("examples")}>examples</button>
			</div>
		</div>
		<iframe class="viewer viewer-iframe" sandbox="allow-scripts allow-same-origin"></iframe>
		<div id="vertical-bar"></div>
		${renderExamples(state)}
		${renderShared(state)}
	`
}

const renderShared = state => html`
	<div class="shared-modal hide">
		Sharing link copied to clip board.
	</div>
`

const renderExamples = (state) => html`
	<div class="examples hide">
		${state.examples.map((x, i) => html`
			<span 
				class="example" 
				@click=${() => dispatch("LOAD_EXAMPLE", { content: x["Content"] })}>
				${x["Name"]}
			</span>
		`)}
		<button class="close" @click=${() => toggleHide("examples")}>close</button>
	</div>
`



