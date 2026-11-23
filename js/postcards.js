// Each card shares one source file. Hold its final frame for the visitor.
for (const player of document.querySelectorAll('.postcard-player')) {
  const video = player.querySelector('video');
  const fps = Number(player.dataset.fps);
  const starts = player.dataset.startFrames.split(',').map(Number);
  const controls = player.querySelector('.postcard-controls');
  const previous = controls.querySelector('[data-previous]');
  const next = controls.querySelector('[data-next]');
  let index = 0;
  let held = false;
  let callback = null;

  function select(value) {
    index = value;
    controls.querySelector('output').value = `${index + 1} of ${starts.length}`;
    previous.disabled = index === 0;
    next.disabled = index === starts.length - 1;
  }

  function move(value) {
    if (value < 0 || value >= starts.length) return;
    held = false;
    select(value);
    video.currentTime = starts[value] / fps;
    video.play().catch(() => { /* Native play remains available. */ });
  }

  function checkBoundary(time) {
    if (video.paused || video.seeking || index === starts.length - 1) return;
    const lastFrame = (starts[index + 1] - 1) / fps;
    if (time >= lastFrame - .001) {
      held = true;
      video.pause();
      video.currentTime = lastFrame;
    }
  }

  function onFrame(now, metadata) {
    callback = null;
    checkBoundary(metadata.mediaTime);
    if (!video.paused) callback = video.requestVideoFrameCallback(onFrame);
  }

  video.addEventListener('seeking', () => {
    const frame = Math.floor(video.currentTime * fps + .001);
    if (frame !== starts[index + 1] - 1) held = false;
    const selected = starts.findLastIndex(start => start <= frame);
    if (selected >= 0 && selected !== index) {
      held = false;
      select(selected);
    }
  });
  video.addEventListener('play', () => {
    if (held) move(index + 1);
    if (video.requestVideoFrameCallback && callback === null) callback = video.requestVideoFrameCallback(onFrame);
  });
  video.addEventListener('pause', () => {
    if (callback !== null) video.cancelVideoFrameCallback(callback);
    callback = null;
  });
  if (!video.requestVideoFrameCallback) video.addEventListener('timeupdate', () => checkBoundary(video.currentTime));

  previous.addEventListener('click', () => move(index - 1));
  next.addEventListener('click', () => move(index + 1));
  select(0);
  controls.hidden = false;
  player.querySelector('.postcard-hint').hidden = false;
}
