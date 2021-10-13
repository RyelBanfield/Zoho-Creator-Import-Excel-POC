import { flatten, unflatten } from './modules/flatten.js';
import { exportExcel } from './modules/exportExcel.js';

let submittedFile = null;
let recordObject = {};
let report = null;

const chooseFileBtn = document.getElementById('chooseFile');
chooseFileBtn.addEventListener('change', (event) => {
  submittedFile = event.target.files[0];
  submittedFile === null
    ? (extractDataBtn.disabled = true)
    : (extractDataBtn.disabled = false);
});

const extractDataBtn = document.getElementById('extractData');
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

            if (
              Object.values(formData.data).some((key) => Array.isArray(key))
            ) {
              let deletedArray = {};
              let tempObject = {};

              for (let key in formData.data) {
                if (Array.isArray(formData.data[key])) {
                  deletedArray = { ...deletedArray, [key]: formData.data[key] };
                } else {
                  tempObject[key] = formData.data[key];
                }
              }

              formData.data = { ...flatten(tempObject), ...deletedArray };
            }

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

const getRecordsBtn = document.getElementById('getRecords');
getRecordsBtn.addEventListener('click', () => {
  report = prompt('Enter the form name');

  ZOHO.CREATOR.init().then(() => {
    const config = {
      reportName: `${report}_Report`,
    };

    ZOHO.CREATOR.API.getAllRecords(config).then((response) => {
      console.log('Zoho Response', response.data);
      recordObject = flatten(response.data[0]);
      exportExcelBtn.disabled = false;
    });
  });
});

const exportExcelBtn = document.getElementById('exportExcel');
exportExcelBtn.addEventListener('click', () => {
  exportExcel(report, recordObject);
});
