export class Loader {
  private el: HTMLElement | null;

  constructor() {
    this.el = document.getElementById('loading');
  }

  show() {
    this.toggle('block');
  }

  hide() {
    this.toggle('none');
  }

  toggle(display: 'block' | 'none') {
    if (this.el) {
      this.el.style.display = display;
    }
  }
}
