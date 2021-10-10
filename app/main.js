import { flatten, unflatten } from './modules/flatten.js';
import { exportExcel } from './modules/exportExcel.js';

let submittedFile = null;
let recordObject = {};

const chooseFileBtn = document.getElementById('chooseFile');
const extractDataBtn = document.getElementById('extractData');
const getRecordsBtn = document.getElementById('getRecords');
const exportExcelBtn = document.getElementById('exportExcel');

chooseFileBtn.addEventListener('change', (event) => {
  submittedFile = event.target.files[0];
  submittedFile === null
    ? (extractDataBtn.disabled = true)
    : (extractDataBtn.disabled = false);
});

extractDataBtn.addEventListener('click', () => {
  if (submittedFile) {
    const excelData = {};
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, {
        type: 'binary',
      });

      workbook.SheetNames.forEach((sheet) => {
        const row = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheet]
        );
        excelData[`${sheet}`] = row;
      });

      ZOHO.CREATOR.init().then(() => {
        for (let sheet in excelData) {
          for (let row in excelData[sheet]) {
            let formData = {
              data: unflatten(excelData[sheet][row]),
            };

            console.log(sheet, formData.data);

            const config = {
              formName: sheet,
              data: formData,
            };

            ZOHO.CREATOR.API.addRecord(config).then((response) => {
              if (response.code == 3000) {
                console.log('Record added successfully');
              } else {
                console.log(response);
              }
            });
          }
        }
      });
    };
    fileReader.readAsBinaryString(submittedFile);
  }
});

getRecordsBtn.addEventListener('click', () => {
  ZOHO.CREATOR.init().then(() => {
    const config = {
      reportName: 'Sale_Report',
    };

    ZOHO.CREATOR.API.getAllRecords(config).then((response) => {
      console.log(flatten(response.data[0]));
      recordObject = flatten(response.data[0]);
    });

    exportExcelBtn.disabled = false;
  });
});

exportExcelBtn.addEventListener('click', () => {
  exportExcel('Sale', recordObject);
});
