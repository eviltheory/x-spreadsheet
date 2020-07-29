import { Element, h } from './element';
import { cssPrefix } from '../config';

export default class FormInfo extends Element {
  constructor(width, hint) {
    super('div', `${cssPrefix}-formInfo`);
    this.vchange = () => {};
    this.el = h('div', `${cssPrefix}-form-input`);
    //this.input = new Element('input');
    this.input = h('input', '').css('width', width)
      .on('input', evt => this.vchange(evt))
      .attr('placeholder', hint);
    console.log(this);
    this.el.child(this.input);
  }

  focus() {
    setTimeout(() => {
      this.input.el.focus();
    }, 10);
  }

  hint(v) {
    this.input.attr('placeholder', v);
  }

  val(v) {
    return this.input.val(v);
  }
}
