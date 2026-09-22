const currentScript = document.currentScript;
const componentName = currentScript.dataset.name;
console.log("Загрузка компонента");

class MySelect extends HTMLElement {
  #shadow;
  #selectButton;
  #selectPopup;
  #selectPopupSearch;
  #optionsBox;
  #options = [];
  #selectedValues = [];
  #onDocumentClick;

  constructor() {
    super();
    console.log("Веб-компонент создан");
  }

  async connectedCallback() {
    this.#shadow = this.attachShadow({ mode: "open" });
    await this.#loadStyles();
    this.#createTemplate();
    this.#renderOptions();
    this.#addEventListeners();
    this.#updateButtonText();
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.#onDocumentClick);
  }

  async #loadStyles() {
    const response = await fetch("./my-select.css");
    const css = await response.text();
    const style = document.createElement("style");
    style.textContent = css;
    this.#shadow.appendChild(style);
  }

  #createTemplate() {
    const template = document.createElement("template");
    template.innerHTML = `
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
    
    this.#options = Array.from(optionElements).map(option => ({
      value: option.value || option.textContent.trim(),
      label: option.textContent.trim()
    }));

    optionElements.forEach(option => option.remove());

    const optionsFragment = this.#createOptionsFragment(this.#options);
    this.#optionsBox.appendChild(optionsFragment);
  }

  #createOptionsFragment(options) {
    const template = document.createElement("template");
    
    const optionsHTML = options.map(opt => `
      <label class="option" data-value="${opt.value}">
        <input type="checkbox" value="${opt.value}" />
        ${opt.label}
      </label>
    `).join("");

    template.innerHTML = optionsHTML;
    return template.content.cloneNode(true);
  }

  #addEventListeners() {
    this.#selectButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.#selectPopup.classList.toggle("open");
      if (this.#selectPopup.classList.contains("open")) {
        this.#selectPopupSearch.focus();
      }
    });

    this.#selectPopupSearch.addEventListener("input", (e) => {
      this.#filterOptions(e.target.value);
    });

    this.#optionsBox.addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        this.#updateSelectedValues();
      }
    });

    this.#onDocumentClick = (e) => {
      if (!e.composedPath().includes(this)) {
        this.#selectPopup.classList.remove("open");
      }
    };
    document.addEventListener("click", this.#onDocumentClick);
  }

  #filterOptions(searchText) {
    const searchLower = searchText.toLowerCase().trim();
    const optionLabels = this.#optionsBox.querySelectorAll(".option");
    
    optionLabels.forEach((label, index) => {
      const option = this.#options[index];
      if (searchLower === "" || option.label.toLowerCase().includes(searchLower)) {
        label.style.display = "flex";
      } else {
        label.style.display = "none";
      }
    });
  }

  #updateSelectedValues() {
    const checkboxes = this.#optionsBox.querySelectorAll('input[type="checkbox"]:checked');
    this.#selectedValues = Array.from(checkboxes).map(cb => cb.value);
    this.value = this.#selectedValues.join(",");
    this.#updateButtonText();
    this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value } }));
  }

  #updateButtonText() {
    if (this.#selectedValues.length === 0) {
      this.#selectButton.textContent = "Выберите опции...";
    } else {
      const selectedLabels = this.#options
        .filter(opt => this.#selectedValues.includes(opt.value))
        .map(opt => opt.label);
      
      this.#selectButton.textContent = selectedLabels.join(", ");
    }
  }

  get value() {
    return this.#selectedValues.join(",");
  }

  set value(val) {
    if (typeof val === "string") {
      this.#selectedValues = val ? val.split(",") : [];
      const checkboxes = this.#optionsBox.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => {
        cb.checked = this.#selectedValues.includes(cb.value);
      });
      this.#updateButtonText();
    }
  }
}

customElements.define(componentName, MySelect);
console.log("Компонент зарегистрирован");