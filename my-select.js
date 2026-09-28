(() => {
  const currentScript = document.currentScript;
  const componentName = currentScript.dataset.name;

  const stylesCache = {};

  class MySelect extends HTMLElement {
    #shadow;
    #selectButton;
    #selectPopup;
    #selectPopupSearch;
    #optionsBox;
    #noResults;
    #options = [];
    #selectedValues = [];
    #onDocumentClick;

    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
    }

    async connectedCallback() {
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
      if (!stylesCache[componentName]) {
        const response = await fetch("./my-select.css");
        stylesCache[componentName] = await response.text();
      }
      const style = document.createElement("style");
      style.textContent = stylesCache[componentName];
      this.#shadow.appendChild(style);
    }

    #createTemplate() {
      const template = document.createElement("template");
      template.innerHTML = `
        <button class="select-button"><!--Здесь будет выбранная опция--></button>
        <div class="select-popup">
          <input placeholder="Search..." />
          <div class="select-popup-options"><!--Здесь будет список опций--></div>
          <div class="no-results">Ничего не найдено</div>
        </div>
      `;

      this.#shadow.appendChild(template.content.cloneNode(true));

      this.#selectButton = this.#shadow.querySelector(".select-button");
      this.#selectPopup = this.#shadow.querySelector(".select-popup");
      this.#selectPopupSearch = this.#shadow.querySelector(".select-popup input");
      this.#optionsBox = this.#shadow.querySelector(".select-popup-options");
      this.#noResults = this.#shadow.querySelector(".no-results");
    }

    #renderOptions() {
      const optionElements = this.querySelectorAll("option");

      this.#options = Array.from(optionElements).map(option => ({
        value: option.value || option.textContent.trim(),
        label: option.textContent.trim()
      }));

      optionElements.forEach(option => option.remove());

      this.#options.forEach(opt => {
        const label = document.createElement("label");
        label.className = "option";
        label.dataset.value = opt.value;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = opt.value;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + opt.label));

        this.#optionsBox.appendChild(label);
      });
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
          this.#closePopup();
        }
      };
      document.addEventListener("click", this.#onDocumentClick);
    }

    #closePopup() {
      this.#selectPopup.classList.remove("open");
      this.#selectPopupSearch.value = "";
      this.#filterOptions("");
    }

    #filterOptions(searchText) {
      const searchLower = searchText.toLowerCase().trim();
      const optionLabels = this.#optionsBox.querySelectorAll(".option");
      let visibleCount = 0;

      optionLabels.forEach((label, index) => {
        const option = this.#options[index];
        if (searchLower === "" || option.label.toLowerCase().includes(searchLower)) {
          label.style.display = "flex";
          visibleCount++;
        } else {
          label.style.display = "none";
        }
      });

      this.#noResults.style.display = visibleCount === 0 ? "block" : "none";
    }

    #updateSelectedValues() {
      const checkboxes = this.#optionsBox.querySelectorAll('input[type="checkbox"]:checked');
      this.#selectedValues = Array.from(checkboxes).map(cb => cb.value);
      this.#updateButtonText();
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this.#selectedValues.join(",") }
      }));
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
})();