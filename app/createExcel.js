const getRecordsBtn = document.getElementById('getRecords');
const createExcelBtn = document.getElementById('createExcel');

const flatten = (data) => {
  const result = {};
  const recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (const i = 0, l = cur.length; i < l; i++)
        recurse(cur[i], prop + '[' + i + ']');
      if (l == 0) result[prop] = [];
    } else {
      let isEmpty = true;
      for (let p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + '.' + p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  };
  recurse(data, '');
  return result;
};

const unflatten = (data) => {
  if (Object(data) !== data || Array.isArray(data)) return data;
  const regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
    resultHolder = {};
  for (const p in data) {
    let cur = resultHolder,
      prop = '',
      m;
    while ((m = regex.exec(p))) {
      cur = cur[prop] || (cur[prop] = m[2] ? [] : {});
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  }
  return resultHolder[''] || resultHolder;
};

let customerObject = {};

getRecordsBtn.addEventListener('click', () => {
  ZOHO.CREATOR.init().then(() => {
    const customerConfig = {
      reportName: 'Customer_Report',
    };

    ZOHO.CREATOR.API.getAllRecords(customerConfig).then((response) => {
      customerObject = flatten(response.data[0]);
    });
  });
});

createExcelBtn.addEventListener('click', () => {
  const wb = XLSX.utils.book_new();
  wb.SheetNames.push('Customer');
  const ws_data = [customerObject];
  const ws = XLSX.utils.json_to_sheet(ws_data);
  wb.Sheets['Customer'] = ws;
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  }
  saveAs(
    new Blob([s2ab(wbout)], { type: 'application/octet-stream' }),
    'test.xlsx'
  );
});
