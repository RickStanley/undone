const circularProgressStyles = new CSSStyleSheet();
const styleSheet = `
.progressbar {
  --ui-progressbar-circumference: var(--c-progress-circumference, 2.51327em);
  --ui-progressbar-value: var(--progressbar-value, 0);
  --ui-progressbar-graph-value: var(--c-progress-graph-value, calc(var(--ui-progressbar-circumference) - (var(--ui-progressbar-value) * var(--ui-progressbar-circumference) / 100)));

  position: relative;
  display: flex;
  width: fit-content;
}

.progressbar__caption {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  font-weight: 600;
  font-size: calc(13 / 16 * 1rem);

  display: flex;
  align-items: center;
  justify-content: center;

  position: absolute;
  top: 0;
  left: 0;

  color: var(--progressbar-caption-color, #fefefe);
}

.progressbar__caption::before {
  content: var(--progressbar-value-caption, "0");
}

.progressbar__caption::after {
  content: var(--progressbar-unit, "%");
}

.progressbar__graph {
  font-size: var(--progressbar-size, calc(275 / 16 * 1rem));
  width: 1em;
  height: 1em;

  transform: rotate(-90deg);
}

.progressbar__circle {
  width: 100%;
  height: 100%;

  position: absolute;
  top: 0;
  left: 0;

  stroke: var(--progressbar-graph-color, #fefefe);
  stroke-width: var(--progressbar-graph-stroke-width, calc(10 / 16 * 1rem));
  fill: none;
}

.progressbar__graph-bg {
  opacity: .2;
}

.progressbar__graph-value {
  stroke-dasharray: var(--ui-progressbar-circumference);
  stroke-dashoffset: var(--ui-progressbar-graph-value);
  transition: stroke-dashoffset 1.5s cubic-bezier(0.42, 0, 0, 1.1);
}
`;

class CircularProgress extends HTMLElement {
  static DEFAULT_NAME = 'circular-progress';

  #CONTAINER = document.createElement("div");
  #value = 0;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [circularProgressStyles];

    this.#CONTAINER.classList.add('progressbar');

    const value = Number(this.getAttribute('value'));
    const isValueValid = value && !isNaN(value) && this._valueIsInRange(value);
    if (!isValueValid) this.#value = 0;

    this._render();
  }

  _render() {
    this.#CONTAINER.innerHTML = `
<span class="progressbar__caption"></span>
<svg class="progressbar__graph">
  <circle class="progressbar__circle progressbar__graph-bg" cx="50%" cy="50%" r=".4em"></circle>
  <circle class="progressbar__circle progressbar__graph-value" cx="50%" cy="50%" r=".4em" stroke-linejoin="round"
    stroke-linecap="round"></circle>
</svg>
`;

    this.shadowRoot.append(this.#CONTAINER);
  }

  get value() {
    return this.#value;
  }

  /**
   * @param {number} value
   */
  set value(value) {
    if (this._valueIsInRange(value)) {
      this.#CONTAINER.style.setProperty("--progressbar-value", value);
      this.#CONTAINER.style.setProperty("--progressbar-value-caption", `"${value}"`);
      this.#value = value;
    }
  }

  /**
   * Checks whether the given value is in range of `0` and `100`.
   * @param {number} value 
   */
  _valueIsInRange(value) {
    return value >= 0 && value <= 100;
  }

  connectedCallback() {
    if (circularProgressStyles.cssRules.length === 0)
      circularProgressStyles.replaceSync(styleSheet);
  }
}

export default CircularProgress;