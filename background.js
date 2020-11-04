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

const onLoad = () => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    console.log(token);

    const API_KEY = "AIzaSyB3izcQikDMTg1E4hlMeZx3u0Dy4TMYQdM";
    const CLIENT_ID =
      "830407752509-qtgnjs8tde5o0nr1bjh19bvtpv2hn3g1.apps.googleusercontent.com";
    const DISCOVERY_DOCS = [
      "https://sheets.googleapis.com/$discovery/rest?version=v4",
    ];
    const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

    gapi.load("client:auth2", initClient);

    function initClient() {
      gapi.client
        .init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        })
        .then(function () {
          console.log("SUCCESS");

          gapi.auth.setToken({
            access_token: token,
          });

          gapi.client.sheets.spreadsheets
            .create({
              properties: {
                title: "Generated Sheet",
              },
            })
            .then((response) => {
              console.log(response);
            });
        });
    }
  });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  onLoad();
});
