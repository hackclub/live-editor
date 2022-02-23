import { html } from "https://unpkg.com/lit-html@2.0.1/lit-html.js";
import "./codemirror/codemirror-js.js";
import "./convert-md.js";

const fileName = state => html`
	<input
		class="menu-option" 
		style="flex: 2; margin-right: 5px;"
		type="text" 
		.placeholder=${state.name} 
		@keyup=${e => { 
      		state.name = e.target.value === "" ? "anon" : e.target.value 
    }}>
  </input>
`

const renderDocs = state => html`
	<style>
		.docs {
      position: absolute;
      box-sizing: border-box;
      height: 100%;
      width: 60%;
      right: 0px;
      top: 0px;
      background: white;
      z-index: 20;
      padding: 10px;
      overflow: scroll;
      transition: right 1s ease-in-out;
    }

    .hide-docs {
      right: -60%;
    }

    .close-docs {
      position: fixed;
      right: 10px;
      top: 10px;
    }

    .hide-docs .close-docs {
      display: none;
    }
	</style>
	<div class="docs hide-docs">
		<button class="close-docs" @click=${() => dispatch("DOCS")}>close</button>
		<h3>Notifications:</h3>
		<div class="notification-container">
      ${Object.values(state.notifications).map(
        (x) => html` <div class="shared-modal">${x}</div> `
      )}
    </div>
    <h3>Documentation:</h3>
    <convert-md src=${state.documentation}>
    	<style>
	    	pre,
	    	code {
	      	background: lightgrey;
		      border-radius: 3px;
		      padding: 5px;
		      overflow: scroll;
		      line-height: 1.5em;
		    }
    	</style>
    </convert-md>
	</div>
`

export function view(state) {
	return html`
		<div class="left-pane">
			<codemirror-js id="code-editor"></codemirror-js>
			<div class=${["log", state.error ? "error" : "", state.logs.length === 0 ? "shrink" : ""].join(" ")}>
				${state.logs.map(x => html`<div>${JSON.stringify(x)}</div>`)}
			</div>
			<div class="menu">
				${fileName(state)}
				<button class="menu-option menu-button" @click=${() => dispatch("SHARE")}>
					share
					<span class="tooltip">get a sharing link</span>
				</button>
        <button class="menu-option menu-button" @click=${() => dispatch("DOWNLOAD")}>
					download
					<span class="tooltip">dowload file</span>
				</button>
				<button class="menu-option menu-button" @click=${() => dispatch("DOCS")}>
					docs
					<span class="tooltip">show documentation</span>
				</button>
				<button class="menu-option menu-button" @click=${() => dispatch("RUN")}>
					run
					<span class="tooltip">run program (shift+enter)</span>
				</button>
			</div>
		</div>
		<div class="right-pane">
			<iframe class="iframe-sandbox" sandbox="allow-scripts allow-same-origin"></iframe>
		</div>
		<div id="vertical-bar"></div>
		${renderDocs(state)}
	`
}

