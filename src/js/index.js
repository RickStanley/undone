//#region Node
const { ipcRenderer } = require('electron');
//#endregion

import CheckItem from "../components/CheckItem.js";
import { UnorderedChecklist, OrderedChecklist } from "../components/CheckList.js";
import CircularProgress from "../components/CircularProgress.js";
import { processChecklist, attach as attachChecklistEvents, detach as detachChecklistEvents } from "./utils/checklistView.js";

customElements.define(CheckItem.DEFAULT_NAME, CheckItem);
customElements.define(UnorderedChecklist.DEFAULT_NAME, UnorderedChecklist, { extends: UnorderedChecklist.TYPE });
customElements.define(OrderedChecklist.DEFAULT_NAME, OrderedChecklist, { extends: OrderedChecklist.TYPE });
customElements.define(CircularProgress.DEFAULT_NAME, CircularProgress);

const ready = f => /in/.test(document.readyState) ? setTimeout(ready, 5, f) : f();

let checklistsTest = require('../fixtures/checklists.json');

const checklistsList = checklists => `
  <h1>Undone</h1>
  ${checklists.map(({ checklist_title, percentage }, index) => `<button data-action="open:checklist" data-index="${index}">${checklist_title}</button>`).join('')}
  <button>New checklist</button>
`;

let listCache;

ready(() => {
  const entryElement = document.querySelector('main');

  /**
   * @param {string} template 
   * @param {string} viewName 
   */
  const mount = (template, viewName) => {
    entryElement.innerHTML = template;
    document.body.dataset.view = viewName;
  };

  listCache = checklistsList(checklistsTest.map(({ checklist_title, percentage }) => ({ checklist_title, percentage })));

  mount(listCache, 'checklists');

  document.body.addEventListener('click', event => {
    /** @type {HTMLElement} */
    const actionElement = event.target.closest('[data-action]');
    const action = actionElement?.dataset.action;
    if (action) {
      if (/window/.test(action)) {
        const [channel, ...args] = action.split(':');
        ipcRenderer.send(channel, args);
      } else {
        switch (action) {
          case 'open:checklist':
            const checklistIndex = +actionElement.dataset.index;
            const checklistTemplate = processChecklist(checklistsTest[checklistIndex]);
            mount(checklistTemplate, 'checklist');
            attachChecklistEvents();
            break;
          case 'return':
            detachChecklistEvents();

            if (document.body.dataset.view === 'checklist') {
              mount(listCache, 'checklists');
            }

            break;
          // Debug for profiling memory
          case 'clear':
            checklistsTest = null;
            break;
        }
      }
    }
  });

});