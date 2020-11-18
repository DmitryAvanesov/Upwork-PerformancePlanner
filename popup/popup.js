const transformButton = document.querySelector(".transform-button");
const textarea = document.querySelector(".textarea");
const transformChartButton = document.querySelector(".transform-chart-button");

transformChartButton.addEventListener("click", function () {
  chrome.runtime.sendMessage({ message: "TRANSFORM_INTERCEPTED_JSON" });
});

transformButton.addEventListener("click", function () {
  chrome.runtime.sendMessage({
    message: "TRANSFORM_JSON",
    data: JSON.parse(textarea.value),
  });
});
