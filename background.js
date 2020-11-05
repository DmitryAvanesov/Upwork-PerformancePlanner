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
  console.log(data);
  const SPREADSHEET_ID = "1KZJiwBaSZ-jIASS0j7b62NkanW1WWdP7OHjdu_qbJjk";
  const VALUE_INPUT_OPTION = "RAW";

  // accessing the list of sheets
  gapi.client.sheets.spreadsheets
    .get({ spreadsheetId: SPREADSHEET_ID })
    .then(function (response) {
      const { sheets } = response.result;
      console.log(sheets);

      // calculating the next sheet ID
      const nextSheetId =
        sheets.reduce(
          (previousValue, currentValue) =>
            parseInt(currentValue.properties.title) > previousValue
              ? parseInt(currentValue.properties.title)
              : previousValue,
          0
        ) + 1;

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
        .then(function () {
          const RANGE = `${nextSheetId}!A2:B${data.length}`;
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
              resource: { values: [["spend", "rev"]] },
            })
            .then((response) => {
              const result = response.result;
              console.log(`${result.updatedCells} cells updated.`);
            });
        });
    });
}

window.addEventListener("load", onLoad);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  transformJSON(request.data);
});
