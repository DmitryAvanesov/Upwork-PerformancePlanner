chrome.runtime.onInstalled.addListener(function () {
  // interacting with the popup
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: "ads.google.com" },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});

function onLoad() {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    const API_KEY = "AIzaSyB3izcQikDMTg1E4hlMeZx3u0Dy4TMYQdM";
    const CLIENT_ID =
      "830407752509-qtgnjs8tde5o0nr1bjh19bvtpv2hn3g1.apps.googleusercontent.com";
    const DISCOVERY_DOCS = [
      "https://sheets.googleapis.com/$discovery/rest?version=v4",
    ];
    const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

    gapi.load("client:auth2", function () {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scopes: SCOPES,
        })
        .then(function () {
          gapi.auth.setToken({
            access_token: token,
          });
        });
    });
  });
}

function transformJSON(data) {
  const SPREADSHEET_ID = "1KZJiwBaSZ-jIASS0j7b62NkanW1WWdP7OHjdu_qbJjk";

  getSpreadsheet(SPREADSHEET_ID).then(function (spreadsheet) {
    addSheet(spreadsheet).then(function (addSheetResponse) {
      const sheet = addSheetResponse.result.replies[0].addSheet.properties;

      writeTransformedData(data, SPREADSHEET_ID, sheet).then(function () {
        drawChart(data, SPREADSHEET_ID, sheet);
      });
    });
  });
}

function getSpreadsheet(spreadsheetId) {
  return gapi.client.sheets.spreadsheets.get({ spreadsheetId: spreadsheetId });
}

function addSheet(spreadsheet) {
  const { sheets, spreadsheetId } = spreadsheet.result;

  const nextSheetNumber =
    sheets.reduce(function (previousValue, currentValue) {
      const title = currentValue.properties.title;

      return isNaN(title) || parseInt(title) > previousValue
        ? parseInt(title)
        : previousValue;
    }, 1) + 1;

  const RESOURCE = {
    requests: [
      {
        addSheet: {
          properties: {
            title: nextSheetNumber.toString(),
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

function writeTransformedData(data, spreadsheetId, sheet) {
  const RANGE = `${sheet.title}!A2:B${data.length}`;
  const VALUE_INPUT_OPTION = "USER_ENTERED";
  const values = [];

  for (let i = 1; i < data.length; i++) {
    const row = [];
    row.push(data[i][1][3]);

    if (data[i][4]) {
      if (data[i][4][1]) {
        row.push(data[i][4][1] / 1000000);
      } else if (data[i][4][2]) {
        row.push(data[i][4][2] / 100);
      } else if (data[i][4][3]) {
        row.push(data[i][4][3]);
      }
    } else if (data[i][3]) {
      row.push(data[i][3]);
    }

    values.push(row);
  }

  const BODY = {
    values,
  };

  // writing the columns' headings
  return gapi.client.sheets.spreadsheets.values
    .update({
      spreadsheetId: spreadsheetId,
      range: `${sheet.title}!A1:B1`,
      valueInputOption: VALUE_INPUT_OPTION,
      resource: { values: [["spend", "rev"]] },
    })
    .then(function () {
      // writing the values
      return gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: RANGE,
        valueInputOption: VALUE_INPUT_OPTION,
        resource: BODY,
      });
    });
}

function drawChart(data, spreadsheetId, sheet) {
  const RESOURCE = {
    requests: [
      {
        addChart: {
          chart: {
            spec: {
              title: "rev vs spend",
              basicChart: {
                chartType: "LINE",
                legendPosition: "NO_LEGEND",
                axis: [
                  {
                    position: "BOTTOM_AXIS",
                    title: "spend",
                  },
                  {
                    position: "LEFT_AXIS",
                    title: "rev",
                  },
                ],
                domains: [
                  {
                    domain: {
                      sourceRange: {
                        sources: [
                          {
                            sheetId: sheet.sheetId,
                            startRowIndex: 1,
                            endRowIndex: data.length,
                            startColumnIndex: 0,
                            endColumnIndex: 1,
                          },
                        ],
                      },
                    },
                  },
                ],
                series: [
                  {
                    series: {
                      sourceRange: {
                        sources: [
                          {
                            sheetId: sheet.sheetId,
                            startRowIndex: 1,
                            endRowIndex: data.length,
                            startColumnIndex: 1,
                            endColumnIndex: 2,
                          },
                        ],
                      },
                    },
                    targetAxis: "LEFT_AXIS",
                  },
                ],
                headerCount: 2,
              },
            },
            position: {
              overlayPosition: {
                anchorCell: {
                  sheetId: sheet.sheetId,
                  rowIndex: 1,
                  columnIndex: 3,
                },
              },
            },
          },
        },
      },
    ],
  };

  gapi.client.sheets.spreadsheets
    .batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: RESOURCE,
    })
    .then(function () {});
}

function formatJSON(data) {
  const SPREADSHEET_ID = "1KZJiwBaSZ-jIASS0j7b62NkanW1WWdP7OHjdu_qbJjk";

  getSpreadsheet(SPREADSHEET_ID).then(function (spreadsheet) {
    addSheet(spreadsheet).then(function (addSheetResponse) {
      writeFormattedData(
        data,
        SPREADSHEET_ID,
        addSheetResponse.result.replies[0].addSheet.properties
      );
    });
  });
}

function writeFormattedData(data, spreadsheetId, sheet) {
  const result = getPath(data, "", []);
  const formattedArray = [];
  const values = [];

  for (const el of result) {
    const elSplit = el.split("/");

    formattedArray.push({
      key: elSplit.slice(0, elSplit.length - 1).join("/"),
      value: elSplit.pop(),
    });
  }

  for (let i = 1; i < formattedArray.length; i++) {
    const row = [];
    row.push(formattedArray[i].key);
    row.push(formattedArray[i].value);
    values.push(row);
  }

  const BODY = {
    values,
  };

  const RANGE = `${sheet.title}!A2:B${formattedArray.length}`;
  const VALUE_INPUT_OPTION = "RAW";

  // writing the columns' headings
  return gapi.client.sheets.spreadsheets.values
    .update({
      spreadsheetId: spreadsheetId,
      range: `${sheet.title}!A1:B1`,
      valueInputOption: VALUE_INPUT_OPTION,
      resource: { values: [["key", "value"]] },
    })
    .then(function () {
      // writing the values
      return gapi.client.sheets.spreadsheets.values
        .update({
          spreadsheetId: spreadsheetId,
          range: RANGE,
          valueInputOption: VALUE_INPUT_OPTION,
          resource: BODY,
        })
        .then(function () {
          const RESOURCE = {
            requests: [
              {
                autoResizeDimensions: {
                  dimensions: {
                    sheetId: sheet.sheetId,
                    dimension: "COLUMNS",
                    startIndex: 0,
                    endIndex: 2,
                  },
                },
              },
            ],
          };

          // applying auto columns' width
          return gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: RESOURCE,
          });
        });
    });
}

function getPath(object, path, resultObj) {
  path = path || [];

  Object.keys(object).forEach(function (key) {
    if (object[key] && typeof object[key] === "object") {
      return getPath(object[key], path.concat(key), resultObj);
    }

    const obj = path.concat([key, object[key]]).join("/");
    resultObj.push(obj);
  });

  return resultObj;
}

// when the gapi script is loaded, authorize the user
window.addEventListener("load", onLoad);

// handling the input JSON
chrome.runtime.onMessage.addListener(function (
  request,
  _sender,
  _sendResponse
) {
  if (request.message === "TRANSFORM_JSON") {
    transformJSON(request.data);
  } else if (request.message === "FORMAT_JSON") {
    formatJSON(request.data);
  }
});

let interceptedJSON;

// handling the JSON from response
chrome.runtime.onMessageExternal.addListener(function (
  request,
  _sender,
  _sendResponse
) {
  if (request.message === "INTERCEPT_JSON") {
    interceptedJSON = request.data;
  }
});

// handling the JSON intercepted from response
chrome.runtime.onMessage.addListener(function (
  request,
  _sender,
  _sendResponse
) {
  if (request.message === "TRANSFORM_CHART") {
    transformJSON(interceptedJSON);
  }
});
