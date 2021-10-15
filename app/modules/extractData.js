import { unflatten } from './flatten.js';

export const extractData = (submittedFile) => {
  const excelData = {};
  const fileReader = new FileReader();
  fileReader.onload = (event) => {
    const data = event.target.result;
    const workbook = XLSX.read(data, {
      type: 'binary',
    });

    workbook.SheetNames.forEach((sheet) => {
      const row = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
      excelData[`${sheet}`] = row;
    });

    // ZOHO.CREATOR.init().then(() => {
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
    // });
  };
  fileReader.readAsBinaryString(submittedFile);
};
