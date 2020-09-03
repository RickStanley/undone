import { UnorderedChecklist, OrderedChecklist } from '../../components/CheckList.js';
import CircularProgress from "../../components/CircularProgress.js";

let listener;
let deliverer;
const questUpdateSound = new Audio('../assets/audios/skyrim_quest_update.ogg');
const skillIncreaseSound = new Audio('../assets/audios/skyrim_skill_increase_sound_effect.ogg');
const levelUpSound = new Audio('../assets/audios/skyrim_level_up_sound_effect.ogg');

let totalComplete = 0;
/** @type {UnorderedChecklist | OrderedChecklist} */
let checklist;
/** @type {CircularProgress} */
let progress;
let checkItemsLength = 0;

const updateProgress = () => {
  totalComplete = Math.floor(checklist.getCheckedItems().length / checkItemsLength * 100);
  progress.value = totalComplete;
  deliverer.postMessage({ type: 'progress', detail: totalComplete });
};

const checklistChange = event => {
  if (event.target.checked)
    skillIncreaseSound.play();

  updateProgress();

  if (totalComplete === 100) {
    levelUpSound.play();
  }
};

const attach = () => {
  listener = new BroadcastChannel('updates?');
  deliverer = new BroadcastChannel('updates!');

  checklist = document.querySelector('.list');

  progress = document.querySelector(CircularProgress.DEFAULT_NAME);

  questUpdateSound.play();

  checkItemsLength = checklist.items.length;

  deliverer.onmessage = e => {
    /** @type {string} */
    const update = e.data;
    switch (update.type) {
      case 'itemdone':
        const item = checklist.items.find(item => item.name === update.detail);
        if (item) {
          item.checked = true;
        }
        break;
    }
  };

  listener.onmessage = e => {
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
          detail: checklist.getNextItem()?.asJSON()
        });
        break;
    }
  };

  updateProgress();

  checklist.addEventListener('change', checklistChange);

};

const detach = () => {
  deliverer.postMessage({ type: 'checklist', detail: 'closed' });
  totalComplete = checkItemsLength = 0;
  listener.close();
  deliverer.close();
  checklist = null;
  progress = null;
};

const processChecklist = checklist => {
  const checklistTemplateResult = checklist.type === 'ul' ? UnorderedChecklist.createList(checklist.items) : OrderedChecklist.createList(checklist.items);

  const templateResult = `
  <header class="header lateral-padding">
    <h1>${checklist.checklist_title}</h1>
    <circular-progress></circular-progress>
  </header>
  ${checklistTemplateResult}
`;

  return templateResult;

};

export {
  processChecklist,
  attach,
  detach
};