

function saveSul() {
    saveData('sulshm', arSuls);
}

function loadSul() {
    arSuls = retrieveData('sulshm');
    if (!arSuls) arSuls = [];
}


function run() {
    loadSul("2d");
    refreshSidebar();

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
    var bIgnoreEmptyXY = $('#chkIgnoreEmptyXY').is(':checked');

    var result = ConvertObj2HeatMapData(objs,
        sXProp, sYProp, sSizeProp, bIgnoreEmptyXY);
    //console.log(result);

    // 统计GrpProp分组的数量
    var divtab = $("#sumdiv");
    divtab.empty();
    if (sGrpProp && sGrpProp != "") {
        var statobjs = statObjects(objs, sGrpProp);

        var sTab = CreateHtmlTable(statobjs, false);
        var divtab = $("#sumdiv");
        divtab.empty();

        var tab = $(sTab);
        tab.attr('id', 'sumtable');
        tab.addClass("table table-bordered table-sm");
        divtab.append(tab);

        // 添加排序功能
        addTableSorting(tab, statobjs);
    }
    // 取得最大的size值
    var maxSize = 10;
    if (sSizeProp) {
        maxSize = findMaxObj(objs, sSizeProp)[sSizeProp];
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
                console.log("sSizeProp", sSizeProp)
                return (

                    sXProp + ":" + params.value[0] +
                    ', ' +
                    sYProp + ":" + params.value[1] +
                    ', ' +
                    ((!sSizeProp || sSizeProp == "") ? "计数" : sSizeProp) + ":" + Math.round(params.value[2], 4)
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
            data: ["1", "b"],
            type: "scroll",
            left: 'center',
            bottom: 5,
            textStyle: {
                fontSize: dotSize * 1.5,
            }
        },
        xAxis: [
            {
                name: sXProp,
                type: bXCat ? 'category' : 'value',
                data: bXCat ? (extractAndSortUniqueProperty(objs, sXProp)) : undefined,
                scale: autoScale,
                interval: 1,
                axisLabel: {
                    formatter: '{value}',
                    fontSize: dotSize,
                    padding: 5
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
                data: bYCat ? (extractAndSortUniqueProperty(objs, sYProp)) : undefined,
                scale: autoScale,
                interval: 1,
                axisLabel: {
                    formatter: '{value}',
                    fontSize: dotSize,
                    padding: 0
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

        visualMap: {
            min: 0,
            max: Math.max(...result.map(r => r[2])),
            calculable: true,
            orient: 'horizontal',
            itemWidth: 15,
            itemHeight: 300,
            left: 'center',
            bottom: '0%'
        },
        series: [{
            type: 'heatmap',
            data: result,
            label: {
                show: true,
                fontSize: dotSize,
                formatter: function (params) { return Math.round(params.value[2], 4) }
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            },
            itemStyle: {
                normal: {
                    opacity: 0.5
                }
            },

        }
        ]
    };



    option && myChart.setOption(option, forceRefresh);

    $(window).resize(function () {
        myChart.resize();
    });
}

/**
 * 为表格添加排序功能
 * @param {jQuery} table - 表格jQuery对象
 * @param {Array} data - 原始数据数组
 */
function addTableSorting(table, data) {
    var currentSortField = null;
    var currentSortDirection = 'asc'; // 'asc' 或 'desc'

    // 为每个表头添加点击事件
    table.find('.sortable-header').on('click', function () {
        var field = $(this).data('field');
        var $this = $(this);

        // 清除所有表头的排序图标
        table.find('.sort-icon').text('↕').css('color', '#ccc');

        // 确定排序方向
        if (currentSortField === field) {
            // 如果点击的是当前排序字段，切换方向
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // 如果点击的是新字段，默认升序
            currentSortField = field;
            currentSortDirection = 'asc';
        }

        // 更新排序图标
        var icon = currentSortDirection === 'asc' ? '↑' : '↓';
        $this.find('.sort-icon').text(icon).css('color', '#007bff');

        // 执行排序
        var sortedData = sortTableData(data, field, currentSortDirection);

        // 重新渲染表格内容
        renderSortedTable(table, sortedData);
    });
}

/**
 * 对数据进行排序
 * @param {Array} data - 原始数据
 * @param {string} field - 排序字段
 * @param {string} direction - 排序方向 ('asc' 或 'desc')
 * @returns {Array} 排序后的数据
 */
function sortTableData(data, field, direction) {
    return data.slice().sort(function (a, b) {
        var aVal = a[field];
        var bVal = b[field];

        // 处理null和undefined值
        if (aVal === null || aVal === undefined || aVal === '') aVal = '';
        if (bVal === null || bVal === undefined || bVal === '') bVal = '';

        // 尝试数值比较
        var aNum = parseFloat(aVal);
        var bNum = parseFloat(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
            // 数值比较
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
        } else {
            // 字符串比较
            var aStr = String(aVal).toLowerCase();
            var bStr = String(bVal).toLowerCase();
            if (direction === 'asc') {
                return aStr.localeCompare(bStr);
            } else {
                return bStr.localeCompare(aStr);
            }
        }
    });
}

/**
 * 重新渲染排序后的表格内容
 * @param {jQuery} table - 表格jQuery对象
 * @param {Array} sortedData - 排序后的数据
 */
function renderSortedTable(table, sortedData) {
    var tbody = table.find('tbody');
    tbody.empty();

    // 获取所有字段名
    var fields = [];
    if (sortedData.length > 0) {
        fields = Object.keys(sortedData[0]);
    }

    // 重新生成表格行
    sortedData.forEach(function (row) {
        var tr = $('<tr>');
        fields.forEach(function (field) {
            var td = $('<td>').text(row[field] || '<null>');
            tr.append(td);
        });
        tbody.append(tr);
    });
}

