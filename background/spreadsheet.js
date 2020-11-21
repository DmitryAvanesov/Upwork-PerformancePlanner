function openNewWindow(url) {
  chrome.windows.create({ url });
}

function createSrpeadsheet() {
  return gapi.client.sheets.spreadsheets.create();
}

function getSpreadsheet(spreadsheetId) {
  return gapi.client.sheets.spreadsheets.get({ spreadsheetId: spreadsheetId });
}

function addSheet2(spreadsheet) {
  const { spreadsheetId } = spreadsheet.result;

  const RESOURCE = {
    requests: [
      {
        addSheet: {
          properties: {
            title: "Sheet2",
          },
        },
      },
    ],
  };

  return gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: RESOURCE,
  });
}
