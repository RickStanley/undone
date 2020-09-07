/** @typedef {import('./CheckItem.js').default} CheckItem */

/** @type {WeakMap<object, Map<string, string>>} */
const templateCache = new WeakMap();

/**@param {string} s */
const hashCode = s => { let h; for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0; return h }

const cacheList = (key, newItems) => {
  if (!templateCache.has(key))
    templateCache.set(key, new Map());

  const hash = hashCode(JSON.stringify(newItems));

  if (templateCache.get(key).has(hash))
    return hash;

  const checklistTemplateResult = key.type === 'ul' ? UnorderedChecklist.createList(newItems) : OrderedChecklist.createList(newItems);

  templateCache.get(key).set(hash, checklistTemplateResult);

  return hash;
};

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

  getProgress() {
    return Math.floor(this.getCheckedItems().length / this.items.length * 100);
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
    const isChecked = item.checked;
    return `<li>${'items' in item ? `<b>${item.content}</b>${Shared.fromJSON(item.items, item.type)}` : `<check-item name="${name}" ${isChecked ? 'checked' : ''}>${item.content}</check-item>`}</li>`;
  }
};

class OrderedChecklist extends sharedMethodsMixin(HTMLOListElement) {
  static DEFAULT_NAME = 'ordered-checklist';
  static TYPE = 'ol';

  static createList(items, { hash = '', shouldCache = false } = {}) {
    if (templateCache.has(items))
      return templateCache.get(items).get(hash);

    const templateResult = `<ol is="${OrderedChecklist.DEFAULT_NAME}" class="list lateral-padding">${items.map(super._createItem).join('')}</ol>`;

    if (shouldCache)
      cacheList(items, items);

    return templateResult;
  }
}

class UnorderedChecklist extends sharedMethodsMixin(HTMLUListElement) {
  static DEFAULT_NAME = 'unordered-checklist';
  static TYPE = 'ul';

  static createList(items, { hash = '', shouldCache = false } = {}) {
    if (templateCache.has(items) && templateCache.get(items).has(hash))
      return templateCache.get(items).get(hash);

    const templateResult = `<ul is="${UnorderedChecklist.DEFAULT_NAME}" class="list lateral-padding">${items.map(super._createItem).join('')}</ul>`;

    if (shouldCache)
      cacheList(items, items);

    return templateResult;
  }
}


export {
  OrderedChecklist,
  UnorderedChecklist,
  cacheList
};