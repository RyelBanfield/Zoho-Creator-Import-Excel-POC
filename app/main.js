import { flatten, unflatten } from './modules/flatten.js';

let submittedFile = null;

const chooseFileBtn = document.getElementById('chooseFile');
const extractDataBtn = document.getElementById('extractData');
// const getRecordsBtn = document.getElementById('getRecords');
// const exportExcelBtn = document.getElementById('exportExcel');

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

// let customerObject = {};

// getRecordsBtn.addEventListener('click', () => {
//   ZOHO.CREATOR.init().then(() => {
//     const customerConfig = {
//       reportName: 'Customer_Report',
//     };

//     ZOHO.CREATOR.API.getAllRecords(customerConfig).then((response) => {
//       customerObject = flatten(response.data[0]);
//     });
//   });
// });

// exportExcelBtn.addEventListener('click', () => {
//   exportExcel('Customer', customerObject);
// });
