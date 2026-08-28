import storage from "./storage.js";

/**
 * @typedef {Object} UIElements
 * @property {Object} buttons
 * @property {HTMLButtonElement} buttons.capture 拍照按钮
 * @property {HTMLButtonElement} buttons.save 保存照片按钮
 * @property {HTMLButtonElement} buttons.retake 重拍按钮
 * @property {Object} forms
 * @property {HTMLFormElement} forms.address
 * @property {HTMLDivElement} camera
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
  camera: document.querySelector("#camera"),
  video: document.querySelector("#video"),
  preview: document.querySelector("#preview"),
  photo: document.querySelector("#photo"),
  popover: document.querySelector("#popover"),
};

const FAKE_ADDRESS = "月球";

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

/** @type {MediaStream | undefined} */
let stream;

/** @type {'camera' | 'preview'} */
let currentStatus = "camera";

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment", // 优先请求手机后置摄像头
      },
      audio: false,
    });

    ui.video.srcObject = stream;

    await new Promise((resolve) => {
      ui.video.addEventListener("loadedmetadata", resolve, { once: true });
    });

    await ui.video.play();
  } catch (error) {
    console.error("无法访问摄像头:", error);
  }
}

function stopCamera() {
  stream?.getTracks().forEach((track) => track.stop());
  ui.video.srcObject = null;
}

/**
 * 从视频流中截取当前帧并显示在指定位置
 * @param {HTMLVideoElement} video 视频元素，用于获取当前画面
 * @param {string} location 地址
 * @returns {string} 预览照片的 data URL（jpeg 格式）
 */
function takePhoto(video, location) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // 1. 绘制照片
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 2. 获取拍摄时间
  const now = new Date();

  const time = now.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // 3. 水印样式
  const padding = canvas.width * 0.04;
  const fontSize = canvas.width * 0.04;
  const lineGap = fontSize * 1.3;

  context.font = `bold ${fontSize}px sans-serif`;
  context.fillStyle = "#fff";
  context.textAlign = "left";
  context.textBaseline = "bottom";

  // 4. 绘制时间
  context.fillText(time, padding, canvas.height - padding - lineGap);

  // 5. 绘制地址
  context.font = `${fontSize * 0.8}px sans-serif`;

  context.fillText(location, padding, canvas.height - padding);

  // 6. 返回预览照片
  const src = canvas.toDataURL("image/jpeg");
  return src;
}

function savePhoto() {
  canvas.toBlob((blob) => {
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
  ui.camera.dataset.hidden = String(!isCamera);
  ui.preview.dataset.hidden = String(isCamera);
}

ui.buttons.capture.addEventListener("click", () => {
  const src = takePhoto(ui.video, storage.get("address") ?? FAKE_ADDRESS);
  ui.photo.src = src;
  currentStatus = "preview";
  stopCamera();
  render();
});

ui.buttons.save.addEventListener("click", async () => {
  savePhoto();
  await startCamera();
  currentStatus = "camera";
  render();
});

ui.buttons.retake.addEventListener("click", async () => {
  await startCamera();
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
  if (!address) return;
  storage.set("address", address);
  formEl.reset();
  ui.popover.hidePopover();
});

startCamera();
