import { html } from "lit-html";
import { classMap } from "lit-html-classMap";
import "./codemirror/codemirror-html.js";
import "./codemirror/codemirror-js.js";

function options(shadowDom) {
  return html`
    <div class="menu-option menu-choice menu-choice-trigger">
      options
      <div class="menu-choices">
        <button 
        	class=${shadowDom ? "menu-choice" : "menu-choice selected-menu-choice"} 
        	@click=${() => dispatch("CHANGE_RENDERER", {type: "iframe"})}>
        	iframe
        	</button>
        <button 
        	class=${shadowDom ? "menu-choice selected-menu-choice" : "menu-choice"} 
        	@click=${() => dispatch("CHANGE_RENDERER", {type: "shadowDom"})}>
        	shadowDom
			</button>
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
				<button class="menu-option" @click=${() => dispatch("SHARE")}>share</button>
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
			<span class="example" @click=${() => dispatch("LOAD", { target: "TODO" })}>
				"Default Name"
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
				<span>Share Method:</span>
				<select>
				  <option value="binary-url">Binary URL</option>
				  <option value="server">Server</option>
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



