import storage from "./storage.js";

import CameraEl from "./components/camera-el.js";

/**
 * @typedef {Object} UIElements
 * @property {Object} buttons
 * @property {HTMLButtonElement} buttons.capture 拍照按钮
 * @property {HTMLButtonElement} buttons.save 保存照片按钮
 * @property {HTMLButtonElement} buttons.retake 重拍按钮
 * @property {Object} forms
 * @property {HTMLFormElement} forms.address
 * @property {HTMLDivElement} cameraView
 * @property {CameraEl} camera
 * @property {HTMLVideoElement} video 视频元素
 * @property {HTMLDivElement} preview
 * @property {HTMLImageElement} photo 图片元素
 * @property {HTMLDivElement} popover
 */

/** @type {UIElements} */
const ui = {
  buttons: {
    capture: document.querySelector("#capture"),
    save: document.querySelector("#save"),
    retake: document.querySelector("#retake"),
  },
  forms: {
    address: document.querySelector("#address-form"),
  },
  cameraView: document.querySelector("#camera-view"),
  camera: document.querySelector("#camera"),
  video: document.querySelector("#video"),
  preview: document.querySelector("#preview"),
  photo: document.querySelector("#photo"),
  popover: document.querySelector("#popover"),
};

/** @type {'camera' | 'preview'} */
let currentStatus = "camera";

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

function render() {
  const isCamera = currentStatus === "camera";
  ui.cameraView.dataset.hidden = String(!isCamera);
  ui.preview.dataset.hidden = String(isCamera);
}

ui.buttons.capture.addEventListener("click", () => {
  takePhoto();
});

ui.buttons.save.addEventListener("click", async () => {
  savePhoto();
  await ui.camera.start();
  currentStatus = "camera";
  render();
});

ui.buttons.retake.addEventListener("click", async () => {
  await ui.camera.start();
  currentStatus = "camera";
  render();
});

ui.popover.addEventListener("toggle", (e) => {
  if (e.newState === "open") {
    // @ts-ignore
    ui.forms.address.elements["address"].value = storage.get("address");
  }
});

ui.forms.address.addEventListener("submit", (e) => {
  e.preventDefault();
  const formEl = ui.forms.address;
  const formData = new FormData(formEl);
  const address = formData.get("address").toString().trim();
  // if (!address) return;
  storage.set("address", address);
  formEl.reset();
  ui.popover.hidePopover();
});

ui.camera.start();
