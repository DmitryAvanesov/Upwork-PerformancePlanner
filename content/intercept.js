(function (_xhr) {
  const XHR = XMLHttpRequest.prototype;

  const open = XHR.open;
  const send = XHR.send;
  const setRequestHeader = XHR.setRequestHeader;

  XHR.open = function (method, url) {
    this._url = url;
    this._requestHeaders = {};
    return open.apply(this, arguments);
  };

  XHR.setRequestHeader = function (header, value) {
    this._requestHeaders[header] = value;
    return setRequestHeader.apply(this, arguments);
  };

  XHR.send = function (postData) {
    this.addEventListener("load", function () {
      const myUrl = this._url ? this._url.toLowerCase() : this._url;

      if (myUrl) {
        if (postData) {
          if (typeof postData === "string") {
            try {
              this._requestHeaders = postData;
            } catch (err) {
              console.log(
                "Request Header JSON decode failed, transfer_encoding field could be base64"
              );
              console.log(err);
            }
          }
        }

        if (this.responseType !== "blob" && this.responseText) {
          try {
            const response = this.responseText;
            const extensionId = "loddmfmefacnijdkaphhijbjgapjndgk";

            if (
              this._url.startsWith(
                "https://ads.google.com/aw_budget_planner/_/rpc/BudgetPlannerService/GetForecasts"
              )
            ) {
              chrome.runtime.sendMessage(extensionId, {
                message: "INTERCEPT_JSON",
                data: JSON.parse(response),
              });
            }
          } catch (err) {
            console.log("Error in responseType try catch");
            console.log(err);
          }
        }
      }
    });

    return send.apply(this, arguments);
  };
})(XMLHttpRequest);
