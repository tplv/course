(() => {
  const currentScript = document.currentScript;
  const componentName = currentScript.dataset.name;

  const stylesCache = {};

  class MyPanel extends HTMLElement {
    #shadow;
    #header;
    #content;
    #isOpen = true;

    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
    }

    async connectedCallback() {
      await this.#loadStyles();
      this.#createTemplate();
      this.#addEventListeners();
    }

    async #loadStyles() {
      if (!stylesCache[componentName]) {
        const response = await fetch("./my-panel.css");
        stylesCache[componentName] = await response.text();
      }
      const style = document.createElement("style");
      style.textContent = stylesCache[componentName];
      this.#shadow.appendChild(style);
    }

    #createTemplate() {
      const template = document.createElement("template");
      const toggleable = this.hasAttribute("toggleable");

      template.innerHTML = `
        <div class="panel-header" style="cursor: ${toggleable ? 'pointer' : 'default'}">
          <div class="panel-title"></div>
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

      const headerText = this.getAttribute("header") || "Заголовок";
      this.#shadow.querySelector(".panel-title").textContent = headerText;
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
})();