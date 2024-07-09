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

function EmpInfo(e) {
    //console.log(e);
    if (!e)
        return "未知";

    return "<b>" + e["基本-姓名"] + "-" + e["工作-部门"] + "</b>";

}
colors = ['#ff0000', '#00AA00', '#0000ff', '#ff00FF', '#7a08fa', '#5e63b6', '#AA8844', '#f07b3f', '#0ccccc', '#6639a6', '#000000'];

function adjustArray(arr, adjustmentFactor) {
    console.log("原始数据", arr);
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
    console.log("微调数据", newObjs);
    return newObjs;
}

function updateDataList() {
    console.log("get data list");
    $.get('/api/listcsvfiles', function (data) {

        data.forEach(function (item) {
            $('#selData').append($('<option>', { text: item, value: item }));
        });
        $('#selData').trigger("change");
    }, 'json');
}