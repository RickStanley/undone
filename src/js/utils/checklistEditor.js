/** @typedef {HTMLOListElement | HTMLUListElement} List */

const cache = new WeakMap();

/**
 * @type {[List, List]}
 */
let [masterList, currentList] = [null, null];
/**
 * @type {HTMLFormElement}
 */
let form = null;

/**
 * Creates a new item relative to current focused list.
 */
const createItem = (shouldFocus = true) => {
  currentList.appendChild(document.createElement('input'));
  currentList.lastElementChild.name = `list[${currentList.dataset.id}]item[${currentList.childElementCount - 1}]`;
  if (shouldFocus)
    currentList.lastElementChild.focus();
};

/**
 * Creates a new list within a list.
 */
const createList = (isSublist = false) => {
  const listTitleInput = document.createElement('input');
  const controls = document.createElement('div');

  listTitleInput.classList.add('title-input');

  const listId = `${isSublist ? 'sub-' : ''}${Math.random() * 100 + 11}`;

  controls.innerHTML = `
<label>
  <input type="radio" name="type-${listId}" value="ul" selected>
  ul
</label>
<label>
  <input type="radio" name="type-${listId}" value="ol">
  ol
</label>`;

  controls.prepend(listTitleInput);

  currentList = document.createElement('fieldset');
  currentList.dataset.id = listId;

  currentList.insertBefore(controls, currentList);

  listTitleInput.focus();

  createItem(false);

  form.appendChild(currentList);
};

/** @param {KeyboardEvent} event */
const onKeyup = event => {
  /** @type {HTMLInputElement} */
  const input = event.target.closest('input');
  const key = event.key || event.which;
  const isEnter = key === 'Enter' || key === 13;

  if (input) {
    if (
      // Is trying to create list?
      (event.ctrlKey && isEnter && !input.value)
      &&
      // Don't create new list if already has a layer of fieldset.
      !!input.closest('fieldset').closest('fieldset')
    ) {
      createList();
    }
  }
};

/**
 * Listen for keyboard events within a list.
 */
const attach = keyElement => {
  document.body.addEventListener('keyup', onKeyup);
  if (!cache.has(keyElement)) {
    cache.set(keyElement, document.createElement('form'));
  }
  form = cache.get(keyElement);
};

/**
 * Listen for keyboard events within a list.
 */
const detach = () => {
  document.body.removeEventListener('keyup', onKeyup);
  form = null;
  currentList = null;
  masterList = null;
};

export {
  attach,
  detach,
};