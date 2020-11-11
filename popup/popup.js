const transformButton = document.querySelector(".transform-button");
const formatButton = document.querySelector(".format-button");
const transformChartButton = document.querySelector(".transform-chart-button");
const urlBlock = document.querySelector(".url-block");

transformButton.addEventListener("click", function () {
  const jsonTextarea = document.querySelector(".json-textarea");
  const json = JSON.parse(jsonTextarea.value);
  chrome.runtime.sendMessage(
    { message: "TRANSFORM_JSON", data: json },
    function (response) {
      urlBlock.innerText = response.message;
    }
  );
});

formatButton.addEventListener("click", function () {
  const jsonTextarea = document.querySelector(".json-textarea");
  const json = JSON.parse(jsonTextarea.value);
  chrome.runtime.sendMessage({ message: "FORMAT_JSON", data: json }, function (
    response
  ) {
    urlBlock.innerHTML = response.message;
  });
});

transformChartButton.addEventListener("click", function () {
  chrome.runtime.sendMessage(
    { message: "TRANSFORM_INTERCEPTED_JSON" },
    function (response) {
      urlBlock.innerHTML = response.message;
    }
  );
});
