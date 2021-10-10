import { unflatten } from './modules/flatten.js';

let sheetType = null;
let submittedFile = null;

const sheetTypeDropdown = document.getElementById('sheet-type');
const chooseFileBtn = document.getElementById('chooseFile');
const extractDataBtn = document.getElementById('extractData');
const getRecordsBtn = document.getElementById('getRecords');
const exportExcelBtn = document.getElementById('exportExcel');

// Set the type of excel sheet being used
sheetTypeDropdown.addEventListener('change', (event) => {
  sheetType = event.target.value;
  sheetType === ''
    ? (chooseFileBtn.disabled = true)
    : (chooseFileBtn.disabled = false);
});

// Upload file and hold on to it
chooseFileBtn.addEventListener('change', (event) => {
  submittedFile = event.target.files[0];
  submittedFile === null
    ? (extractDataBtn.disabled = true)
    : (extractDataBtn.disabled = false);
});

// Extract data from uploaded excel sheet
extractDataBtn.addEventListener('click', () => {
  if (submittedFile) {
    const excelData = {};
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, {
        type: 'binary',
      });

      // Create an array of objects for each sheet and save it to the excelData object
      workbook.SheetNames.forEach((sheet) => {
        const row = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheet]
        );
        // Save the name of the sheet as the key and the array of objects as the value
        excelData[`${sheet}`] = row;
      });
      console.log(unflatten(excelData.Customer[0]));

      // ZOHO.CREATOR.init().then(function (data) {
      // for (sheet in excelData) {
      //   for (row in excelData[sheet]) {
      //     let formData = {};

      //     switch (sheetType) {
      //       case 'Customers-Salespersons':
      //         formData = {
      //           data: {
      //             [`${sheet}_Name`]: {
      //               display_value: `${excelData[sheet][row].First_Name} ${excelData[sheet][row].Last_Name}`,
      //               first_name: `${excelData[sheet][row].First_Name}`,
      //               last_name: `${excelData[sheet][row].Last_Name}`,
      //             },
      //             Email: excelData[sheet][row].Email,
      //             Phone_Number: excelData[sheet][row].Phone_Number,
      //           },
      //         };
      //         break;
      //       case 'Sales':
      //         formData = {
      //           data: {},
      //         };
      //         break;
      //     }

      //     console.log(sheet, formData.data);

      //     // const config = {
      //     //   formName: sheet,
      //     //   data: formData,
      //     // };

      //     // ZOHO.CREATOR.API.addRecord(config).then(function (response) {
      //     //   if (response.code == 3000) {
      //     //     console.log('Record added successfully');
      //     //   } else {
      //     //     console.log(response);
      //     //   }
      //     // });
      //   }
      // }
      // });
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
