const currentScript = document.currentScript;
const componentName = currentScript.dataset.name;
console.log("Загрузка компонента");

class MySelect extends HTMLElement {
  constructor() {
    super();
    console.log("Веб-компонент создан");
    this.innerHTML = `
      <div 
      style="border: 2px solid green; 
      padding: 20px; 
      margin: 10px 0; 
      border-radius: 8px;">
        <p><strong>Кастомный селект</strong></p>
      </div>
    `;
  }
}
customElements.define(componentName, MySelect);

console.log("Компонент зарегистрирован");