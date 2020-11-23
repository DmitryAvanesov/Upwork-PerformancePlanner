// const textarea = document.querySelector(".textarea");

const MDCTextField = mdc.textField.MDCTextField;
const MDCSelect = mdc.select.MDCSelect;

const planNameTextField = new MDCTextField(
  document.querySelector(".plan-name")
);
const mainMetricSelect = new MDCSelect(document.querySelector(".main-metric"));
const dateRangeSelect = new MDCSelect(document.querySelector(".date-range"));
const buildPlanButton = document.querySelector(".build-plan");
const progressImg = document.querySelector(".progress");

// buildPlanButton.addEventListener("click", function () {
//   if (planNameTextField.value) {
//     chrome.runtime.sendMessage(
//       {
//         message: "TRANSFORM_JSON",
//         json: JSON.parse(textarea.value),
//         parameters: {
//           planName: planNameTextField.value,
//           mainMetric: mainMetricSelect.value,
//           dateRange: dateRangeSelect.value,
//         },
//       },
//       function (response) {
//         if (response.message === "loading") {
//           progressImg.style.opacity = 0.5;
//           progressImg.style.zIndex = 0;
//         } else if (response.message === "finished") {
//           progressImg.style.opacity = 0;
//           progressImg.style.zIndex = -1;
//         }
//       }
//     );
//   } else {
//     planNameTextField.valid = false;
//   }
// });

buildPlanButton.addEventListener("click", function () {
  if (planNameTextField.value) {
    chrome.runtime.sendMessage(
      {
        message: "TRANSFORM_INTERCEPTED_JSON",
        parameters: {
          planName: planNameTextField.value,
          mainMetric: mainMetricSelect.value,
          dateRange: dateRangeSelect.value,
        },
      },
      function (response) {
        if (response.message === "loading") {
          progressImg.style.opacity = 0.5;
          progressImg.style.zIndex = 0;
        } else if (response.message === "finished") {
          progressImg.style.opacity = 0;
          progressImg.style.zIndex = -1;
        }
      }
    );
  } else {
    planNameTextField.valid = false;
  }
});
