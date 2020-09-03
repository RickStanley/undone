/** @typedef {import('./CheckItem.js').default} CheckItem */

/** @param {HTMLUListElement | HTMLOListElement} Base */
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

  getNextItem() {
    return this.items.find(item => !item.checked);
  }

  asJSON() {
    // Get first level items only.
    return Array.from(this.querySelectorAll(':scope > li'))
      // Every li element.
      .map(item =>
        // If has more than one, than it's a sublist.
        item.childElementCount > 1 ?
          {
            // Get the title of the sublist. Currently it's a `b` element.
            content: item.firstElementChild.textContent,
            // Get list type.
            type: item.lastElementChild.constructor.TYPE,
            // Call the sublist as JSON.
            items: item.lastElementChild.asJSON()
          }
          // Else, it's just an item/check-item.
          : item.firstElementChild.asJSON()
      );
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
    // @todo Randomize properly.
    const name = item.name || item.content.trim().replace(/\s/g, '-').toLowerCase() + (~~(Math.random() * 100)).toString();
    const isChecked = 'checked' in item;
    return `<li>${'items' in item ? `<b>${item.content}</b>${Shared.fromJSON(item.items, item.type)}` : `<check-item name="${name}" ${isChecked ? 'checked' : ''}>${item.content}</check-item>`}</li>`;
  }
};

class OrderedChecklist extends sharedMethodsMixin(HTMLOListElement) {
  static DEFAULT_NAME = 'ordered-checklist';
  static TYPE = 'ol';

  static createList(items) {
    const templateResult = `<ol is="${OrderedChecklist.DEFAULT_NAME}" class="list lateral-padding">${items.map(super._createItem).join('')}</ol>`;

    return templateResult;
  }
}

class UnorderedChecklist extends sharedMethodsMixin(HTMLUListElement) {
  static DEFAULT_NAME = 'unordered-checklist';
  static TYPE = 'ul';

  static createList(items) {
    const templateResult = `<ul is="${UnorderedChecklist.DEFAULT_NAME}" class="list lateral-padding">${items.map(super._createItem).join('')}</ul>`;

    return templateResult;
  }
}


export {
  OrderedChecklist,
  UnorderedChecklist,
};