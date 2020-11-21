function writeTransformedData(data, spreadsheetId, sheet, parameters) {
  const targetData = data[2][6][0][2][1];
  const values = [];

  const RANGE = `${sheet.title}!A2:B${targetData.length}`;
  const VALUE_INPUT_OPTION = "USER_ENTERED";

  for (let i = 1; i < targetData.length; i++) {
    const row = [];
    row.push(targetData[i][1][3]);

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

    values.push(row);
  }

  const BODY = {
    values,
  };

  // writing the columns' headings
  return gapi.client.sheets.spreadsheets.values
    .update({
      spreadsheetId: spreadsheetId,
      range: `${sheet.title}!A1:B1`,
      valueInputOption: VALUE_INPUT_OPTION,
      resource: { values: [["cost", parameters.mainMetric]] },
    })
    .then(function () {
      // writing the values
      return gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: RANGE,
        valueInputOption: VALUE_INPUT_OPTION,
        resource: BODY,
      });
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

function writeFormattedData(data, spreadsheetId, sheet) {
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

  const result = getPath(data, "", []);
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

  // writing the columns' headings
  return gapi.client.sheets.spreadsheets.values
    .update({
      spreadsheetId: spreadsheetId,
      range: `${sheet.title}!A1:B1`,
      valueInputOption: VALUE_INPUT_OPTION,
      resource: { values: [["key", "value"]] },
    })
    .then(function () {
      // writing the values
      return gapi.client.sheets.spreadsheets.values
        .update({
          spreadsheetId: spreadsheetId,
          range: RANGE,
          valueInputOption: VALUE_INPUT_OPTION,
          resource: BODY,
        })
        .then(function () {
          const RESOURCE = {
            requests: [
              {
                autoResizeDimensions: {
                  dimensions: {
                    sheetId: sheet.sheetId,
                    dimension: "COLUMNS",
                    startIndex: 0,
                    endIndex: 2,
                  },
                },
              },
            ],
          };

          // applying auto columns' width
          return gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: RESOURCE,
          });
        });
    });
}
