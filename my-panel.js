const currentScript = document.currentScript;
const componentName = currentScript.dataset.name;

class MyPanel extends HTMLElement {
  static observedAttributes = ["header", "subheader"];
  
  #shadow;
  #header;
  #content;
  #isOpen = true;
  #headerText = "Заголовок";
  #subheaderText = "";

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
    const toggleable = this.hasAttribute("toggleable");
    
    this.#headerText = this.getAttribute("header") || "Заголовок";
    this.#subheaderText = this.getAttribute("subheader") || "";

    template.innerHTML = `
      <div class="panel-header" style="cursor: ${toggleable ? 'pointer' : 'default'}">
        <div>
          <div class="panel-title">${this.#headerText}</div>
          ${this.#subheaderText ? `<div class="panel-subheader">${this.#subheaderText}</div>` : ''}
        </div>
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

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "header") {
      this.#headerText = newValue || "Заголовок";
      this.#updateHeader();
    } else if (name === "subheader") {
      this.#subheaderText = newValue || "";
      this.#updateHeader();
    }
  }

  #updateHeader() {
    const titleElement = this.#shadow.querySelector(".panel-title");
    const subheaderElement = this.#shadow.querySelector(".panel-subheader");
    
    if (titleElement) {
      titleElement.textContent = this.#headerText;
    }
    
    if (subheaderElement) {
      subheaderElement.textContent = this.#subheaderText;
    } else if (this.#subheaderText) {
      const headerDiv = this.#shadow.querySelector(".panel-header > div");
      const subheader = document.createElement("div");
      subheader.className = "panel-subheader";
      subheader.textContent = this.#subheaderText;
      headerDiv.appendChild(subheader);
    }
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