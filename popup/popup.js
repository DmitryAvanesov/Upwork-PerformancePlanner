const transformButton = document.querySelector(".transform-button");
const formatButton = document.querySelector(".format-button");
const transformChartButton = document.querySelector(".transform-chart-button");
const urlBlock = document.querySelector(".url-block");

transformChartButton.addEventListener("click", function () {
  chrome.runtime.sendMessage(
    { message: "TRANSFORM_INTERCEPTED_JSON" }
  );
});
