function openNewWindow(url) {
    chrome.tabs.create({url});
}

function createSpreadsheet() {
    return gapi.client.sheets.spreadsheets.create();
}

function getSpreadsheet(spreadsheetId) {
    return gapi.client.sheets.spreadsheets.get({spreadsheetId});
}

function addJSONDataSheet(spreadsheet) {
    const {spreadsheetId} = spreadsheet.result;

    const RESOURCE = {
        requests: [
            {
                addSheet: {
                    properties: {
                        title: "json data",
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

function setPlanSheetTitle(spreadsheetId, parameters) {
    const RESOURCE = {
        requests: [
            {
                updateSheetProperties: {
                    properties: {
                        index: 0,
                        title: `${parameters.planName} - ${parameters.dateRange}`,
                    },
                    fields: "title",
                },
            },
        ],
    };

    return gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: RESOURCE,
    });
}
