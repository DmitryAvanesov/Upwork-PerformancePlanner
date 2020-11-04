const analyzeButton = document.querySelector(".analyze-button");

analyzeButton.onclick = function () {
  const jsonTextarea = document.querySelector(".json-textarea");
  const json = JSON.parse(jsonTextarea.value);
  const targetData = json["2"]["6"]["0"]["2"]["1"];

  // alert(json["2"]["6"]["0"]["2"]["1"]["2"]["1"]["3"]);

  console.log(targetData);

  for (let i = 0; i < targetData.length; i++) {
    console.log(`${targetData[i]["1"]["3"]} - ${targetData[i]["4"]["1"]}`);
  }
};
