const thread2 = new Worker("./thread2.js");

self.addEventListener('message', (evt) => {
  thread2.postMessage(evt.data);
});

thread2.addEventListener('message', (evt) => {
  self.postMessage(evt.data);
});