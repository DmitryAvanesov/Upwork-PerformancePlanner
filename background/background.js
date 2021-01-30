chrome.runtime.onInstalled.addListener(function () {
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

let interceptedJSON;

// controller
chrome.runtime.onMessage.addListener(function (request, _sender, sendResponse) {
  if (request.message === "TRANSFORM_JSON") {
    transformJSON(request.json, request.parameters, sendResponse);
    return true;
  } else if (request.message === "TRANSFORM_INTERCEPTED_JSON") {
    if (interceptedJSON) {
      transformJSON(interceptedJSON, request.parameters, sendResponse);
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

function transformJSON(json, parameters, sendResponse) {
  sendResponse({ message: "loading" });

  createSpreadsheet(parameters.planName).then(function (spreadsheet) {
    const spreadsheetId = spreadsheet.result.spreadsheetId;
    const spreadsheetUrl = spreadsheet.result.spreadsheetUrl;

    setPlanSheetTitle(spreadsheetId, parameters).then(function () {
      Promise.all([
        getSpreadsheet(spreadsheetId),
        addJSONDataSheet(spreadsheet),
      ]).then(function (values) {
        const planSheet = values[0].result.sheets[0].properties;
        const jsonDataSheet = values[1].result.replies[0].addSheet.properties;

        Promise.all([
          Promise.all([
            writeHeadings(spreadsheetId, planSheet, parameters),
            writeTransformedData(json, spreadsheetId, planSheet, parameters),
            addControls(spreadsheetId, planSheet, parameters),
            drawCharts(json, spreadsheetId, planSheet, parameters),
            applyNumberFormat(json, spreadsheetId, planSheet, parameters),
            makeHeadersBold(spreadsheetId, planSheet, parameters),
            setBackgroundColor(json, spreadsheetId, planSheet, parameters),
            hideColumns(spreadsheetId, planSheet, parameters),
          ]),
          writeFormattedData(json, spreadsheetId, jsonDataSheet),
        ]).then(function () {
          Promise.all([
            autoResizeColumnsWidth(spreadsheetId, planSheet, parameters),
            autoResizeColumnsWidth(spreadsheetId, jsonDataSheet, parameters),
          ]).then(function () {
            openNewWindow(spreadsheetUrl);
            sendResponse({ message: "finished" });
          });
        });
      });
    });
  });
}

// function formatJSON(data, sendResponse) {
//   createSrpeadsheet().then(function (spreadsheet) {
//     const speadsheetId = spreadsheet.result.spreadsheetId;
//     const speadsheetUrl = spreadsheet.result.spreadsheetUrl;
//     const sheet = spreadsheet.result.sheets[0].properties;
//
//     writeFormattedData(data, speadsheetId, sheet).then(function () {
//       sendResponse({ message: speadsheetUrl });
//     });
//   });
// }
