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
  });
};

const SPREADSHEET_ID = "1gv49jkuEzNqeUCoIpaC_Xhi47l4VVpsd8OLSJQYgCUg";
const CLIENT_ID =
  "830407752509-sbc0rui44t3nmrahtna6etvm1bjq4d81.apps.googleusercontent.com";
const API_KEY = "AIzaSyB3izcQikDMTg1E4hlMeZx3u0Dy4TMYQdM";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

const initClient = () => {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      scope: SCOPE,
      discoveryDocs: [
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
      ],
    })
    .then(() => {
      console.log("SUCCESS");
      updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    })
    .catch((err) => {
      console.log("ERROR");
    });
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  onLoad();
});
