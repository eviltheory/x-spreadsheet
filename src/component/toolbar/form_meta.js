import Item from './item';
import FormInfo from '../form_info';

export default class FormMeta extends Item {
  constructor(toolbar) {
    super('formMeta');
    this.toolbar = toolbar;
  }

  element() {
    const { tag } = this;
    this.meta = new FormInfo('300px', 'Meta');
    this.input = this.meta.input;
    this.meta.vchange = (e) => {
    };
    this.meta.onFocus = (e) => {
      console.log(this.toolbar.data.getSelectedCell());
      this.selectedCell = this.toolbar.data.getSelectedCell();
      this.toolbar.current = this;
    };
    this.meta.onBlur = (e) => {
      this.toolbar.current = null;
      if (e.target.value !== '') {
        try {
          console.log(e.target.value);
          // eslint-disable-next-line no-eval
          const json = eval(`(${e.target.value})`);
          this.value = json;
          this.change(this.tag, { cell: this.selectedCell, meta: json });
        } catch (ex) {
          console.log(ex);
          window.alert('Meta JSON Parse Error');
        }
      }
    };
    return super.element()
      .child(this.meta.el)
      .on('click', () => this.click());
  }

  click() {
    // this.change(this.tag, this.toggle());
  }

  setState(value) {
    this.value = value;
    this.meta.val(value ? JSON.stringify(value):'');
  }

  toggle() {
    return this.el.toggle();
  }

  active() {
    return this.el.hasClass('active');
  }
}
