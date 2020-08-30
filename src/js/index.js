//#region Node
const { ipcRenderer } = require('electron');
//#endregion

import CheckItem from "../components/CheckItem.js";
import { UnorderedChecklist } from "../components/CheckList.js";
import CircularProgress from "../components/CircularProgress.js";

customElements.define(CheckItem.DEFAULT_NAME, CheckItem);
customElements.define(UnorderedChecklist.DEFAULT_NAME, UnorderedChecklist, { extends: UnorderedChecklist.TYPE });
customElements.define(CircularProgress.DEFAULT_NAME, CircularProgress);

const ready = f => /in/.test(document.readyState) ? setTimeout(ready, 5, f) : f();

const testJson = require('../test.json');

ready(() => {
  const questUpdateSound = new Audio('../assets/audios/skyrim_quest_update.ogg');
  const skillIncreaseSound = new Audio('../assets/audios/skyrim_skill_increase_sound_effect.ogg');
  const levelUpSound = new Audio('../assets/audios/skyrim_level_up_sound_effect.ogg');

  const listTitle = document.getElementById('list-title');

  /** @type {UnorderedChecklist} */
  const checkList = document.querySelector(`[is=${UnorderedChecklist.DEFAULT_NAME}]`);

  const progress = document.querySelector(CircularProgress.DEFAULT_NAME, CircularProgress);

  listTitle.textContent = testJson.checklist_title;

  questUpdateSound.play();

  checkList.innerHTML = UnorderedChecklist.fromJSON(testJson.checklist);

  const checkItemsLength = checkList.items.length;

  let totalComplete = 0;

  const listener = new BroadcastChannel('updates?');
  const deliverer = new BroadcastChannel('updates!');

  deliverer.onmessage = e => {
    /** @type {string} */
    const update = e.data;
    switch (update.type) {
      case 'itemdone':
        const item = checkList.items.find(item => item.name === update.detail);
        if (item) {
          item.checked = true;
        }
        break;
    }
  };
  listener.onmessage = (e) => {
    /** @type {string} */
    const action = e.data;
    switch (action) {
      case 'give:progress':
        deliverer.postMessage({
          type: 'progress',
          detail: totalComplete,
        });
        break;
      case 'give:nextitem':
        deliverer.postMessage({
          type: 'nextitem',
          detail: checkList.getNextItem()?.asJSON()
        });
        break;
    }
  };

  const updateProgress = () => {
    totalComplete = Math.floor(checkList.getCheckedItems().length / checkItemsLength * 100);
    progress.value = totalComplete;
    deliverer.postMessage({ type: 'progress', detail: totalComplete });
  };

  updateProgress();

  checkList.addEventListener('change', event => {
    if (event.target.checked)
      skillIncreaseSound.play();

    updateProgress();

    if (totalComplete === 100) {
      levelUpSound.play();
    }
  });

  document.body.addEventListener('click', event => {
    /** @type {HTMLElement} */
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
      const action = actionElement.dataset.action;
      if (action) {
        if (/window/.test(action)) {
          const [channel, ...args] = action.split(':');
          ipcRenderer.send(channel, args);
        }
      }
    }
  });
});