export default class CameraEl extends HTMLElement {
  constructor() {
    super();
    this.rendered = false;
    this.stream = null;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  render() {
    this.innerHTML = `
      <video autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
    `;

    this.video = this.querySelector("video");
  }

  // 开启摄像头
  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      this.video.srcObject = this.stream;

      return new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play();
          resolve();
        };
      });
    } catch (error) {
      console.error("CameraView: 无法访问摄像头", error);
    }
  }

  // 停止摄像头
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.video.srcObject = null;
      this.stream = null;
    }
  }

  /**
   * 从视频流中截取当前帧并添加水印
   * @param {string} address
   */
  takeSnapshot(address) {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    // 1. 绘制视频帧
    this.context.drawImage(
      this.video,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );

    // 2. 绘制水印
    this.drawWatermark(address);

    return this.canvas.toDataURL("image/jpeg");
  }

  /**
   * 绘制水印
   * @param {string} address
   */
  drawWatermark(address) {
    //获取拍摄时间
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

    // 水印样式
    const padding = this.canvas.width * 0.04;
    const fontSize = this.canvas.width * 0.04;
    const lineGap = fontSize * 1.3;

    this.context.font = `bold ${fontSize}px sans-serif`;
    this.context.fillStyle = "#fff";
    this.context.textAlign = "left";
    this.context.textBaseline = "bottom";

    // 绘制时间
    this.context.fillText(
      time,
      padding,
      this.canvas.height - padding - lineGap,
    );

    // 绘制地址
    this.context.font = `${fontSize * 0.8}px sans-serif`;

    this.context.fillText(address, padding, this.canvas.height - padding);
  }
}

customElements.define("camera-el", CameraEl);
