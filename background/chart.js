function drawChart(data, spreadsheetId, sheet) {
  const RESOURCE = {
    requests: [
      {
        addChart: {
          chart: {
            spec: {
              title: "rev vs spend",
              basicChart: {
                chartType: "LINE",
                legendPosition: "NO_LEGEND",
                axis: [
                  {
                    position: "BOTTOM_AXIS",
                    title: "spend",
                  },
                  {
                    position: "LEFT_AXIS",
                    title: "rev",
                  },
                ],
                domains: [
                  {
                    domain: {
                      sourceRange: {
                        sources: [
                          {
                            sheetId: sheet.sheetId,
                            startRowIndex: 1,
                            endRowIndex: data.length,
                            startColumnIndex: 0,
                            endColumnIndex: 1,
                          },
                        ],
                      },
                    },
                  },
                ],
                series: [
                  {
                    series: {
                      sourceRange: {
                        sources: [
                          {
                            sheetId: sheet.sheetId,
                            startRowIndex: 1,
                            endRowIndex: data.length,
                            startColumnIndex: 1,
                            endColumnIndex: 2,
                          },
                        ],
                      },
                    },
                    targetAxis: "LEFT_AXIS",
                  },
                ],
                headerCount: 2,
              },
            },
            position: {
              overlayPosition: {
                anchorCell: {
                  sheetId: sheet.sheetId,
                  rowIndex: 1,
                  columnIndex: 3,
                },
              },
            },
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
