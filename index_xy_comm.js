var dom = document.getElementById('container');
var myChart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false
});

var app = {};

var option;
var objs = [];
var objsOrg = [];
var dotSize = 30;
var datafile = undefined;

// 保存的维度组合们
var arSuls = [];

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
function retrieveData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}


function AddSul(grp, x, xCat, y, yCat, z, zCat, size, scale) {
    arSuls.push({
        grp: grp, x: x, xCat: xCat,
        y: y, yCat: yCat,
        z: z, zCat: zCat,
        size: size, scale: scale
    });
    saveSul();
    refreshSidebar();
}

function removeSul(index) {
    arSuls.splice(index, 1);
    saveSul();
    refreshSidebar();
}

function setSul(index) {
    var sul = arSuls[index];
    var forceRefresh = false;
    if ($('#selGrpProp').val() != sul.grp) {
        forceRefresh = true;
    }

    $('#selGrpProp').val(sul.grp);
    $('#selXProp').val(sul.x);
    $('#chkXCat').prop('checked', sul.xCat);
    $('#selYProp').val(sul.y);
    $('#chkYCat').prop('checked', sul.yCat);
    $('#selZProp').val(sul.z);
    $('#chkZCat').prop('checked', sul.zCat);
    $('#selSizeProp').val(sul.size);
    $('#rngDotSize').val(sul.scale);

    ApplyChart(forceRefresh);
}


function genSulDes(sul) {
    return (sul.grp || '无') + "/" + (sul.x || '无')
        + "/" + (sul.y || '无') + "/" + (sul.size || '无');
}

function refreshSidebar() {
    $('#divSuls').empty();
    arSuls.forEach(function (sul, index) {
        $('#divSuls').append(
            $('<a >', {
                href: "#",
                class: 'list-group-item',
                click: function () {
                    setSul(index);
                }
            }).append($("<div>", { class: 'row' })
                .append(
                    $('<div>', {
                        class: 'col-10',
                        text: genSulDes(sul)
                    })).append(
                        $('<div>', {
                            class: 'col-2',
                            text: '',
                        }).append(
                            $('<a>', {
                                class: 'btn btn-sm btn-danger',
                                click: function () {
                                    removeSul(index);
                                }
                            }).append('<i class="bi bi-x"></i>')
                        )
                    ))
        );
    });
}

function EmpInfo(e, specFields, maxFields = 16) {
    //console.log(e);
    if (!e)
        return "未知";

    var fields = [];
    var usedFields = new Set(); // 用于记录已使用的字段，避免重复

    // 首先处理指定的字段
    if (specFields && Array.isArray(specFields)) {
        for (var i = 0; i < specFields.length && fields.length < maxFields; i++) {
            var fieldName = specFields[i];
            // 检查字段是否存在且不为空
            if (e.hasOwnProperty(fieldName) && e[fieldName] !== null && e[fieldName] !== undefined && e[fieldName] !== '') {
                var value = e[fieldName];
                fields.push({ key: fieldName, value: value });
                usedFields.add(fieldName);
            }
        }
    }
    fields.push({ key: "----", value: null });
    // 然后处理其他字段
    for (var key in e) {
        if (e.hasOwnProperty(key) && !usedFields.has(key) && fields.length < maxFields) {
            var value = e[key];
            // 如果值为空或null，显示"无"
            if (value === null || value === undefined || value === '') {
                value = '无';
            }
            fields.push({ key: key, value: value });
        }
    }

    // 构建无框无表线的小表格，每行两个字段
    var tableHtml = '<table class="tooltip-table">';

    var colCount = 0;

    for (var i = 0; i < fields.length; i++) {
        if (fields[i].key === "----") {
            tableHtml += '<tr><td colspan="4" class="tooltip-separator"></td></tr>';
            colCount = 0;
            continue;
        }

        if (colCount == 0) {
            tableHtml += '<tr>';
        }

        tableHtml += '<td class="tooltip-field-name">' + fields[i].key + '</td>';
        tableHtml += '<td class="tooltip-field-value">' + fields[i].value + '</td>';

        colCount++;
        if (colCount >= 2) {
            tableHtml += '</tr>';
            colCount = 0;
        }
    }
    tableHtml += '</table>';

    return tableHtml;
}

// 辅助函数：检查字段是否为指定字段
function isSpecField(fieldName, specFields) {
    if (!specFields || !Array.isArray(specFields)) {
        return false;
    }
    return specFields.indexOf(fieldName) !== -1;
}
colors = ['#ff0000', '#00AA00', '#0000ff', '#ff00FF', '#7a08fa', '#5e63b6', '#AA8844', '#f07b3f', '#0ccccc', '#6639a6', '#000000'];

function adjustArray(arr, adjustmentFactor) {
    // console.log("原始数据", arr);
    var newObjs = arr.map(item => {
        let newItem = {};
        for (let key in item) {
            if (typeof item[key] === 'string' && item[key].trim() != "" && !isNaN(Number(item[key]))) {  // 新增：判断字符串是否能转换为数值
                newItem[key] = Number(item[key]) + (Math.random() * adjustmentFactor - adjustmentFactor / 2);
            } else if (typeof item[key] === 'number') {
                newItem[key] = item[key] + (Math.random() * adjustmentFactor - adjustmentFactor / 2);
            } else {
                newItem[key] = item[key];
            }
        }
        return newItem;
    });
    // console.log("微调数据", newObjs);
    return newObjs;
}

function updateDataList() {
    // console.log("get data list");
    $.get('/api/listcsvfiles', function (data) {

        data.forEach(function (item) {
            $('#selData').append($('<option>', { text: item, value: item }));
        });

        $(document).trigger('dataListReady'); // 触发数据源清单就绪事件
    }, 'json');
}