import storage from "../storage.js";

export default class AddressPopover extends HTMLElement {
  constructor() {
    super();
    this.rendered = false;
  }

  connectedCallback() {
    if (!this.rendered) {
      this.form = this.querySelector("form");
      this.input = this.querySelector("input");

      this.listen();

      this.rendered = true;
    }
  }

  listen() {
    this.addEventListener("toggle", (e) => {
      if (e.newState === "open") {
        this.input.value = storage.get("address") || "";
      }
    });

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const address = this.input.value.trim();
      storage.set("address", address);
      this.form.reset();
      this.hide();
    });
  }

  show() {
    this.showPopover();
  }

  hide() {
    this.hidePopover();
  }
}

customElements.define("address-popover", AddressPopover);
