import { html } from "lit-html";
import { classMap } from "lit-html-classMap";
import "./codemirror/codemirror-html.js";
import "./codemirror/codemirror-js.js";

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
			${state.editorType === "js" ? html`<codemirror-js id="code-editor"></codemirror-js>` : html`<codemirror-html id="code-editor"></codemirror-html>`}
			<div class="menu">
				<button class="menu-option" @click=${() => dispatch("RUN")}>run (shift + enter)</button>
				${shareOptions(state)}
				<button class="menu-option" @click=${() => toggleHide("examples")}>examples</button>
				<button class="menu-option" @click=${() => toggleHide("options")}>options</button>
			</div>
		</div>
		${state.editorType === "html" && state.rendererType === "iframe" 
				? html`<iframe class="viewer viewer-iframe"></iframe>`
				: html`<main></main>`
		}
		<div id="vertical-bar"></div>
		${renderExamples(state)}
		${renderOptions(state)}
	`
}

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

const renderOptions = (state) => { 
	const rendererClasses = { option: true, hide: state.editorType !== "html" };

	return html`
		<div class="options hide">
			<div class="option">
				<span>Editor Type:</span>
				<select 
					@change=${(e) => dispatch("EDITOR_TYPE", { type: e.target.value})}
					.value=${state.editorType}>
					<option value="html">HTML</option>
				  <option value="js">JavaScript</option>
				</select>
			</div>
			<div class="option">
				<span>Link Share Method:</span>
				<select 
					@change=${(e) => dispatch("SHARE_TYPE", { type: e.target.value})}
					.value=${state.shareType}>
				  <option value="binary-url">Binary URL</option>
				  <option value="airtable">Airtable</option>
				</select>
			</div>
			<div class=${classMap(rendererClasses)}>
				<span>Renderer:</span>
				<select 
					@change=${(e) => dispatch("RENDERER_TYPE", { type: e.target.value })}
					.value=${state.rendererType}>
				  <option value="iframe">iframe</option>
				  <option value="dom">DOM</option>
				  <option value="shadow-dom">Shadow DOM</option>
				</select>
			</div>
			<h1>THIS IS A WORK IN PROGRESS NOT ALL OPTIONS WORK YET</h1>
			<button class="close" @click=${() => toggleHide("options")}>close</button>
		</div>
	`
}



