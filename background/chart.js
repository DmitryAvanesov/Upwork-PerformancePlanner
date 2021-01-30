function drawCharts(json, spreadsheetId, sheet, parameters) {
    const targetData = json[2][6][0][2][1];
    let requests;

    if (parameters.mainMetric === "conversions") {
        requests = [
            {
                addChart: {
                    chart: {
                        spec: {
                            title: "profit vs cost",
                            hiddenDimensionStrategy: "SHOW_ALL",
                            basicChart: {
                                chartType: "LINE",
                                legendPosition: "NO_LEGEND",
                                axis: [
                                    {
                                        position: "BOTTOM_AXIS",
                                        title: "cost",
                                    },
                                    {
                                        position: "LEFT_AXIS",
                                        title: "profit",
                                    },
                                ],
                                domains: [
                                    {
                                        domain: {
                                            sourceRange: {
                                                sources: [
                                                    {
                                                        sheetId: sheet.sheetId,
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
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
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 8,
                                                        endColumnIndex: 9,
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
                                    columnIndex: 12,
                                },
                                widthPixels: 500,
                                heightPixels: 300,
                            },
                        },
                    },
                },
            },
            {
                addChart: {
                    chart: {
                        spec: {
                            title: "profit vs conversions",
                            hiddenDimensionStrategy: "SHOW_ALL",
                            basicChart: {
                                chartType: "LINE",
                                legendPosition: "NO_LEGEND",
                                axis: [
                                    {
                                        position: "BOTTOM_AXIS",
                                        title: "conversions",
                                    },
                                    {
                                        position: "LEFT_AXIS",
                                        title: "profit",
                                    },
                                ],
                                domains: [
                                    {
                                        domain: {
                                            sourceRange: {
                                                sources: [
                                                    {
                                                        sheetId: sheet.sheetId,
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 1,
                                                        endColumnIndex: 2,
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
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 8,
                                                        endColumnIndex: 9,
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
                                    columnIndex: 18,
                                },
                                widthPixels: 500,
                                heightPixels: 300,
                            },
                        },
                    },
                },
            },
            {
                addChart: {
                    chart: {
                        spec: {
                            title: "profit vs CPA ave",
                            hiddenDimensionStrategy: "SHOW_ALL",
                            basicChart: {
                                chartType: "LINE",
                                legendPosition: "NO_LEGEND",
                                axis: [
                                    {
                                        position: "BOTTOM_AXIS",
                                        title: "CPA ave",
                                    },
                                    {
                                        position: "LEFT_AXIS",
                                        title: "profit",
                                    },
                                ],
                                domains: [
                                    {
                                        domain: {
                                            sourceRange: {
                                                sources: [
                                                    {
                                                        sheetId: sheet.sheetId,
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 2,
                                                        endColumnIndex: 3,
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
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 8,
                                                        endColumnIndex: 9,
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
                                    rowIndex: 18,
                                    columnIndex: 12,
                                },
                                widthPixels: 500,
                                heightPixels: 300,
                            },
                        },
                    },
                },
            },
            {
                addChart: {
                    chart: {
                        spec: {
                            title: "incr CPA vs CPA ave",
                            hiddenDimensionStrategy: "SHOW_ALL",
                            basicChart: {
                                chartType: "LINE",
                                legendPosition: "NO_LEGEND",
                                axis: [
                                    {
                                        position: "BOTTOM_AXIS",
                                        title: "CPA ave",
                                    },
                                    {
                                        position: "LEFT_AXIS",
                                        title: "incr CPA",
                                    },
                                ],
                                domains: [
                                    {
                                        domain: {
                                            sourceRange: {
                                                sources: [
                                                    {
                                                        sheetId: sheet.sheetId,
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 2,
                                                        endColumnIndex: 3,
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
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 5,
                                                        endColumnIndex: 6,
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
                                    rowIndex: 18,
                                    columnIndex: 18,
                                },
                                widthPixels: 500,
                                heightPixels: 300,
                            },
                        },
                    },
                },
            },
        ];
    } else if (parameters.mainMetric === "conversion value") {
        requests = [
            {
                addChart: {
                    chart: {
                        spec: {
                            title: "profit vs cost",
                            hiddenDimensionStrategy: "SHOW_ALL",
                            basicChart: {
                                chartType: "LINE",
                                legendPosition: "NO_LEGEND",
                                axis: [
                                    {
                                        position: "BOTTOM_AXIS",
                                        title: "cost",
                                    },
                                    {
                                        position: "LEFT_AXIS",
                                        title: "profit",
                                    },
                                ],
                                domains: [
                                    {
                                        domain: {
                                            sourceRange: {
                                                sources: [
                                                    {
                                                        sheetId: sheet.sheetId,
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
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
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 11,
                                                        endColumnIndex: 12,
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
                                    columnIndex: 15,
                                },
                                widthPixels: 500,
                                heightPixels: 300,
                            },
                        },
                    },
                },
            },
            {
                addChart: {
                    chart: {
                        spec: {
                            title: "Approx Sales vs cost",
                            hiddenDimensionStrategy: "SHOW_ALL",
                            basicChart: {
                                chartType: "LINE",
                                legendPosition: "NO_LEGEND",
                                axis: [
                                    {
                                        position: "BOTTOM_AXIS",
                                        title: "cost",
                                    },
                                    {
                                        position: "LEFT_AXIS",
                                        title: "Approx Sales",
                                    },
                                ],
                                domains: [
                                    {
                                        domain: {
                                            sourceRange: {
                                                sources: [
                                                    {
                                                        sheetId: sheet.sheetId,
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
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
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 3,
                                                        endColumnIndex: 4,
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
                                    columnIndex: 21,
                                },
                                widthPixels: 500,
                                heightPixels: 300,
                            },
                        },
                    },
                },
            },
            {
                addChart: {
                    chart: {
                        spec: {
                            title: "profit vs ROAS",
                            hiddenDimensionStrategy: "SHOW_ALL",
                            basicChart: {
                                chartType: "LINE",
                                legendPosition: "NO_LEGEND",
                                axis: [
                                    {
                                        position: "BOTTOM_AXIS",
                                        title: "ROAS",
                                    },
                                    {
                                        position: "LEFT_AXIS",
                                        title: "profit",
                                    },
                                ],
                                domains: [
                                    {
                                        domain: {
                                            sourceRange: {
                                                sources: [
                                                    {
                                                        sheetId: sheet.sheetId,
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 2,
                                                        endColumnIndex: 3,
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
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 11,
                                                        endColumnIndex: 12,
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
                                    rowIndex: 18,
                                    columnIndex: 15,
                                },
                                widthPixels: 500,
                                heightPixels: 300,
                            },
                        },
                    },
                },
            },
            {
                addChart: {
                    chart: {
                        spec: {
                            title: "incr ROAS vs cost",
                            hiddenDimensionStrategy: "SHOW_ALL",
                            basicChart: {
                                chartType: "LINE",
                                legendPosition: "NO_LEGEND",
                                axis: [
                                    {
                                        position: "BOTTOM_AXIS",
                                        title: "cost",
                                    },
                                    {
                                        position: "LEFT_AXIS",
                                        title: "incr ROAS",
                                    },
                                ],
                                domains: [
                                    {
                                        domain: {
                                            sourceRange: {
                                                sources: [
                                                    {
                                                        sheetId: sheet.sheetId,
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
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
                                                        startRowIndex: 0,
                                                        endRowIndex: targetData.length,
                                                        startColumnIndex: 9,
                                                        endColumnIndex: 10,
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
                                    rowIndex: 18,
                                    columnIndex: 21,
                                },
                                widthPixels: 500,
                                heightPixels: 300,
                            },
                        },
                    },
                },
            },
        ];
    }

    const RESOURCE = {
        requests,
    };

    return gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: RESOURCE,
    });
}
