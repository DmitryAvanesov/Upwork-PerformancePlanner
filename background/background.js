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

// when the gapi script is loaded, authorize the user
window.addEventListener("load", onLoad);

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

// handling the input JSON
let interceptedJSON;

// controller
chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  if (request.message === "TRANSFORM_JSON") {
    transformJSON(request.json, request.parameters);
    return true;
  } else if (request.message === "TRANSFORM_INTERCEPTED_JSON") {
    if (interceptedJSON) {
      transformJSON(interceptedJSON, request.parameters);
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

function transformJSON(json, parameters) {
  createSrpeadsheet().then(function (spreadsheet) {
    const spreadsheetId = spreadsheet.result.spreadsheetId;
    const speadsheetUrl = spreadsheet.result.spreadsheetUrl;
    setPlanSheetTitle(spreadsheetId, parameters).then(function (res) {
      getSpreadsheet(spreadsheetId).then(function (newSpreadsheet) {
        const planSheet = newSpreadsheet.result.sheets[0].properties;
        writeHeadings(spreadsheetId, planSheet, parameters).then(function () {
          writeTransformedData(json, spreadsheetId, planSheet, parameters).then(
            function () {
              addControls(spreadsheetId, planSheet, parameters).then(
                function () {
                  addJSONDataSheet(spreadsheet).then(function (res) {
                    const jsonDataSheet =
                      res.result.replies[0].addSheet.properties;
                    writeFormattedData(json, spreadsheetId, jsonDataSheet).then(
                      function () {
                        applyNumberFormat(
                          json,
                          spreadsheetId,
                          planSheet,
                          parameters
                        ).then(function () {
                          makeHeadersBold(
                            spreadsheetId,
                            planSheet,
                            parameters
                          ).then(function () {
                            setBackgroundColor(
                              json,
                              spreadsheetId,
                              planSheet,
                              parameters
                            ).then(function () {
                              autoResizeColumnsWidth(
                                spreadsheetId,
                                planSheet,
                                parameters
                              ).then(function () {
                                autoResizeColumnsWidth(
                                  spreadsheetId,
                                  jsonDataSheet,
                                  parameters
                                ).then(function () {
                                  hideColumns(
                                    spreadsheetId,
                                    planSheet,
                                    parameters
                                  ).then(function () {
                                    openNewWindow(speadsheetUrl);
                                  });
                                });
                              });
                            });
                          });
                        });
                      }
                    );
                  });
                }
              );
            }
          );
        });
      });
    });
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
