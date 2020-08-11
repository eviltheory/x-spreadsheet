import moment from 'moment';
import store from './store';

export default class DataTable {
  constructor(datacenter, {
    id, type, rows, cols, editable,
  }) {
    this.dataCenter = datacenter;
    this.id = id;
    this.type = type;
    this.rows = rows;
    this.cols = cols;
    this.editable = editable;
    this.init();
  }

  setEditable(editable) {
    this.content.forEach((x) => {
      if (x.cell.data.meta === undefined) {
        x.cell.data.meta = {};
      }
      x.cell.data.meta.editable = editable;
    });
  }

  init() {
    [...this.rows, ...this.cols].forEach((x) => {
      x.cell = this.dataCenter.cells.flat()
        .find(cell => cell?.data?.meta?.id === x.id);
    });
    const content = [];
    this.rows.forEach((row) => {
      const { ri } = row.cell;
      this.cols.forEach((col) => {
        const { ci } = col.cell;
        content.push({
          ri,
          ci,
          code: row.type === 'value' ? row.code : col.code,
          timestampCell: row.type === 'date' ? row.cell : col.cell,
          cell: this.dataCenter.cells[ri][ci],
        });
      });
    });
    this.content = content;
    if (this.editable !== undefined) {
      this.setEditable(this.editable);
    }
  }

  getTimestamp(cell) {
    // eslint-disable-next-line new-cap
    const m = new moment(cell?.data?.text ?? '');
    if (m.isValid()) {
      return m.toDate().getTime();
    }
    return undefined;
  }

  getCodes() {
    const codes = [];
    [...this.rows, ...this.cols].forEach((x) => { if (x.type === 'value')codes.push(x.code); });
    return codes;
  }

  getTimestamps() {
    const timestamps = [];
    [...this.rows, ...this.cols].forEach((x) => {
      if (x.type === 'date') {
        const timestamp = this.getTimestamp(x.cell);
        if (timestamp) {
          timestamps.push(timestamp);
        }
      }
    });
    return timestamps;
  }

  async loadData() {
    const codes = this.getCodes();
    const timestamps = this.getTimestamps();
    if (timestamps.length > 0) {
      const data = await this.loadDataRequest({
        codes,
        timestamps,
      });
      data.forEach((x) => {
        const tabelCell = this.content.find(c => c.code === x.code
          && this.getTimestamp(c.timestampCell) === x.timestamp);
        tabelCell.cell.data.text = x.value;
      });
    }
  }

  async loadDataRequest({ codes, timestamps }) {
    return store.getObxData({ codes, timestamps });
  }

  async saveObxData() {
    return this.saveObxDataRequest(this.getObxData());
  }

  getObxData() {
    const result = [];
    this.content.forEach((x) => {
      result.push({
        code: x.code,
        timestamp: this.getTimestamp(x.timestampCell),
        value: x.cell.data.text,
      });
    });
    return result;
  }

  async saveObxDataRequest(datas) {
    return store.saveObxData(datas);
  }
}
