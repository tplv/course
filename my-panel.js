const currentScript = document.currentScript;
const componentName = currentScript.dataset.name;

class MyPanel extends HTMLElement {
  static observedAttributes = ["header", "subheader"];
  
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
    this.#updateHeader();
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

    template.innerHTML = `
      <div class="panel-header" style="cursor: ${toggleable ? 'pointer' : 'default'}">
        <div>
          <div class="panel-title"></div>
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

  attributeChangedCallback() {
    this.#updateHeader();
  }

  #updateHeader() {
    if (!this.#shadow) return;

    const headerText = this.getAttribute("header") || "Заголовок";
    const subheaderText = this.getAttribute("subheader") || "";

    const titleElement = this.#shadow.querySelector(".panel-title");
    if (titleElement) {
      titleElement.textContent = headerText;
    }

    const headerInner = this.#shadow.querySelector(".panel-header > div");
    if (!headerInner) return;

    let subheaderElement = this.#shadow.querySelector(".panel-subheader");

    if (subheaderText) {
      if (!subheaderElement) {
        subheaderElement = document.createElement("div");
        subheaderElement.className = "panel-subheader";
        headerInner.appendChild(subheaderElement);
      }
      subheaderElement.textContent = subheaderText;
    } else if (subheaderElement) {
      subheaderElement.remove();
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