//#region Node
const { ipcRenderer } = require('electron');
//#endregion

import CheckItem from "../components/CheckItem.js";
import { UnorderedChecklist, OrderedChecklist, cacheList } from "../components/CheckList.js";
import CircularProgress from "../components/CircularProgress.js";
import { processChecklist, getListState, attach as attachChecklistEvents, detach as detachChecklistEvents, getProgress } from "./utils/checklistView.js";

customElements.define(CheckItem.DEFAULT_NAME, CheckItem);
customElements.define(UnorderedChecklist.DEFAULT_NAME, UnorderedChecklist, { extends: UnorderedChecklist.TYPE });
customElements.define(OrderedChecklist.DEFAULT_NAME, OrderedChecklist, { extends: OrderedChecklist.TYPE });
customElements.define(CircularProgress.DEFAULT_NAME, CircularProgress);

const ready = f => /in/.test(document.readyState) ? setTimeout(ready, 5, f) : f();

let checklistsTest = require('../fixtures/checklists.json');

const checklistsList = checklists => `
  <h1>Undone</h1>
  <div class="undone-lists">
  ${checklists.map(({ checklist_title, percentage }, index) => `<button class="btn btn--with-icon" data-action="open:checklist" data-index="${index}">${checklist_title} <circular-progress class="icon" value="${percentage}"></circular-progress></button>`).join('')}
  </div>
  <button class="btn">New checklist</button>
`;

ready(() => {
  const entryElement = document.querySelector('main');
  let currentChecklistIndex = 0;

  /**
   * @param {string} template 
   * @param {string} viewName 
   */
  const mountTemplate = (template, viewName) => {
    entryElement.innerHTML = template;
    document.body.dataset.view = viewName;
  };

  mountTemplate(checklistsList(checklistsTest), 'checklists');

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
            currentChecklistIndex = +actionElement.dataset.index;
            const checklistTemplate = processChecklist(checklistsTest[currentChecklistIndex]);
            mountTemplate(checklistTemplate, 'checklist');
            attachChecklistEvents();
            break;
          case 'return':
            checklistsTest[currentChecklistIndex].percentage = getProgress();

            checklistsTest[currentChecklistIndex].last_hash = cacheList(checklistsTest[currentChecklistIndex].items, getListState());

            detachChecklistEvents();

            if (document.body.dataset.view === 'checklist')
              mountTemplate(checklistsList(checklistsTest), 'checklists');

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