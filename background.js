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
  const SPREADSHEET_ID = "1gv49jkuEzNqeUCoIpaC_Xhi47l4VVpsd8OLSJQYgCUg";
  const RANGE = "Sheet1";
  const VALUE_INPUT_OPTION = "RAW";

  const values = [];

  for (let i = 1; i < data.length; i++) {
    const row = [];
    row.push(data[i][1][3]);

    if (data[i][4][1]) {
      row.push(Math.round(data[i][4][1] / 1000000));
    } else if (data[i][4][2]) {
      row.push(Math.round(data[i][4][2] / 100));
    } else if (data[i][4][3]) {
      row.push(Math.round(data[i][4][3]));
    } else {
      console.log("Something's wrong. I can feel it...");
    }

    values.push(row);
  }

  const BODY = {
    values,
  };

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
}

window.addEventListener("load", onLoad);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  transformJSON(request.data);
});
