import { render, html, svg } from 'https://unpkg.com/uhtml?module';

const view = () => html`
  <convert-md class="write-up" src="./sections/outline.md"></convert-md>
  <convert-md class="write-up" src="./sections/outline.md" hash="/outline"></convert-md>
`

const r = () => render(document.body, view());

// r();