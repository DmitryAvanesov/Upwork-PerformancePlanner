// const transformButton = document.querySelector(".transform-button");
// const textarea = document.querySelector(".textarea");
// const transformChartButton = document.querySelector(".transform-chart-button");

// transformChartButton.addEventListener("click", function () {
//   chrome.runtime.sendMessage({ message: "TRANSFORM_INTERCEPTED_JSON" });
// });

// transformButton.addEventListener("click", function () {
//   chrome.runtime.sendMessage({
//     message: "TRANSFORM_JSON",
//     data: JSON.parse(textarea.value),
//   });
// });

mdc.textField.MDCTextField.attachTo(document.querySelector(".plan-name"));
mdc.select.MDCSelect.attachTo(document.querySelector(".main-metric"));
mdc.select.MDCSelect.attachTo(document.querySelector(".date-range"));
mdc.ripple.MDCRipple.attachTo(document.querySelector(".build-plan"));
