import CheckItem from "./components/CheckItem.js";
import { UnorderedChecklist } from "./components/CheckList.js";
import CircularProgress from "./components/CircularProgress.js";

customElements.define(CheckItem.DEFAULT_NAME, CheckItem);
customElements.define(UnorderedChecklist.DEFAULT_NAME, UnorderedChecklist, { extends: UnorderedChecklist.EXTENDS });
customElements.define(CircularProgress.DEFAULT_NAME, CircularProgress);

const ready = f => /in/.test(document.readyState) ? setTimeout(ready, 5, f) : f();

ready(() => {
  const questUpdateSound = new Audio('./assets/audios/skyrim_quest_update.ogg');
  const skillIncreaseSound = new Audio('./assets/audios/skyrim_skill_increase_sound_effect.ogg');
  const levelUpSound = new Audio('./assets/audios/skyrim_level_up_sound_effect.ogg');

  /** @type {UnorderedChecklist} */
  const checkList = document.querySelector(`[is=${UnorderedChecklist.DEFAULT_NAME}]`);
  const checkItemsLength = checkList.items.length;

  const progress = document.querySelector(CircularProgress.DEFAULT_NAME, CircularProgress);

  questUpdateSound.play();

  checkList.addEventListener('change', event => {
    if (event.target.checked)
      skillIncreaseSound.play();
      console.log(event.target);
    const totalComplete = checkList.getCheckedItems().length / checkItemsLength * 100;
    progress.value = totalComplete;
    if (totalComplete === 100) {
      levelUpSound.play();
    }
  })
});