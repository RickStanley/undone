import CheckItem from "../components/CheckItem.js";

customElements.define(CheckItem.DEFAULT_NAME, CheckItem);

const perkSelect = new Audio('../assets/audios/skyrim_select_perk_sound_effect.ogg');

const listener = new BroadcastChannel('updates?');
const deliverer = new BroadcastChannel('updates!');
const progress = document.querySelector('progress');

listener.postMessage('give:progress');
listener.postMessage('give:nextitem');

deliverer.onmessage = e => {
  /** @type {{type: string, detail: any}} */
  const update = e.data;
  switch (update.type) {
    case 'progress':
      progress.value = update.detail;
      progress.textContent = `${progress.value}%`;
      break;
    case 'nextitem':
      const nextItem = update.detail;
      document.querySelector('check-item')?.remove();
      if (nextItem) {
        const currentItem = document.createElement('check-item');
        currentItem.setAttribute('name', nextItem.name);
        currentItem.textContent = nextItem.content;
        document.body.appendChild(currentItem);
      }
      break;
    case 'checklist':
      if (update.detail === 'closed') {
        window.close();
      }
      break;
  }
};

document.body.addEventListener('click', e => {
  const checkItem = e.target.closest('check-item');

  if (checkItem) {
    if (!perkSelect.ended) {
      perkSelect.pause();
      perkSelect.currentTime = 0;
    }
    perkSelect.play();
    checkItem.remove();
    const itemName = checkItem.name;
    deliverer.postMessage({
      type: 'itemdone',
      detail: itemName
    });
    listener.postMessage('give:progress');
    listener.postMessage('give:nextitem');
  }
});
