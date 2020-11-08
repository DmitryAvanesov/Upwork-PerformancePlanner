const analyzeButton = document.querySelector(".analyze-button");
const formatButton = document.querySelector(".format-button");

analyzeButton.onclick = function () {
  const jsonTextarea = document.querySelector(".json-textarea");
  const json = JSON.parse(jsonTextarea.value);
  const targetData = json[2][6][0][2][1];
  chrome.runtime.sendMessage({ message: "TRANSFORM_JSON", data: targetData });
};

formatButton.addEventListener("click", function () {
  const jsonTextarea = document.querySelector(".json-textarea");
  const json = JSON.parse(jsonTextarea.value);
  chrome.runtime.sendMessage({ message: "FORMAT_JSON", data: json });
})
};
