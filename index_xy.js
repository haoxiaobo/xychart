

function saveSul() {
    saveData('suls2d', arSuls);
}

function updateFilterOptions() {
    var filterField = $('#selFilterField').val();
    var container = $('#filterOptionsContainer');
    container.empty();

    console.log('updateFilterOptions called with field:', filterField);

    if (!filterField || filterField === '') {
        $('#filterOptionsRow').hide();
        return;
    }

    // 获取该字段的所有唯一值
    var uniqueValues = [];
    objs.forEach(function (obj) {
        var value = String(obj[filterField]);
        if (uniqueValues.indexOf(value) === -1) {
            uniqueValues.push(value);
        }
    });

    // 排序
    uniqueValues.sort();

    console.log('Found unique values:', uniqueValues);

    // 生成复选框 - 横排布局，自动换行
    uniqueValues.forEach(function (value) {
        var safeId = 'filter_' + value.replace(/[^a-zA-Z0-9]/g, '_');
        var checkbox = $('<div class="form-check form-check-inline">');
        var input = $('<input class="form-check-input" type="checkbox" value="' + value + '" id="' + safeId + '" checked>');
        var label = $('<label class="form-check-label" for="' + safeId + '">').text(value);

        checkbox.append(input).append(label);
        container.append(checkbox);
    });

    console.log('Generated checkboxes for', uniqueValues.length, 'values');
    $('#filterOptionsRow').show();
    updateFilterSummary();
    ApplyChart(true); // 强制更新图表，清除旧数据点
}

function selectAllFilterOptions() {
    $('#filterOptionsContainer input[type="checkbox"]').prop('checked', true);
    updateFilterSummary();
    ApplyChart(true); // 强制更新图表
}

function invertFilterSelection() {
    $('#filterOptionsContainer input[type="checkbox"]').each(function () {
        $(this).prop('checked', !$(this).prop('checked'));
    });
    updateFilterSummary();
    ApplyChart(true); // 强制更新图表
}

function updateFilterSummary() {
    var filterField = $('#selFilterField').val();
    var summary = $('#filterSummary');

    if (!filterField || filterField === '') {
        summary.text('未选择过滤字段');
        return;
    }

    var checkedValues = [];
    $('#filterOptionsContainer input[type="checkbox"]:checked').each(function () {
        checkedValues.push($(this).val());
    });

    var totalValues = $('#filterOptionsContainer input[type="checkbox"]').length;

    if (checkedValues.length === 0) {
        summary.text('已选择: 无');
    } else if (checkedValues.length === totalValues) {
        summary.text('已选择: 全部 (' + totalValues + '项)');
    } else if (checkedValues.length <= 3) {
        summary.text('已选择: ' + checkedValues.join(', '));
    } else {
        summary.text('已选择: ' + checkedValues.slice(0, 3).join(', ') + '... 等' + checkedValues.length + '项');
    }
}

function loadSul() {
    arSuls = retrieveData('suls2d');
    if (!arSuls) arSuls = [];
}



function run() {
    loadSul("2d");
    refreshSidebar();
    console.log("run");
    $.get(
        './datas/' + datafile,
        function (csvdata) {
            objsOrg = csvToObjArray(csvdata);

            //objs = adjustArray(objsOrg, 0.2);
            objs = objsOrg;
            var selGrpProp = $('#selGrpProp');
            var selXprop = $('#selXProp');
            var selYProp = $('#selYProp');
            var selSizeProp = $('#selSizeProp');


            if (objs.length > 0) {
                $("#selGrpProp option[value!='']").remove();
                $("#selXProp option[value!='']").remove();
                $("#selYProp option[value!='']").remove();
                $("#selSizeProp option[value!='']").remove();
                $("#selFilterField option[value!='']").remove();

                Object.keys(objs[0]).sort().forEach(function (prop) {
                    selGrpProp.append($('<option>', {
                        value: prop,
                        text: prop
                    }));
                    selXprop.append($('<option>', {
                        value: prop,
                        text: prop
                    }));
                    selYProp.append($('<option>', {
                        value: prop,
                        text: prop
                    }));
                    selSizeProp.append($('<option>', {
                        value: prop,
                        text: prop
                    }));
                    $('#selFilterField').append($('<option>', {
                        value: prop,
                        text: prop
                    }));
                });

            }
            ApplyChart(true);
        }
    );
}


function ApplyChart(forceRefresh = false) {
    var sGrpProp = $('#selGrpProp').val();
    var sXProp = $('#selXProp').val();
    var sYProp = $('#selYProp').val();
    var sSizeProp = $('#selSizeProp').val();
    var dotSize = $('#rngDotSize').val();
    var autoScale = $('#chkAutoScale').is(':checked');
    var bXCat = $('#chkXCat').is(':checked');
    var bYCat = $('#chkYCat').is(':checked');

    // 获取自定义刻度值
    var xMin = $('#txtXMin').val();
    var xMax = $('#txtXMax').val();
    var yMin = $('#txtYMin').val();
    var yMax = $('#txtYMax').val();

    // 获取过滤设置
    var filterField = $('#selFilterField').val();
    var filteredObjs = objs; // 默认使用所有数据

    if (filterField && filterField !== '') {
        // 获取选中的过滤值
        var selectedValues = [];
        $('#filterOptionsContainer input[type="checkbox"]:checked').each(function () {
            selectedValues.push($(this).val());
        });

        // 如果选择了过滤值，则过滤数据
        filteredObjs = objs.filter(function (obj) {
            return selectedValues.includes(String(obj[filterField]));
        });

    }

    console.log('自定义刻度值:', { xMin, xMax, yMin, yMax, autoScale });
    console.log('过滤设置:', { filterField, selectedValues: selectedValues || [], filteredCount: filteredObjs.length, totalCount: objs.length });

    var result = ConverObjs2XYDataSets(filteredObjs,
        sGrpProp, sXProp, sYProp, sSizeProp);
    console.log(result);

    // 统计GrpProp分组的数量
    var divtab = $("#sumdiv");
    divtab.empty();
    if (sGrpProp && sGrpProp != "") {
        var statobjs = statObjects(filteredObjs, sGrpProp);

        var sTab = CreateHtmlTable(statobjs, false);
        var divtab = $("#sumdiv");
        divtab.empty();

        var tab = $(sTab);
        tab.attr('id', 'sumtable');
        tab.attr('data-toggle', 'table');
        tab.attr('data-sort-class', 'table-active');
        tab.attr('data-toolbar', '.toolbar');
        tab.attr('data-sortable', 'true');

        tab.addClass("table table-bordered");
        tab.find('th').attr('data-sortable', 'true')
            .attr('scope', 'col')
            .addClass('sortable');
        divtab.append(tab);

        tab.bootstrapTable('refreshOptions', {
            sortable: true
        });
    }


    // 取得最大的size值
    var maxSize = 10;
    if (sSizeProp) {
        maxSize = findMaxObj(filteredObjs, sSizeProp)[sSizeProp];
    }

    option = {
        grid: {
            top: "5%",
            left: '5%',
            right: '1%',
            bottom: '10%',
            containLabel: true
        },
        color: colors,
        tooltip: {
            position: "top",
            showDelay: 0,
            formatter: function (params) {
                return (
                    EmpInfo(params.value[3]) + "<br/>" +
                    sGrpProp + ":" + params.seriesName +
                    '<br/>' +
                    sXProp + ":" + params.value[0] +
                    ', ' +
                    sYProp + ":" + params.value[1] +
                    ', ' +
                    sSizeProp + ":" + params.value[2]
                );
            },
            axisPointer: {
                show: true,
                type: 'cross',
                lineStyle: {
                    type: 'dashed',
                    width: 1
                }
            }
        },
        toolbox: {
            feature: {
                //dataZoom: {},

                restore: {},
                saveAsImage: {}
            }
        },
        dataZoom: [

            {
                type: 'inside',
                start: 0,
                end: 100
            }
        ],
        brush: {},
        legend: {
            data: extractAndSortUniqueProperty(result, "name"),
            type: "scroll",
            left: 'center',
            bottom: 5,
            textStyle: {
                fontSize: dotSize * 1.5,
                padding: dotSize * 1.5
            }
        },
        xAxis: [
            {
                name: sXProp,
                type: bXCat ? 'category' : 'value',
                data: bXCat ? (extractAndSortUniqueProperty(filteredObjs, sXProp)) : undefined,
                scale: autoScale,
                min: (!autoScale && xMin !== '') ? parseFloat(xMin) : undefined,
                max: (!autoScale && xMax !== '') ? parseFloat(xMax) : undefined,
                interval: 1,
                axisLabel: {
                    formatter: '{value}',
                    fontSize: dotSize,

                },
                splitLine: {
                    interval: 0,
                    show: true
                },
                nameLocation: "center",
                nameTextStyle: {
                    fontSize: dotSize * 1.5,
                    padding: dotSize * 1.5
                }
            }
        ],
        yAxis: [
            {
                name: sYProp,
                type: bYCat ? 'category' : 'value',
                data: bYCat ? (extractAndSortUniqueProperty(filteredObjs, sYProp)) : undefined,
                scale: autoScale,
                min: (!autoScale && yMin !== '') ? parseFloat(yMin) : undefined,
                max: (!autoScale && yMax !== '') ? parseFloat(yMax) : undefined,
                interval: 1,
                axisLabel: {
                    formatter: '{value}',
                    fontSize: dotSize,

                },
                splitLine: {
                    interval: 0,
                    show: true
                },
                nameLocation: "center",
                nameTextStyle: {
                    fontSize: dotSize * 1.5,
                    padding: dotSize * 1.5
                }
            }
        ],

    };

    // 调试信息
    console.log('X轴配置:', {
        min: (!autoScale && xMin !== '') ? parseFloat(xMin) : undefined,
        max: (!autoScale && xMax !== '') ? parseFloat(xMax) : undefined,
        autoScale: autoScale
    });
    console.log('Y轴配置:', {
        min: (!autoScale && yMin !== '') ? parseFloat(yMin) : undefined,
        max: (!autoScale && yMax !== '') ? parseFloat(yMax) : undefined,
        autoScale: autoScale
    });

    option.series = result.map(function (r) {
        //console.log(r);
        return {
            name: r.name,
            type: 'effectScatter',
            emphasis: {
                focus: 'series'
            },
            symbol: 'circle',
            symbolSize: function (v, p) {
                //return v[1]/20;
                var size = (p.value[2] && p.value[2]) || 10;
                if (!size || size == 0)
                    return 5;
                return size / maxSize * dotSize;
            },
            // prettier-ignore
            data: r.data
        }
    });

    option && myChart.setOption(option, forceRefresh);

    $(window).resize(function () {
        myChart.resize();
    });
}

