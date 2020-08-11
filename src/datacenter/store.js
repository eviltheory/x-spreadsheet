class Store {
  constructor() {
    this.patientInfo = {
      name: 'name',
      medNo: 'medNo',
      gender: '男',
      age: '0',
      admissionDiag: 'admissionDiag',
    };
    this.obxData = [
      { code: 'en_date_col1', timestamp: 10000, value: '2020/08/01' },
      { code: 'en_date_col2', timestamp: 10000, value: '2020/08/02' },
      { code: 'en_date_col3', timestamp: 10000, value: '2020/08/03' },
      { code: 'en_date_col4', timestamp: 10000, value: '2020/08/04' },
      { code: 'en_date_col5', timestamp: 10000, value: '2020/08/05' },
      { code: 'en_date_col6', timestamp: 10000, value: '2020/08/06' },
      { code: 'en_date_col7', timestamp: 10000, value: '2020/08/07' },
      { code: 'en_date_col8', timestamp: 10000, value: '2020/08/08' },
      { code: 'en_date_col9', timestamp: 10000, value: '2020/08/09' },
      { code: 'en_date_col10', timestamp: 10000, value: '2020/08/10' }];
  }

  getObxData({ codes, timestamps }) {
    const results = [];
    codes.forEach((code) => {
      timestamps.forEach((timestamp) => {
        let result = this.obxData.find(x => x.code === code && x.timestamp === timestamp);
        if (result === undefined) {
          result = {
            code,
            timestamp,
            value: `${(Math.floor(Math.random() * 2) + 1) * 10}`,
          };
          this.obxData.push(result);
        }
        results.push({ ...result });
      });
    });
    return results;
  }

  saveObxData(datas) {
    datas.forEach((data) => {
      let result = this.obxData.find(x => x.code === data.code && x.timestamp === data.timestamp);
      if (result === undefined) {
        result = {};
        this.obxData.push(result);
      }
      result.value = data.value;
    });
  }
}
export default new Store();
