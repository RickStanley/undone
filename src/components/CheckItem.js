const checkItemStyles = new CSSStyleSheet();
const styleSheet = `
label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: calc(5 / 16 * 1rem);
  background-color: var(--check-item-bg-color);
}

label:hover {
  background-color: var(--check-item-bg-color-hover, rgba(255,255,255,.15));
}

input {
  margin: 0;
  margin-right: calc(10 / 16 * 1rem);
}
`;

class CheckItem extends HTMLElement {
  static DEFAULT_NAME = 'check-item';
  #INPUT = document.createElement('input');
  #SLOT = document.createElement('slot');
  #LABEL = document.createElement('label');
  #checked = this.hasAttribute('checked');

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.adoptedStyleSheets = [checkItemStyles];

    this.#INPUT.type = 'checkbox';

    this.#INPUT.name = this.getAttribute('name');
    this.#INPUT.checked = this.hasAttribute('checked');

    this.#INPUT.addEventListener('change', () => {
      this.#checked = this.#INPUT.checked;
      this.dispatchEvent(new Event('change', {
        bubbles: true
      }));
    });

    this._render();
  }

  get checked() {
    return this.#checked;
  }

  connectedCallback() {
    if (checkItemStyles.cssRules.length === 0)
      checkItemStyles.replaceSync(styleSheet);
  }

  _render() {
    this.#LABEL.appendChild(this.#INPUT);
    this.#LABEL.appendChild(this.#SLOT);
    this.shadowRoot.appendChild(this.#LABEL);
  }
}

export default CheckItem;