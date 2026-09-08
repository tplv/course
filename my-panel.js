const currentScript = document.currentScript;
const componentName = currentScript.dataset.name;

class MyPanel extends HTMLElement {
  #shadow;
  #header;
  #content;
  #isOpen = true;

  constructor() {
    super();
  }

  async connectedCallback() {
    this.#shadow = this.attachShadow({ mode: "open" });
    await this.#loadStyles();
    this.#createTemplate();
    this.#addEventListeners();
  }

  async #loadStyles() {
    const response = await fetch("./my-panel.css");
    const css = await response.text();
    const style = document.createElement("style");
    style.textContent = css;
    this.#shadow.appendChild(style);
  }

  #createTemplate() {
    const template = document.createElement("template");
    const headerText = this.getAttribute("header") || "Заголовок";
    const toggleable = this.hasAttribute("toggleable");

    template.innerHTML = `
      <div class="panel-header" style="cursor: ${toggleable ? 'pointer' : 'default'}">
        <div class="panel-title">${headerText}</div>
        <button class="panel-toggle open" style="display: ${toggleable ? 'block' : 'none'}">▾</button>
      </div>
      <div class="panel-content">
        <slot></slot>
      </div>
    `;

    this.#shadow.appendChild(template.content.cloneNode(true));

    this.#header = this.#shadow.querySelector(".panel-header");
    this.#content = this.#shadow.querySelector(".panel-content");
    this.#isOpen = true;
  }

  #addEventListeners() {
    if (this.hasAttribute("toggleable")) {
      this.#header.addEventListener("click", () => {
        this.#togglePanel();
      });
    }
  }

  #togglePanel() {
    this.#isOpen = !this.#isOpen;
    const toggleBtn = this.#shadow.querySelector(".panel-toggle");
    toggleBtn.classList.toggle("open", this.#isOpen);
    this.#content.classList.toggle("closed", !this.#isOpen);
    
    this.dispatchEvent(new CustomEvent('toggle', { 
      detail: { open: this.#isOpen } 
    }));
  }

  get open() {
    return this.#isOpen;
  }

  set open(val) {
    if (val !== this.#isOpen) {
      this.#togglePanel();
    }
  }
}

customElements.define(componentName, MyPanel);