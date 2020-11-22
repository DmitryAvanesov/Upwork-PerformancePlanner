// const textarea = document.querySelector(".textarea");

const MDCTextField = mdc.textField.MDCTextField;
const MDCSelect = mdc.select.MDCSelect;

const planNameTextField = new MDCTextField(
  document.querySelector(".plan-name")
);
const mainMetricSelect = new MDCSelect(document.querySelector(".main-metric"));
const dateRangeSelect = new MDCSelect(document.querySelector(".date-range"));
const buildPlanButton = document.querySelector(".build-plan");

buildPlanButton.addEventListener("click", function () {
  if (planNameTextField.value) {
    chrome.runtime.sendMessage({
      message: "TRANSFORM_INTERCEPTED_JSON",
      parameters: {
        planName: planNameTextField.value,
        mainMetric: mainMetricSelect.value,
        dateRange: dateRangeSelect.value,
      },
    });
  } else {
    planNameTextField.valid = false;
  }
});
