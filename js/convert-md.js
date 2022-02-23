import marked from "./marked.js";

customElements.define('convert-md', class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const renderSrc = () => {
      if (this.hasAttribute("src")) {
        fetch(this.getAttribute("src")).then( async (res) => {
          const body = await res.text();

          this.shadowRoot.innerHTML = `${marked(body)}${this.innerHTML}`;
          this.innerHTML = "";
        })
      }
    }

    if (!this.hasAttribute("hash")) renderSrc();
    else {
      const loadContent = () => {
        const hash = window.location.hash 
          ? window.location.hash.substring(1)
          : "";

        if (this.getAttribute("hash") === hash) {
          renderSrc();
        } else {
          this.shadowRoot.innerHTML = "";
        }
      }

      window.addEventListener("hashchange", loadContent)
      window.addEventListener("load", loadContent)
    }

    // this.shadowRoot.innerHTML = `${marked(this.innerHTML)}`
  }
})

