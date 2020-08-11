import _ from 'lodash';
import store from './store';
import DataTable from './dataTable';

export default class DataCenter {
  async loadData(timestamp) {
    this.timestamp = timestamp;
    await this.loadFuncs();
    await this.loadObxModels();
    await this.loadObxs(timestamp);
    await this.loadTable();
    setTimeout(() => {
      this.xs.sheet.table.render();
    }, 2000);
  }

  async loadFuncs() {
    await this.loadPatientInfo();
  }

  async loadPatientInfo() {
    const patientInfoMetas = _.pickBy(this.metas, x => x.meta.type === 'patientInfo');
    if (_.isEmpty(patientInfoMetas)) return;
    const patientInfo = await this.loadPatientInfoRequest();
    _.forIn(patientInfoMetas, (m) => {
      const value = patientInfo[m.meta.code];
      m.cell.data.text = value;
    });
  }

  async loadObxModels() {
    const obxModels = [];
    _.uniq(_.values(_.pickBy(this.metas, x => x.meta.type === 'value')).map(x => x.meta.code)).forEach(x => obxModels.push({
      valueType: 'DECIMAL',
      code: x,
    }));
    _.uniq(_.values(_.pickBy(this.metas, x => x.meta.type === 'dict')).map(x => x.meta.code)).forEach(x => obxModels.push({
      valueType: 'DICT',
      code: x,
    }));
    _.forIn(this.tables, (table) => {
      table.getCodes().forEach(x => obxModels.push({
        valueType: 'TEXT',
        code: x,
      }));
    });
    this.obxModels = obxModels;
  }

  async loadObxs(timestamp) {
    const obxCodes = _.uniq(_.values(_.pickBy(this.metas, x => x.meta.type === 'value' || x.meta.type === 'dict')).map(x => x.meta.code));
    const obxResults = await this.loadObxsRequest({ codes: obxCodes, timestamp });
    obxResults.forEach((x) => {
      _.forIn(_.pickBy(this.metas, y => y.meta.code === x.code), (value, key) => {
        const { ri, ci } = value.cell;
        this.cellUpdate(ri, ci, x.value);
      });
    });
  }

  async loadPatientInfoRequest() {
    return store.patientInfo;
  }


  async loadObxsRequest({ codes, timestamp }) {
    return store.getObxData({
      codes,
      timestamps: [timestamp],
    });
  }

  async loadTable() {
    _.forIn(this.tables, (table) => {
      table.loadData();
    });
  }

  async saveData() {
    await this.saveFuncs();
    await this.saveObxs();
    await this.saveTable();
  }

  async saveFuncs() {
    await this.savePatientInfo();
  }

  async savePatientInfo() {
    const patientInfoMetas = _.pickBy(this.metas, x => x.meta.type === 'patientInfo');
    if (_.isEmpty(patientInfoMetas)) return;
    const patientInfo = {};
    _.forIn(patientInfoMetas, (m) => {
      patientInfo[m.meta.code] = m.cell.data.text;
    });
    await this.savePatientInfoRequest(patientInfo);
  }

  async savePatientInfoRequest(patientInfo) {
    store.patientInfo = { ...store.patientInfo, ...patientInfo };
  }

  getObxData() {
    const obxValues = [];
    const dicts = {};
    this.cells.flat().forEach((x) => {
      const { type, code } = x?.data?.meta || {};
      if (type === 'value') {
        obxValues.push({
          code,
          value: x.data.text,
          timestamp: this.timestamp,
        });
      } else if (type === 'dict') {
        dicts[code] = dicts[code] || '';
        if (x.data.meta.checkbox === true) {
          dicts[code] = x.data.meta.index;
        }
      }
    });
    _.forIn(dicts, (value, key) => obxValues.push({
      code: key,
      value,
      timestamp: this.timestamp,
    }));
    return obxValues;
  }

  async saveObxs() {
    store.saveObxData(this.getObxData());
  }

  async saveTable() {
    _.forIn(this.tables, table => table.saveObxData());
  }

  cellUpdate(ri, ci, value) {
    const cell = this.cells[ri][ci];
    const { code, index } = cell.data.meta;
    const obxModel = this.obxModels.find(model => model.code === code);
    if (obxModel.valueType === 'DECIMAL') {
      cell.data.text = value;
    } else if (obxModel.valueType === 'DICT') {
      if (value === index) {
        this.xs.data.checkbox(ri, ci, true);
        this.cellPostChange({ cell: value.cell });
      }
    }
  }

  cellEditable(ri, ci) {
    const editable = this.cellMeta(ri, ci)?.editable;
    if (editable === true) {
      return true;
    }
    if (editable?.check) {
      return _.every(editable.check, x => this.metas[x]?.meta?.checkbox === true);
    }
    return false;
  }

  cellMeta(ri, ci) {
    return this.cells[ri]?.[ci]?.data?.meta;
  }

  cellPreChange({
    // eslint-disable-next-line no-unused-vars
    ri, ci, type, cell, oldCell, newText: text, state,
  }) {
    return true;
  }

  cellPostChange({
    // eslint-disable-next-line no-unused-vars
    ri, ci, type, cell, oldCell, newText: text, state,
  }) {
    // let e = event;
    // if (typeof (event) === 'string') {
    //   e = { type: event };
    // }

    if (cell?.meta?.checkbox === true) {
      cell.meta?.setClear?.forEach((id) => {
        const clearCell = this.metas[id]?.cell;
        console.log('clearCell', clearCell);
        if (clearCell.data?.meta?.checkbox !== undefined) {
          this.xs.data.checkbox(clearCell.ri, clearCell.ci, false);
        } else {
          clearCell.data.text = '';
        }
      });
    }
  }

  init(xs) {
    this.xs = xs;
    this.metas = {};
    this.cells = [];
    this.tables = {};
    this.store = store;
    const { cells } = this;
    const rows = xs.data.rows._;
    Object.keys(rows)
      .forEach((ri) => {
        const cols = rows[ri]?.cells;
        if (cols) {
          Object.keys(cols)
            .forEach((ci) => {
              cells[ri] = cells[ri] || [];
              cells[ri][ci] = {
                ri,
                ci,
                data: cols[ci],
              };
            });
        }
      });
    this.cells.flat().forEach((cell) => {
      const meta = cell.data?.meta;
      if (meta?.id) {
        this.metas[meta.id] = {
          meta: cell.data.meta,
          cell,
        };
      }
      if (meta?.table) {
        this.tables[meta.table.id] = new DataTable(this, meta.table);
      }
    });
  }
}
