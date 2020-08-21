//#region Node
const { ipcRenderer } = require('electron');
//#endregion

import CheckItem from "./components/CheckItem.js";
import { UnorderedChecklist } from "./components/CheckList.js";
import CircularProgress from "./components/CircularProgress.js";

customElements.define(CheckItem.DEFAULT_NAME, CheckItem);
customElements.define(UnorderedChecklist.DEFAULT_NAME, UnorderedChecklist, { extends: UnorderedChecklist.TYPE });
customElements.define(CircularProgress.DEFAULT_NAME, CircularProgress);

const ready = f => /in/.test(document.readyState) ? setTimeout(ready, 5, f) : f();

ready(() => {
  const questUpdateSound = new Audio('./assets/audios/skyrim_quest_update.ogg');
  const skillIncreaseSound = new Audio('./assets/audios/skyrim_skill_increase_sound_effect.ogg');
  const levelUpSound = new Audio('./assets/audios/skyrim_level_up_sound_effect.ogg');

  /** @type {UnorderedChecklist} */
  const checkList = document.querySelector(`[is=${UnorderedChecklist.DEFAULT_NAME}]`);

  const progress = document.querySelector(CircularProgress.DEFAULT_NAME, CircularProgress);

  questUpdateSound.play();

  const items = [
    {
      content: 'Hello',
      checked: true,
    },
    {
      content: 'Hi there',
    },
    {
      content: 'Malganisss',
    },
    {
      content: 'My sublist',
      type: 'ol',
      items: [
        {
          content: 'My sub item 1',
          checked: true,
        },
        {
          content: 'My sub item 2',
          checked: true,
        },
      ]
    },
    {
      content: 'Hello guys'
    },
    {
      content: 'My sublist 2',
      type: 'ul',
      items: [
        {
          content: 'My sub item 3',
          checked: true,
        },
        {
          content: 'My sub item 4',
          checked: true,
        },
      ]
    },
    {
      content: 'Malganisss',
    },
    {
      content: 'Malganisss',
    },
  ];

  checkList.innerHTML = UnorderedChecklist.fromJSON(items);

  const checkItemsLength = checkList.items.length;

  const updateProgress = () => {
    const totalComplete = Math.floor(checkList.getCheckedItems().length / checkItemsLength * 100);
    progress.value = totalComplete;

    return totalComplete;
  };

  updateProgress();

  checkList.addEventListener('change', event => {
    if (event.target.checked)
      skillIncreaseSound.play();

    const totalComplete = updateProgress();

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
        const [channel, ...args] = action.split(':');
        ipcRenderer.send(channel, args);
      }
    }
  });
});