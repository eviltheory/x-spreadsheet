import Item from './item';
import FormInfo from '../form_info';

export default class FormMeta extends Item {
  constructor(toolbar) {
    super('formMeta');
    this.toolbar = toolbar;
  }

  element() {
    const { tag } = this;
    this.meta = new FormInfo(100, 'Meta');
    this.meta.vchange = (e) => {
      this.value = e.target.value;
      this.change(this.tag, this.value);
    };
    this.meta.input.on('focus', () => {
      this.toolbar.current = this;
    });
    this.meta.input.on('blur', () => {
      this.toolbar.current = null;
    });
    return super.element()
      .child(this.meta.el)
      .on('click', () => this.click());
  }

  click() {
    // this.change(this.tag, this.toggle());
  }

  setState(value) {
    this.value = value;
    this.meta.val(value);
  }

  toggle() {
    return this.el.toggle();
  }

  active() {
    return this.el.hasClass('active');
  }
}
