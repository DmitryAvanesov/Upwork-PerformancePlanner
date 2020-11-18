// when the gapi script is loaded, authorize the user
window.addEventListener("load", onLoad);

// handling the input JSON
let interceptedJSON;

// controller
chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  if (request.message === "TRANSFORM_JSON") {
    transformJSON(request.data);
    return true;
  } else if (request.message === "FORMAT_JSON") {
    formatJSON(request.data, sendResponse);
    return true;
  } else if (request.message === "TRANSFORM_INTERCEPTED_JSON") {
    if (interceptedJSON) {
      transformJSON(interceptedJSON);
    } else {
      alert("There's no data to send");
    }
    return true;
  }
});

// controller for request intercepting
chrome.runtime.onMessageExternal.addListener(function (
  request,
  _sender,
  _sendResponse
) {
  if (request.message === "INTERCEPT_JSON") {
    interceptedJSON = request.data;
  }
});

chrome.runtime.onInstalled.addListener(function () {
  // interacting with the popup
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostContains: "" },
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
  createSrpeadsheet().then(function (spreadsheet) {
    const speadsheetId = spreadsheet.result.spreadsheetId;
    const speadsheetUrl = spreadsheet.result.spreadsheetUrl;
    const firstSheet = spreadsheet.result.sheets[0].properties;

    writeTransformedData(data, speadsheetId).then(function () {
      drawChart(data, speadsheetId, firstSheet).then(function () {
        addSheet2(spreadsheet).then(function (res) {
          const secondSheet = res.result.replies[0].addSheet.properties;
          writeFormattedData(data, speadsheetId, secondSheet).then(function () {
            openNewWindow(speadsheetUrl);
          });
        });
      });
    });
  });
}

function openNewWindow(url) {
  chrome.windows.create({ url: url });
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

function writeTransformedData(data, spreadsheetId) {
  const targetData = data[2][6][0][2][1];
  const values = [];

  const RANGE = `A2:B${targetData.length}`;
  const VALUE_INPUT_OPTION = "USER_ENTERED";

  for (let i = 1; i < targetData.length; i++) {
    const row = [];
    row.push(targetData[i][1][3]);

    if (targetData[i][4]) {
      if (targetData[i][4][1]) {
        row.push(targetData[i][4][1] / 1000000);
      } else if (targetData[i][4][2]) {
        row.push(targetData[i][4][2] / 100);
      } else if (targetData[i][4][3]) {
        row.push(targetData[i][4][3]);
      }
    } else if (targetData[i][3]) {
      row.push(targetData[i][3]);
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
      range: "A1:B1",
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

function writeRawData(data, spreadsheetId) {
  const RANGE = "Sheet2!A1:A1";
  const VALUE_INPUT_OPTION = "USER_ENTERED";
  const values = [[JSON.stringify(data)]];
  const BODY = { values };

  return gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: RANGE,
    valueInputOption: VALUE_INPUT_OPTION,
    resource: BODY,
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

  return gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: RESOURCE,
  });
}

function formatJSON(data, sendResponse) {
  createSrpeadsheet().then(function (spreadsheet) {
    const speadsheetId = spreadsheet.result.spreadsheetId;
    const speadsheetUrl = spreadsheet.result.spreadsheetUrl;
    const sheet = spreadsheet.result.sheets[0].properties;

    writeFormattedData(data, speadsheetId, sheet).then(function () {
      sendResponse({ message: speadsheetUrl });
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

  const RANGE = `Sheet2!A2:B${formattedArray.length}`;
  const VALUE_INPUT_OPTION = "RAW";

  // writing the columns' headings
  return gapi.client.sheets.spreadsheets.values
    .update({
      spreadsheetId: spreadsheetId,
      range: "Sheet2!A1:B1",
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
