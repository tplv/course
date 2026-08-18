const currentScript = document.currentScript;
const componentName = currentScript.dataset.name;
console.log("Загрузка компонента");

class MySelect extends HTMLElement {
  #shadow;
  #selectButton;
  #selectPopup;
  #selectPopupSearch;
  #optionsBox;

  constructor() {
    super();
    console.log("Веб-компонент создан");
  }

  connectedCallback() {
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#createTemplate();
    this.#renderOptions();
    this.#addEventListeners();
  }

  #createTemplate() {
    const template = document.createElement("template");
    template.innerHTML = `
      <style>
        :host {
          position: relative;
          display: inline-block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          width: 100%;
          max-width: 350px;
          min-width: 250px;
        }

        .select-button {
          width: 100%;
          padding: 12px 40px 12px 16px;
          font-size: 14px;
          font-family: inherit;
          color: #495057;
          background: #ffffff;
          border: 1px solid #ced4da;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all 0.2s ease;
          position: relative;
          user-select: none;
          min-height: 42px;
        }

        .select-button:hover {
          border-color: #86b7fe;
          background: #f8f9fa;
        }

        .select-button:focus {
          outline: none;
          border-color: #86b7fe;
          box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.15);
        }

        .select-button::after {
          content: "▾";
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: #6c757d;
          transition: transform 0.2s ease;
        }

        .select-popup {
          display: none;
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          width: 100%;
          background: var(--select-popup-background, #ffffff);
          border: 1px solid #ced4da;
          border-radius: 6px;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
          padding: 8px 0;
          z-index: 1000;
          max-height: 280px;
          overflow: hidden;
          flex-direction: column;
        }

        .select-popup.open {
          display: flex;
          animation: slideDown 0.15s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .select-popup input {
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          font-family: inherit;
          color: #495057;
          background: #ffffff;
          border: none;
          border-bottom: 1px solid #e9ecef;
          outline: none;
          box-sizing: border-box;
          margin: 0;
          min-height: 40px;
        }

        .select-popup input::placeholder {
          color: #adb5bd;
          font-weight: 300;
        }

        .select-popup input:focus {
          border-bottom-color: #86b7fe;
        }

        .select-popup-options {
          flex: 1;
          overflow-y: auto;
          padding: 4px 0;
          max-height: 220px;
        }

        .select-popup-options::-webkit-scrollbar {
          width: 6px;
        }

        .select-popup-options::-webkit-scrollbar-track {
          background: transparent;
        }

        .select-popup-options::-webkit-scrollbar-thumb {
          background: #ced4da;
          border-radius: 3px;
        }

        .select-popup-options::-webkit-scrollbar-thumb:hover {
          background: #adb5bd;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          font-size: 14px;
          color: #495057;
          cursor: pointer;
          transition: background 0.15s ease;
          user-select: none;
        }

        .option:hover {
          background: #e9ecef;
        }

        .option input[type="checkbox"] {
          width: 16px;
          height: 16px;
          margin: 0;
          cursor: pointer;
          accent-color: #0d6efd;
          flex-shrink: 0;
        }

        .option input[type="checkbox"]:checked {
          accent-color: #0d6efd;
        }

        .option input[type="checkbox"]:focus {
          outline: 2px solid #86b7fe;
          outline-offset: 1px;
        }
      </style>

      <button class="select-button"><!--Здесь будет выбранная опция--></button>
      <div class="select-popup">
        <input placeholder="Search..." />
        <div class="select-popup-options"><!--Здесь будет список опций--></div>
      </div>
    `;

    this.#shadow.appendChild(template.content.cloneNode(true));

    this.#selectButton = this.#shadow.querySelector(".select-button");
    this.#selectPopup = this.#shadow.querySelector(".select-popup");
    this.#selectPopupSearch = this.#shadow.querySelector(".select-popup input");
    this.#optionsBox = this.#shadow.querySelector(".select-popup-options");
  }

  #renderOptions() {
    const optionElements = this.querySelectorAll("option");
    
    const options = Array.from(optionElements).map(option => ({
      value: option.value || option.textContent.trim(),
      label: option.textContent.trim()
    }));

    optionElements.forEach(option => option.remove());

    const optionsFragment = this.#createOptionsFragment(options);
    this.#optionsBox.appendChild(optionsFragment);
  }

  #createOptionsFragment(options) {
    const template = document.createElement("template");
    
    const optionsHTML = options.map(opt => `
      <label class="option" data-value="${opt.value}">
        <input type="checkbox" />
        ${opt.label}
      </label>
    `).join("");

    template.innerHTML = optionsHTML;
    return template.content.cloneNode(true);
  }

  #addEventListeners() {
    this.#selectButton.addEventListener("click", () => this.#openPopup());
  }

  #openPopup() {
    this.#selectPopup.classList.toggle("open");
  }
}

customElements.define(componentName, MySelect);
console.log("Компонент зарегистрирован");