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

  static get observedAttributes() { return ['name', 'checked']; }

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

  get name() {
    return this.#INPUT.name;
  }

  set name(value) {
    this.#INPUT.name = value;
  }

  get checked() {
    return this.#checked;
  }

  /**
   * @param {boolean} value
   */
  set checked(value) {
    if (typeof value === 'boolean') {
      this.#INPUT.checked = value;
      this.#INPUT.dispatchEvent(new Event('change'));
    }
  }

  // Or we could overwrite toJSON() method.
  asJSON() {
    return {
      name: this.#INPUT.name,
      checked: this.#checked,
      content: this.textContent,
    };
  }

  connectedCallback() {
    if (checkItemStyles.cssRules.length === 0)
      checkItemStyles.replaceSync(styleSheet);
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    switch (name) {
      case 'name':
        this.#INPUT.name = newValue;
        break;
      case 'checked':
        this.checked = this.hasAttribute('checked');
        break;
    }
  }

  _render() {
    this.#LABEL.appendChild(this.#INPUT);
    this.#LABEL.appendChild(this.#SLOT);
    this.shadowRoot.appendChild(this.#LABEL);
  }
}

export default CheckItem;