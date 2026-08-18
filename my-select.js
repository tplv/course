const currentScript = document.currentScript;
const componentName = currentScript.dataset.name;
console.log("Загрузка компонента");

class MySelect extends HTMLElement {
  #selectButton;
  #selectPopup;
  #selectPopupSearch;
  #optionsBox;

  constructor() {
    super();
    console.log("Веб-компонент создан");
  }

  connectedCallback() {
    this.#createTemplate();
    this.#renderOptions();
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

    this.append(template.content.cloneNode(true));

    this.#selectButton = this.querySelector(".select-button");
    this.#selectPopup = this.querySelector(".select-popup");
    this.#selectPopupSearch = this.querySelector(".select-popup input");
    this.#optionsBox = this.querySelector(".select-popup-options");
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
}

customElements.define(componentName, MySelect);
console.log("Компонент зарегистрирован");