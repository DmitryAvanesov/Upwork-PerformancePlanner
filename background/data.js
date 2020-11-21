function writeHeadings(spreadsheetId, sheet, parameters) {
  const VALUE_INPUT_OPTION = "USER_ENTERED";
  let differingHeadings;

  if (parameters.mainMetric === "conversions") {
    differingHeadings = [
      "CPA ave",
      "incr conv",
      "incr cost",
      "incr CPA",
      "PperSale",
      "incr profit",
    ];
  } else if (parameters.mainMetric === "conversion value") {
    differingHeadings = [
      "ROAS",
      '="Approx Sales (AOV="&N2&")"',
      "CPA",
      "incr cost",
      "incr rev",
      "incr sales",
      "incr CPA",
      "incr ROAS",
      "incr profit",
    ];
  }

  return gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: `${sheet.title}!A1:${
      parameters.mainMetric === "conversions" ? "I" : "L"
    }1`,
    valueInputOption: VALUE_INPUT_OPTION,
    resource: {
      values: [["cost", parameters.mainMetric, ...differingHeadings, "profit"]],
    },
  });
}

function writeTransformedData(json, spreadsheetId, sheet, parameters) {
  const targetData = json[2][6][0][2][1];
  const values = [];

  const RANGE = `${sheet.title}!A2:${
    parameters.mainMetric === "conversions" ? "I" : "L"
  }${targetData.length}`;
  const VALUE_INPUT_OPTION = "USER_ENTERED";

  for (let i = 1; i < targetData.length; i++) {
    const row = [];

    // cost

    row.push(targetData[i][1][3]);

    // revenue

    if (targetData[i][4]) {
      if (targetData[i][4][1]) {
        row.push(targetData[i][4][1] / 1000000);
      } else if (targetData[i][4][2]) {
        row.push(targetData[i][4][2] / 100);
      } else if (targetData[i][4][3]) {
        row.push(targetData[i][4][3]);
      }
    } else if (targetData[i][3]) {
      row.push(targetData[i][3]);
    }

    if (parameters.mainMetric === "conversions") {
      // CPA ave

      row.push(`=A${i + 1}/B${i + 1}`);

      // incr conv

      row.push(`=B${i + 1}-${i === 1 ? 0 : `B${i}`}`);

      // incr cost

      row.push(`=A${i + 1}-${i === 1 ? 0 : `A${i}`}`);

      // incr CPA

      row.push(`=E${i + 1}/D${i + 1}`);

      // PperSale

      row.push(`=$K$1-F${i + 1}`);

      // incr profit

      row.push(`=G${i + 1}*D${i + 1}`);
    } else if (parameters.mainMetric === "conversion value") {
      // ROAS

      row.push(`=B${i + 1}/A${i + 1}`);

      // Approx Sales

      row.push(`=B${i + 1}/$N$2`);

      // CPA

      row.push(`=A${i + 1}/D${i + 1}`);

      // incr cost

      row.push(`=A${i + 1}-${i === 1 ? 0 : `A${i}`}`);

      // incr rev

      row.push(`=B${i + 1}-${i == 1 ? 0 : `B${i}`}`);

      // incr sales

      row.push(`=D${i + 1}-${i == 1 ? 0 : `D${i}`}`);

      // incr CPA

      row.push(`=F${i + 1}/H${i + 1}`);

      // incr ROAS

      row.push(`=G${i + 1}/F${i + 1}`);

      // incr profit

      row.push(`=L${i + 1}-${i == 1 ? 0 : `L${i}`}`);
    }

    row.push(
      parameters.mainMetric === "conversions"
        ? `=H${i + 1}+${i == 1 ? 0 : `I${i}`}`
        : `=B${i + 1}-$N$4*A${i + 1}`
    );

    values.push(row);
  }

  const BODY = {
    values,
  };

  return gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: RANGE,
    valueInputOption: VALUE_INPUT_OPTION,
    resource: BODY,
  });
}

function writeRawData(data, spreadsheetId, sheet) {
  const RANGE = `${sheet.title}!A1:A1`;
  const VALUE_INPUT_OPTION = "USER_ENTERED";
  const values = [[JSON.stringify(data)]];
  const BODY = { values };

  return gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: RANGE,
    valueInputOption: VALUE_INPUT_OPTION,
    resource: BODY,
  });
}

function writeFormattedData(json, spreadsheetId, sheet) {
  function getPath(object, path, resultObj) {
    path = path || [];

    Object.keys(object).forEach(function (key) {
      if (object[key] && typeof object[key] === "object") {
        return getPath(object[key], path.concat(key), resultObj);
      }

      const obj = path.concat([key, object[key]]).join("/");
      resultObj.push(obj);
    });

    return resultObj;
  }

  const result = getPath(json, "", []);
  const formattedArray = [];
  const values = [];

  for (const el of result) {
    const elSplit = el.split("/");

    formattedArray.push({
      key: elSplit.slice(0, elSplit.length - 1).join("/"),
      value: elSplit.pop(),
    });
  }

  for (let i = 1; i < formattedArray.length; i++) {
    const row = [];
    row.push(formattedArray[i].key);
    row.push(formattedArray[i].value);
    values.push(row);
  }

  const BODY = {
    values,
  };

  const RANGE = `${sheet.title}!A2:B${formattedArray.length}`;
  const VALUE_INPUT_OPTION = "RAW";

  return gapi.client.sheets.spreadsheets.values
    .update({
      spreadsheetId: spreadsheetId,
      range: `${sheet.title}!A1:B1`,
      valueInputOption: VALUE_INPUT_OPTION,
      resource: { values: [["key", "value"]] },
    })
    .then(function () {
      return gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: RANGE,
        valueInputOption: VALUE_INPUT_OPTION,
        resource: BODY,
      });
    });
}

function addControls(spreadsheetId, sheet, parameters) {
  const VALUE_INPUT_OPTION = "USER_ENTERED";

  if (parameters.mainMetric === "conversions") {
    return gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: `${sheet.title}!J1:K1`,
      valueInputOption: VALUE_INPUT_OPTION,
      resource: { values: [["BE CPA", 70]] },
    });
  }

  if (parameters.mainMetric === "conversion value") {
    return gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: `${sheet.title}!M1:N4`,
      valueInputOption: VALUE_INPUT_OPTION,
      resource: {
        values: [
          ["%PM", "10%"],
          ["AOV", 100],
          ["", ""],
          ["BE", "=1/N1"],
        ],
      },
    });
  }
}

function autoResizeColumnsWidth(spreadsheetId, sheet, parameters) {
  const RESOURCE = {
    requests: [
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheet.sheetId,
            dimension: "COLUMNS",
            startIndex: 0,
            endIndex:
              sheet.title === "Sheet2"
                ? 2
                : parameters.mainMetric === "conversions"
                ? 11
                : 14,
          },
        },
      },
    ],
  };

  return gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: RESOURCE,
  });
}

function applyNumberFormat(json, spreadsheetId, sheet, parameters) {
  const targetData = json[2][6][0][2][1];

  const RESOURCE = {
    requests: [
      {
        repeatCell: {
          range: {
            sheetId: sheet.sheetId,
            startRowIndex: 1,
            endRowIndex: targetData.length,
            startColumnIndex: 1,
            endColumnIndex: parameters.mainMetric === "conversions" ? 9 : 12,
          },
          cell: {
            userEnteredFormat: {
              numberFormat: {
                type: "NUMBER",
                pattern: "#,##0.00",
              },
            },
          },
          fields: "userEnteredFormat.numberFormat",
        },
      },
    ],
  };

  return gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: RESOURCE,
  });
}

function hideColumns(spreadsheetId, sheet, parameters) {
  const RESOURCE = {
    requests: [
      {
        updateDimensionProperties: {
          range: {
            sheetId: sheet.sheetId,
            dimension: "COLUMNS",
            startIndex: 2,
            endIndex: parameters.mainMetric === "conversions" ? 8 : 11,
          },
          properties: {
            hiddenByUser: "TRUE",
          },
          fields: "hiddenByUser",
        },
      },
    ],
  };

  return gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: RESOURCE,
  });
}

function makeHeadersBold(spreadsheetId, sheet, parameters) {
  const RESOURCE = {
    requests: [
      {
        repeatCell: {
          range: {
            sheetId: sheet.sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: parameters.mainMetric === "conversions" ? 9 : 12,
          },
          cell: {
            userEnteredFormat: {
              textFormat: {
                bold: true,
              },
            },
          },
          fields: "userEnteredFormat.textFormat",
        },
      },
    ],
  };

  return gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: RESOURCE,
  });
}

function setBackgroundColor(json, spreadsheetId, sheet, parameters) {
  const targetData = json[2][6][0][2][1];

  const RESOURCE = {
    requests: [
      {
        repeatCell: {
          range: {
            sheetId: sheet.sheetId,
            startRowIndex: 0,
            endRowIndex: targetData.length,
            startColumnIndex: 0,
            endColumnIndex: 2,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 1.0,
                green: 0.95,
                blue: 0.8,
              },
            },
          },
          fields: "userEnteredFormat.backgroundColor",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: sheet.sheetId,
            startRowIndex: 0,
            endRowIndex: targetData.length,
            startColumnIndex: parameters.mainMetric === "conversions" ? 8 : 11,
            endColumnIndex: parameters.mainMetric === "conversions" ? 9 : 12,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 0.85,
                green: 0.92,
                blue: 0.83,
              },
            },
          },
          fields: "userEnteredFormat.backgroundColor",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: sheet.sheetId,
            startRowIndex: 0,
            endRowIndex: parameters.mainMetric === "conversions" ? 1 : 4,
            startColumnIndex: parameters.mainMetric === "conversions" ? 9 : 12,
            endColumnIndex: parameters.mainMetric === "conversions" ? 11 : 14,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 0.94,
                green: 0.94,
                blue: 0.94,
              },
            },
          },
          fields: "userEnteredFormat.backgroundColor",
        },
      },
    ],
  };

  return gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId,
    resource: RESOURCE,
  });
}
