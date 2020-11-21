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
    console.log(request.parameters);
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
    const speadsheetId = spreadsheet.result.spreadsheetId;
    const speadsheetUrl = spreadsheet.result.spreadsheetUrl;
    const firstSheet = spreadsheet.result.sheets[0].properties;

    writeTransformedData(json, speadsheetId, firstSheet, parameters).then(
      function () {
        drawChart(json, speadsheetId, firstSheet).then(function () {
          addSheet2(spreadsheet).then(function (res) {
            const secondSheet = res.result.replies[0].addSheet.properties;

            writeFormattedData(json, speadsheetId, secondSheet).then(
              function () {
                openNewWindow(speadsheetUrl);
              }
            );
          });
        });
      }
    );
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
