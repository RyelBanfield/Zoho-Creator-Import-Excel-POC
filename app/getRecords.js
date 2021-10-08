const getRecordsBtn = document.getElementById('getRecords');

// Get records from zoho database
getRecordsBtn.addEventListener('click', () => {
  ZOHO.CREATOR.init().then(function (data) {
    const customerConfig = {
      // Name of the report to get data from
      reportName: 'Customer_Report',
    };

    ZOHO.CREATOR.API.getAllRecords(customerConfig).then(function (response) {
      console.log(Object.keys(response.data[0]));
      console.log(response.data[0]);
    });

    const salespersonConfig = {
      // Name of the report to get data from
      reportName: 'Salesperson_Report',
    };

    ZOHO.CREATOR.API.getAllRecords(salespersonConfig).then(function (response) {
      console.log(Object.keys(response.data[0]));
      console.log(response.data[0]);
    });

    const saleConfig = {
      // Name of the report to get data from
      reportName: 'Sale_Report',
    };

    ZOHO.CREATOR.API.getAllRecords(saleConfig).then(function (response) {
      console.log(Object.keys(response.data[0]));
      console.log(response.data[0]);
    });
  });
});
