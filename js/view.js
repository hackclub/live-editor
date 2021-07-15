import { html } from "./imports.js";
import "./html_editor.bundle.js";

function options(shadowDom) {
  return html`
    <div class="menu-choice menu-choice-trigger">
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
				<button class="menu-button" @click=${() => dispatch("RUN")}>run (shift + enter)</button>
				<button class="menu-button" @click=${() => dispatch("SHARE")}>share</button>
				${options(state.useShadowDom)}
			</div>
		</div>
		${ state.useShadowDom ? html`<div class="viewer viewer-div"></div>` : html`<iframe class="viewer viewer-iframe"></iframe>` }
		<div id="vertical-bar"></div>
	`
}

// <button class="menu-button" @click=${() => dispatch("LAST")}>⇦</button>
// <button class="menu-button" @click=${() => dispatch("NEXT")}>⇨</button>