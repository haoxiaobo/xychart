// 全局变量存储数据
let globalData = null;
let globalParams = null;
let propertySamples = {};

// 从URL获取参数
function getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);

    // 获取data参数（CSV文件名）
    if (urlParams.has('data')) {
        params.data = urlParams.get('data');
    }

    // 获取cat参数（分类字段名）
    if (urlParams.has('cat')) {
        params.cat = urlParams.get('cat');
    }

    return params;
}

// 在页面脚本中添加专用的createCorrelTable函数
function createCorrelTable(objs, sortHeaders = true, numDecimalPrecision = 2) {
    // console.log(objs);

    var allprops = objs.reduce((propertyNames, obj) => {
        Object.keys(obj).forEach(propName => {
            if (!propertyNames.includes(propName)) {
                propertyNames.push(propName);
            }
        });
        return propertyNames;
    }, []);
    if (sortHeaders) {
        allprops.sort();
    }
    var table = '<table class="sortable-table correl-table">';
    table += '<thead><tr>';
    allprops.forEach(propName => {
        table += '<th class="sortable-header" data-field="' + propName + '">';
        table += '<span>' + propName + '</span>';
        table += '<span class="sort-icon"></span>';
        table += '</th>';
    });
    table += '</tr></thead><tbody>';
    objs.forEach(obj => {
        table += '<tr>';
        allprops.forEach(propName => {
            var v = obj[propName];
            var cellContent = '';
            var style = '';

            if (v === undefined || v === null) {
                cellContent = '';
            } else if (typeof (v) === 'number') {
                cellContent = v.toFixed(numDecimalPrecision);
                // 为数字值添加背景色
                style = getColorByCorrelation(v);
            } else {
                cellContent = v;
            }

            table += '<td style="' + style + '">' + cellContent + '</td>';
        });
        table += '</tr>';
    });
    table += '</tbody></table>';
    return table;
}

// 检查值是否可以转换为数字
function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

// 读取CSV文件并处理数据
function processCsvData() {
    const params = getUrlParams();
    globalParams = params;

    // 检查是否提供了data参数
    if (!params.data) {
        showError('请在URL中提供data参数（CSV文件名）');
        return;
    }

    // 更新头部信息
    updateHeaderInfo(params);

    // 如果已有缓存数据，直接使用
    if (globalData) {
        buildPropertiesPanel(globalData);
        return;
    }

    // 构建CSV文件的URL路径
    const csvUrl = `./datas/${params.data}`;

    // 显示加载状态
    $("#loading").show();
    $("#propertiesPanel").hide();
    $("#result").hide();

    // 读取CSV文件
    $.ajax({
        url: csvUrl,
        dataType: 'text',
        success: function (csvData) {
            // 解析CSV数据为对象数组
            const objArray = csvToObjArray(csvData);
            // 保存到全局变量
            globalData = objArray;

            // 构建属性选择面板
            buildPropertiesPanel(objArray);

            // 隐藏加载状态
            $("#loading").hide();
            $("#propertiesPanel").show();
        },
        error: function (xhr, status, error) {
            showError(`读取CSV文件失败：${error}，请检查文件路径是否正确`);
        }
    });
}

// 构建属性选择面板
function buildPropertiesPanel(objArray) {
    if (!objArray || objArray.length === 0) {
        return;
    }

    // 分析前10条数据，获取所有属性
    const analyzedItems = Math.min(objArray.length, 10);
    const allProps = new Set();

    // 清空样本数据
    propertySamples = {};
    // 存储属性是否为数值类型
    propertyNumericTypes = {};

    for (let i = 0; i < analyzedItems; i++) {
        const item = objArray[i];
        Object.keys(item).forEach(prop => {
            allProps.add(prop);

            // 收集样本数据
            if (!propertySamples[prop]) {
                propertySamples[prop] = [];
            }
            propertySamples[prop].push(item[prop]);
        });
    }

    const propsArray = Array.from(allProps);
    const propertiesGrid = $("#propertiesGrid");
    propertiesGrid.empty();

    // 为每个属性创建选择项
    propsArray.forEach(prop => {
        // 检查是否为数值类型或可数值化
        let isNumericType = false;
        if (propertySamples[prop] && propertySamples[prop].length > 0) {
            // 如果至少有一个值可以转换为数字，则视为可数值化
            isNumericType = propertySamples[prop].some(val => isNumeric(val));
        }

        // 存储属性的数值类型信息
        propertyNumericTypes[prop] = isNumericType;

        const propItem = $(`
                    <div class="property-item">
                        <input type="checkbox" id="prop-${prop}" ${isNumericType ? 'checked' : ''} />
                        <label for="prop-${prop}">${prop}</label>
                    </div>
                `);

        // 添加样本数据显示功能
        propItem.hover(
            function () {
                if (propertySamples[prop]) {
                    const sampleText = propertySamples[prop].slice(0, 10).join(', ') + (propertySamples[prop].length > 10 ? ', ...' : '');
                    const sampleDiv = $(`<div class="property-sample">${sampleText}</div>`);
                    $(this).append(sampleDiv);
                }
            },
            function () {
                $(this).find('.property-sample').remove();
            }
        );

        propertiesGrid.append(propItem);
    });

    // 添加复选框事件监听
    $('input[type="checkbox"]', propertiesGrid).change(updateSelectedCount);

    // 初始化选中计数
    updateSelectedCount();

    // 添加按钮事件监听
    $('#selectAllBtn').click(function () {
        $('input[type="checkbox"]', '#propertiesGrid').prop('checked', true);
        updateSelectedCount();
    });

    $('#selectNoneBtn').click(function () {
        $('input[type="checkbox"]', '#propertiesGrid').prop('checked', false);
        updateSelectedCount();
    });

    $('#selectInverseBtn').click(function () {
        $('input[type="checkbox"]', '#propertiesGrid').each(function () {
            $(this).prop('checked', !$(this).prop('checked'));
        });
        updateSelectedCount();
    });

    $('#selectSmartBtn').click(function () {
        $('input[type="checkbox"]', '#propertiesGrid').each(function () {
            const propName = $(this).attr('id').replace('prop-', '');
            $(this).prop('checked', propertyNumericTypes[propName] || false);
        });
        updateSelectedCount();
    });

    // 填充分类字段下拉
    const $selCatField = $('#selCatField');
    $selCatField.empty().append('<option value="">（不分类）</option>');
    propsArray.forEach(prop => {
        $selCatField.append(`<option value="${prop}">${prop}</option>`);
    });
    $selCatField.prop('disabled', false);
    // 设置默认分类字段
    if (globalParams && globalParams.cat) {
        $selCatField.val(globalParams.cat);
    }
}

// 更新选中的属性数量
function updateSelectedCount() {
    const selectedCount = $('input[type="checkbox"]:checked', '#propertiesGrid').length;
    $('#selectedCount').text(`已选择: ${selectedCount} 个属性`);
    $('#analyzeBtn').prop('disabled', selectedCount < 2); // 至少需要选择2个属性才能分析
}

// 更新头部信息
function updateHeaderInfo(params) {
    // 数据文件下拉
    const $selDataFile = $('#selDataFile');
    $selDataFile.prop('disabled', true).empty().append('<option>加载中...</option>');
    // 分类字段下拉
    const $selCatField = $('#selCatField');
    $selCatField.prop('disabled', true).empty().append('<option>加载中...</option>');

    // 获取数据文件列表
    $.get('/api/listcsvfiles', function (files) {
        $selDataFile.empty();
        if (Array.isArray(files) && files.length > 0) {
            files.forEach(f => {
                $selDataFile.append(`<option value="${f}">${f}</option>`);
            });
            $selDataFile.prop('disabled', false);
            // 设置默认值
            if (params.data) {
                $selDataFile.val(params.data);
            }
        } else {
            $selDataFile.append('<option>无可用文件</option>');
        }
    });

    // 分类字段下拉在数据加载后填充
    $selCatField.empty().append('<option value="">（不分类）</option>');
    $selCatField.prop('disabled', true);

    // 刷新按钮
    $('#refreshBtn').off('click').on('click', function () {
        globalData = null;
        processCsvData();
    });

    // 数据文件切换事件
    $selDataFile.off('change').on('change', function () {
        const file = $(this).val();
        // 更新URL参数并刷新
        const url = new URL(window.location.href);
        url.searchParams.set('data', file);
        window.location.href = url.toString();
    });
}

// 计算选中属性之间的相关性系数
function calcCrossCorrel(arr, props, catProp) {
    if (!arr || arr.length <= 1 || !props || props.length < 2) {
        return [];
    }
    //console.log(arr);
    // 统一处理：无论是否有分类字段，都返回相同格式的结果数组
    var categories = [];
    var catDatas = {};
    if (catProp && catProp.trim() !== "") {
        // 有分类字段，按分类处理
        categories = [...new Set(arr.map(d => d[catProp]))];
        categories.sort();
        categories.forEach(cate => {
            let subObjs = arr.filter(d => d[catProp] === cate);
            catDatas[cate] = subObjs;
        });
    }
    else {
        categories = ["全部"];
        catDatas["全部"] = arr;
    }
    //console.log(categories, catDatas);

    var result = {};
    result.props = props;
    result.catProp = catProp;
    result.cates = categories;

    props.forEach(propX => {
        var rx = {};
        result[propX] = rx;
        categories.forEach(cat => {
            var rcat = {};
            rx[cat] = rcat;
            props.forEach(propY => {
                //console.log(propX, cat, propY);
                var subarr = catDatas[cat];
                var arrX = subarr.map(d => parseFloat(d[propX]) || 0.0);
                var arrY = subarr.map(d => parseFloat(d[propY]) || 0.0);
                var corrValue = correl(arrX, arrY);
                rcat[propY] = corrValue;
            });
        });
    });
    //console.log(result);
    return result;
}

// 执行分析
function performAnalysis() {
    if (!globalData) {
        showError('没有可用的数据进行分析');
        return;
    }

    // 获取选中的属性
    const selectedProps = [];
    $('input[type="checkbox"]:checked', '#propertiesGrid').each(function () {
        const propName = $(this).attr('id').replace('prop-', '');
        selectedProps.push(propName);
    });

    // 获取分类字段
    const catProp = $('#selCatField').val() || '';
    globalParams.cat = catProp;

    // 显示加载状态
    $("#loading").show();
    $("#result").hide();

    // 使用setTimeout模拟异步处理，避免UI阻塞
    setTimeout(() => {
        try {
            // 调用calcCrossCorrel计算相关性系数
            const correlResults = calcCrossCorrel(globalData, selectedProps, catProp);

            // 统一使用一个渲染函数处理所有情况
            renderResults(correlResults);
        } catch (error) {
            showError(`分析过程中发生错误：${error.message}`);
        }
    }, 100);
}

// 统一的结果渲染函数
function renderResults(correlResults) {
    //console.log("renderResults", correlResults);
    if (!correlResults) {
        showError('未找到有效的相关性系数数据');
        return;
    }

    // 显示结果区域
    $("#loading").hide();
    $("#result").show();

    //console.log("1231231");

    var tab = createCorrelTable2(correlResults);

    console.log(tab);
    $("#resultContent").empty();
    $("#resultContent").append(tab);

}

/**  添加辅助函数，根据相关性系数值返回对应的背景色*/
function getColorByCorrelation(value) {
    // 确保值是数字
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'background-color: rgb(255, 255, 255)';

    // 相关性系数范围是[-1, 1]
    const normalizedValue = (numValue + 1) / 2; // 转换为[0, 1]范围

    if (normalizedValue >= 0.5) {
        // 正相关：从浅绿色到深绿色
        const intensity = Math.floor(255 * (normalizedValue - 0.5) * 2);
        return `background-color: rgb( ${255 - intensity}, 255, ${255 - intensity});`;
    } else {
        // 负相关：从浅红色到深红色
        const intensity = Math.floor(255 * (0.5 - normalizedValue) * 2);
        return `background-color: rgb(255, ${255 - intensity / 2},  ${255 - intensity / 2});`;
    }
}
function createCorrelTable2(result, numDecimalPrecision = 2) {
    var tab = $("<table class='crossCorrelTable'>");
    var thead = $("<thead>");
    var tbody = $("<tbody>");
    tab.append(thead);
    tab.append(tbody);

    var props = result.props;
    var theadHtml = `
        <tr>
            <th></th><th>${result.catProp}</th>
            ${props.map(prop => `<th>${prop}</th>`).join('')}
        </tr>
    `;

    thead.append(theadHtml);

    result.props.forEach(propX => {
        for (var j = 0; j < result.cates.length; j++) {
            var tr = $("<tr>");
            tbody.append(tr);
            if (j == 0) {
                tr.append(`<td rowspan=${result.cates.length} class='propX'>${propX}</td>`);
            }
            var cat = result.cates[j];
            tr.append(`<td class='cat'>${cat}</td>`);
            for (var i = 0; i < props.length; i++) {
                var propY = props[i];

                var v = result[propX][cat][propY];
                var cellContent = '';
                if (v === undefined || v === null || isNaN(v)) {
                    cellContent = '';
                } else if (typeof (v) === 'number') {
                    cellContent = v.toFixed(numDecimalPrecision);
                } else {
                    cellContent = v;
                }
                style = getColorByCorrelation(v);
                // 只存储必要信息，tooltip内容动态生成
                tr.append(`<td style="${style}"
                    data-cat="${cat}"
                    data-x="${propX}"
                    data-y="${propY}"
                    data-val="${cellContent}">
                    ${cellContent}
                </td>`);
            }
        }
    });



    return tab;
}

// 显示错误信息
function showError(message) {
    $("#loading").hide();
    $("#result").hide();
    // $("#propertiesPanel").hide();

    // 创建错误信息HTML
    const errorHtml = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">错误</h4>
                    <p>${message}</p>
                </div>
            `;

    // 添加到页面
    $("#container").append(errorHtml);
}

// 页面加载完成后执行处理
$(document).ready(function () {
    processCsvData();

    // 添加执行分析按钮事件
    $('#analyzeBtn').click(performAnalysis);

    // 事件委托方式绑定 tooltip 事件，保证动态内容可用

    $("#resultContent").off("mouseenter mouseleave mousemove", ".crossCorrelTable td[data-cat]");
    $("#resultContent").on("mouseenter", ".crossCorrelTable td[data-cat]", function (e) {
        var cat = $(this).attr("data-cat");
        var x = $(this).attr("data-x");
        var y = $(this).attr("data-y");
        var val = $(this).attr("data-val");
        var tooltipHtml = `
            <table>
            <tr><th>分组</th><td>${cat}</td></tr>
            <tr><th>X</th><td>${x}</td></tr>
            <tr><th>Y</th><td>${y}</td></tr>
            <tr><th>相关性</th><td>${val}</td></tr>
            </table>
        `;
        var tooltipDiv = $("<div class='custom-tooltip'></div>").html(tooltipHtml).css({
            position: "fixed",
            top: e.clientY + 10,
            left: e.clientX + 10,
            display: "block"
        });
        $("body").append(tooltipDiv);
    }).on("mousemove", ".crossCorrelTable td[data-cat]", function (e) {
        $(".custom-tooltip").css({
            top: e.clientY + 10,
            left: e.clientX + 10
        });
    }).on("mouseleave", ".crossCorrelTable td[data-cat]", function () {
        $(".custom-tooltip").remove();
    });

});