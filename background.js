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

function handleJSON(data) {
  const SPREADSHEET_ID = "1KZJiwBaSZ-jIASS0j7b62NkanW1WWdP7OHjdu_qbJjk";

  // accessing the list of sheets
  gapi.client.sheets.spreadsheets
    .get({ spreadsheetId: SPREADSHEET_ID })
    .then(function (response) {
      addSheet(response, data, SPREADSHEET_ID);
    });
}

function addSheet(spreadsheet, data, spreadsheetId) {
  const { sheets } = spreadsheet.result;

  // calculating the next sheet ID
  const nextSheetNumber =
    sheets.reduce((previousValue, currentValue) => {
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

  // adding the next sheet
  gapi.client.sheets.spreadsheets
    .batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: RESOURCE,
    })
    .then(function (response) {
      console.log(response);
      writeData(
        data,
        spreadsheetId,
        response.result.replies[0].addSheet.properties
      );
    });
}

function writeData(data, spreadsheetId, sheet) {
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
    } else if (data[i][6]) {
      if (data[i][6][1]) {
        row.push(data[i][6][1] / 100);
      }
    }

    values.push(row);
  }

  const BODY = {
    values,
  };

  // writing the data into the new sheet
  gapi.client.sheets.spreadsheets.values
    .update({
      spreadsheetId: spreadsheetId,
      range: RANGE,
      valueInputOption: VALUE_INPUT_OPTION,
      resource: BODY,
    })
    .then(function () {});

  // adding columns' headings
  gapi.client.sheets.spreadsheets.values
    .update({
      spreadsheetId: spreadsheetId,
      range: `${sheet.title}!A1:B1`,
      valueInputOption: VALUE_INPUT_OPTION,
      resource: { values: [["spend", "rev"]] },
    })
    .then(function () {
      drawChart(data, spreadsheetId, sheet);
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
  const VALUE_INPUT_OPTION = "RAW";

  const result = getPath(data, "", []);
  const formattedArray = [];

  for (const el of result) {
    const elSplit = el.split("/");

    formattedArray.push({
      key: elSplit.slice(0, elSplit.length - 1).join("/"),
      value: elSplit.pop(),
    });
  }

  // accessing the list of sheets
  gapi.client.sheets.spreadsheets
    .get({ spreadsheetId: SPREADSHEET_ID })
    .then(function (response) {
      const { sheets } = response.result;

      // calculating the next sheet ID
      const nextSheetId =
        sheets.reduce((previousValue, currentValue) => {
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
                title: nextSheetId.toString(),
              },
            },
          },
        ],
      };

      // adding the next sheet
      gapi.client.sheets.spreadsheets
        .batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          resource: RESOURCE,
        })
        .then(function (response) {
          const RANGE = `${nextSheetId}!A2:B${formattedArray.length}`;
          const sheet = response.result.replies[0].addSheet.properties;
          const values = [];

          for (let i = 1; i < formattedArray.length; i++) {
            const row = [];
            row.push(formattedArray[i].key);
            row.push(formattedArray[i].value);
            values.push(row);
          }

          const BODY = {
            values,
          };

          // writing the data into the new sheet
          gapi.client.sheets.spreadsheets.values
            .update({
              spreadsheetId: SPREADSHEET_ID,
              range: RANGE,
              valueInputOption: VALUE_INPUT_OPTION,
              resource: BODY,
            })
            .then((response) => {
              const result = response.result;
              console.log(`${result.updatedCells} cells updated.`);
            });

          // adding columns' headings
          gapi.client.sheets.spreadsheets.values
            .update({
              spreadsheetId: SPREADSHEET_ID,
              range: `${nextSheetId}!A1:B1`,
              valueInputOption: VALUE_INPUT_OPTION,
              resource: { values: [["key", "value"]] },
            })
            .then(() => {
              // auto resize dimensions

              const RESOURCE_AUTO_RESIZE_DIMENSIONS = {
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

              gapi.client.sheets.spreadsheets
                .batchUpdate({
                  spreadsheetId: SPREADSHEET_ID,
                  resource: RESOURCE_AUTO_RESIZE_DIMENSIONS,
                })
                .then(function () {});
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
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "TRANSFORM_JSON") {
    transformJSON(request.data);
  } else if (request.message === "FORMAT_JSON") {
    formatJSON(request.data);
  }
});
