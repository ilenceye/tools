import storage from "./storage.js";

import AddressPopover from "./components/address-popover.js";
import CameraEl from "./components/camera-el.js";
import ActionController from "./controllers/actions.js";

/**
 * @typedef {Object} UIElements
 * @property {HTMLDivElement} cameraView
 * @property {CameraEl} camera
 * @property {HTMLDivElement} preview
 * @property {HTMLImageElement} photo 图片元素
 */

/** @type {UIElements} */
const ui = {
  cameraView: document.querySelector("#camera-view"),
  camera: document.querySelector("#camera"),
  preview: document.querySelector("#preview"),
  photo: document.querySelector("#photo"),
};

/** @type {'camera' | 'preview'} */
let currentStatus = "camera";

const actions = {
  capture: async () => {
    await takePhoto();
  },
  save: async () => {
    savePhoto();
    switchToCameraView();
  },
  retake: async () => {
    switchToCameraView();
  },
};

async function takePhoto() {
  const address = storage.get("address") || "未知地点";
  const photoSrc = ui.camera.takeSnapshot(address);
  ui.photo.src = photoSrc;
  currentStatus = "preview";
  ui.camera.stop();
  render();
}

function savePhoto() {
  ui.camera.canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `watermark-${Date.now()}.jpg`;

    link.click();

    URL.revokeObjectURL(url);
  }, "image/jpeg");
}

async function switchToCameraView() {
  await ui.camera.start();
  currentStatus = "camera";
  render();
}

function render() {
  const isCamera = currentStatus === "camera";
  ui.cameraView.dataset.hidden = String(!isCamera);
  ui.preview.dataset.hidden = String(isCamera);
}

new ActionController(actions).listen(document.body);

ui.camera.start();
