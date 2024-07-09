

function saveSul() {
    saveData('suls2d', arSuls);
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

    var result = ConverObjs2XYDataSets(objs,
        sGrpProp, sXProp, sYProp, sSizeProp);
    console.log(result);

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
                data: bXCat ? (extractAndSortUniqueProperty(objs, sXProp)) : undefined,
                scale: autoScale,
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
                data: bYCat ? (extractAndSortUniqueProperty(objs, sYProp)) : undefined,
                scale: autoScale,
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

