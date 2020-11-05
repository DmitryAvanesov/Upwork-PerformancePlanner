const analyzeButton = document.querySelector(".analyze-button");

analyzeButton.onclick = function () {
  const jsonTextarea = document.querySelector(".json-textarea");
  const json = JSON.parse(jsonTextarea.value);
  const targetData = json[2][6][0][2][1];

  chrome.runtime.sendMessage({ data: targetData });
};
