/** @typedef {import('./CheckItem.js').default} CheckItem */

// @todo Document mixin
/** 
 * @type {OrderedChecklist & UnorderedChecklist}
 */
const sharedMethods = {
  getCheckedItems() {
    return this.items.filter(item => item.checked);
  },
  getUncheckedItems() {
    return this.items.filter(item => !item.checked);
  },
};

class OrderedChecklist extends HTMLOListElement {
  static DEFAULT_NAME = 'ordered-checklist';
  static EXTENDS = 'ol';

  /** @type {CheckItem[] | null} */
  items = Array.from(this.querySelectorAll('check-item')) || [];

  constructor() {
    super();
  }
}

class UnorderedChecklist extends HTMLUListElement {
  static DEFAULT_NAME = 'unordered-checklist';
  static EXTENDS = 'ul';

  /** @type {CheckItem[] | null} */
  items = Array.from(this.querySelectorAll('check-item')) || [];

  constructor() {
    super();
  }
}

Object.assign(OrderedChecklist.prototype, sharedMethods);
Object.assign(UnorderedChecklist.prototype, sharedMethods);

export {
  OrderedChecklist,
  UnorderedChecklist,
};