/** @typedef {import('./CheckItem.js').default} CheckItem */

const sharedMethodsMixin = Base => class Shared extends Base {

  constructor() {
    super();
  }

  /** @return {CheckItem[] | null} */
  get items() {
    return Array.from(this.querySelectorAll('check-item'));
  }

  getCheckedItems() {
    return this.items.filter(item => item.checked);
  }

  getUncheckedItems() {
    return this.items.filter(item => !item.checked);
  }

  static fromJSON(items, type) {
    switch (type) {
      case 'ol':
        return OrderedChecklist.createList(items);
      case 'ul':
        return UnorderedChecklist.createList(items);
      default:
        return items.map(Shared._createItem).join('');
    }
  }

  static _createItem(item) {
    const hasName = 'name' in item;
    const isChecked = 'checked' in item;
    return `<li>${'items' in item ? `${item.content}${Shared.fromJSON(item.items, item.type)}` : `<check-item ${hasName ? `name="${item.name}"` : ''} ${isChecked ? 'checked' : ''}>${item.content}</check-item>`}</li>`;
  }
};

class OrderedChecklist extends sharedMethodsMixin(HTMLOListElement) {
  static DEFAULT_NAME = 'ordered-checklist';
  static TYPE = 'ol';

  static createList(items) {
    return `<ol is="${OrderedChecklist.DEFAULT_NAME}" class="list lateral-padding">${items.map(super._createItem).join('')}</ol>`;
  }
}

class UnorderedChecklist extends sharedMethodsMixin(HTMLUListElement) {
  static DEFAULT_NAME = 'unordered-checklist';
  static TYPE = 'ul';

  static createList(items) {
    return `<ul is="${UnorderedChecklist.DEFAULT_NAME}" class="list lateral-padding">${items.map(super._createItem).join('')}</ul>`;
  }
}


export {
  OrderedChecklist,
  UnorderedChecklist,
};