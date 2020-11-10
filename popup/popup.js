const transformButton = document.querySelector(".transform-button");
const formatButton = document.querySelector(".format-button");
const transformChartButton = document.querySelector(".transform-chart-button");

transformButton.addEventListener("click", function () {
  const jsonTextarea = document.querySelector(".json-textarea");
  const json = JSON.parse(jsonTextarea.value);
  chrome.runtime.sendMessage({ message: "TRANSFORM_JSON", data: json });
});

formatButton.addEventListener("click", function () {
  const jsonTextarea = document.querySelector(".json-textarea");
  const json = JSON.parse(jsonTextarea.value);
  chrome.runtime.sendMessage({ message: "FORMAT_JSON", data: json });
});
