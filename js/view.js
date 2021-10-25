import { html } from "lit-html";
import "./html_editor.bundle.js";

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

export function view(state) {
	return html`
		<div class="left-pane">
			<code-mirror id="code-editor"></code-mirror>
			<div class="menu">
				<button class="menu-option" @click=${() => dispatch("RUN")}>run (shift + enter)</button>
				<button class="menu-option" @click=${() => dispatch("SHARE")}>share</button>
				<button class="menu-option" @click=${() => dispatch("EXAMPLES", { show: true })}>
					examples
				</button>
				${options(state.useShadowDom)}
			</div>
		</div>
		${ state.useShadowDom ? html`<div class="viewer viewer-div"></div>` : html`<iframe class="viewer viewer-iframe"></iframe>` }
		<div id="vertical-bar"></div>
		${state.showExamples ? drawExamples(state) : ""}
	`
}

const drawExamples = (state) => html`
	<div class="examples">
		${state.examples.map((x, i) => html`
			<span class="example" @click=${() => dispatch("LOAD", { target: "TODO" })}>
				"Default Name"
			</span>
		`)}
	</div>
`



