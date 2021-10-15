import { unflatten } from './flatten.js';

export const extractData = (sheetType, submittedFile) => {
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

    ZOHO.CREATOR.init().then(() => {
      for (let sheet in excelData) {
        for (let row in excelData[sheet]) {
          let formData = {
            data: unflatten(excelData[sheet][row]),
          };

          const asyncSwitch = async (sheetType) => {
            switch (sheetType) {
              case 'Customers-Salespersons':
                break;
              case 'Sales':
                let records = {};

                let config = {
                  reportName: 'Customer_Report',
                };

                await ZOHO.CREATOR.API.getAllRecords(config).then(
                  (response) => {
                    records['customerReport'] = response.data;
                  }
                );

                config = {
                  reportName: 'Salesperson_Report',
                };

                await ZOHO.CREATOR.API.getAllRecords(config).then(
                  (response) => {
                    records['salespersonReport'] = response.data;
                  }
                );

                const { customerReport, salespersonReport } = records;

                const customerID = customerReport.find(
                  (customer) =>
                    customer.Customer_Name.display_value ===
                    formData.data.Customer
                ).ID;
                const salespersonID = salespersonReport.find(
                  (salesperson) =>
                    salesperson.Salesperson_Name.display_value ===
                    formData.data.Salesperson
                ).ID;
                formData.data.Customer = customerID;
                formData.data.Salesperson = salespersonID;
                break;
            }
          };

          asyncSwitch(sheetType);

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
};
