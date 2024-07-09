// 把对象数组转换为XY散点图用的数据集数组
function ConverObjs2XYDataSets(arr, serial_prop, x_prop, y_prop, size_prop) {
    // 创建一个空的结果数组
    var result = [];

    // 创建一个空的分组对象
    var groups = {};

    // 遍历输入数组
    for (var i = 0; i < arr.length; i++) {
        // 获取当前对象
        var obj = arr[i];

        // 获取分组字段的值
        var groupValue = serial_prop && obj[serial_prop] || "Default";

        // 如果分组对象中还没有这个值，就创建一个新的数组
        if (!groups[groupValue]) {
            groups[groupValue] = [];
        }

        // 把当前对象添加到对应的分组中
        groups[groupValue].push([
            obj[x_prop], // X值
            obj[y_prop], // Y值
            size_prop && obj[size_prop] || 10, // 大小值
            obj // 原对象
        ]);
    }

    // 遍历分组对象
    for (var groupValue in groups) {
        // 把每个分组转换为一个结果对象，然后添加到结果数组中
        result.push({
            name: groupValue,
            data: groups[groupValue]
        });
    }

    // 返回结果数组
    return result;
}

function extractAndSortUniqueProperty(array, propertyName) {
    // 使用Set来自动去重
    const uniqueValues = new Set(array.map(item => item[propertyName]));

    // 将Set转换为数组
    const valuesArray = Array.from(uniqueValues);

    // 根据需要对数组进行排序，这里以数字升序为例
    // 如果属性值是字符串，可以使用localeCompare进行排序
    valuesArray.sort((a, b) => {
        if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
        } else {
            return a.localeCompare(b);
        }
    });
    console.log(valuesArray);
    // 返回排序后的数组
    return valuesArray;
}


// 把对象数组转换为XY散点图用的数据集数组
function ConverObjs2XY3DDataSets(arr, serial_prop, x_prop, y_prop, z_prop, size_prop) {
    // 创建一个空的结果数组
    var result = [];

    // 创建一个空的分组对象
    var groups = {};

    // 遍历输入数组
    for (var i = 0; i < arr.length; i++) {
        // 获取当前对象
        var obj = arr[i];

        // 获取分组字段的值
        var groupValue = serial_prop && obj[serial_prop] || "Default";

        // 如果分组对象中还没有这个值，就创建一个新的数组
        if (!groups[groupValue]) {
            groups[groupValue] = [];
        }

        // 把当前对象添加到对应的分组中
        groups[groupValue].push([
            obj[x_prop], // X值
            obj[y_prop], // Y值
            obj[z_prop], // Z值
            size_prop && obj[size_prop] || 10, // 大小值
            obj // 原对象
        ]);
    }

    // 遍历分组对象
    for (var groupValue in groups) {
        // 把每个分组转换为一个结果对象，然后添加到结果数组中
        result.push({
            name: groupValue,
            data: groups[groupValue]
        });
    }

    // 返回结果数组
    return result;
}

// 寻找对象数组中指定属性有最大值的对象
function findMaxObj(arr, prop) {
    return arr.reduce(function (maxObj, obj) {
        return obj[prop] > maxObj[prop] ? obj : maxObj;
    }, arr[0]);
}

// 把CSV转换为对象数组，
function csvToObjArray(csvData) {
    // 分割CSV数据为行
    var lines = csvData.split('\n');

    // 获取字段名
    var fieldNames = lines[0].split(',');

    // 创建一个空的结果数组
    var result = [];

    // 遍历每一行（除了第一行）
    for (var i = 1; i < lines.length; i++) {
        // 如果这一行是空的，就跳过
        if (lines[i].trim() === '') continue;

        // 分割这一行为字段
        var fields = lines[i].split(',');

        // 创建一个空的对象
        var obj = {};

        // 遍历每一个字段
        for (var j = 0; j < fieldNames.length; j++) {
            // 把这个字段添加到对象中
            // 如果字段是被引号包围的字符串，去掉引号
            obj[fieldNames[j]] = fields[j].replace(/^"(.*)"$/, '$1');
        }

        // 把这个对象添加到结果数组中
        result.push(obj);
    }

    // 返回结果数组
    return result;
}

// 把CSV转换为对象数组，可以处理引号包围的有换行的字符串值
function csvToObjArrayAdv(csvData) {
    // 分割CSV数据为行
    var lines = csvData.match(/(("[^"]*(?:""[^"]*)*")|[^,\n]*)(,|\n|$)/g);

    // 获取字段名
    var fieldNames = lines.splice(0, lines.length / (csvData.split('\n').length - 1));

    // 创建一个空的结果数组
    var result = [];

    // 遍历每一行（除了第一行）
    for (var i = 0; i < lines.length; i += fieldNames.length) {
        // 创建一个空的对象
        var obj = {};

        // 遍历每一个字段
        for (var j = 0; j < fieldNames.length; j++) {
            // 把这个字段添加到对象中
            // 如果字段是被引号包围的字符串，去掉引号
            obj[fieldNames[j].replace(/^"(.*)"$/, '$1')] = lines[i + j].replace(/^"(.*)"$/, '$1');
        }

        // 把这个对象添加到结果数组中
        result.push(obj);
    }

    // 返回结果数组
    return result;
}


function ConvertObj2HeatMapData(Objs, propX, propY, propV, ignoreEmptyXY = true) {
    let result = [];
    let map = {};

    Objs.forEach(obj => {
        let xValue = obj[propX];
        let yValue = obj[propY];
        let vValue;
        if (ignoreEmptyXY) {
            if (xValue === undefined || xValue === '' || yValue === undefined || yValue === '') {
                return;
            }
        }

        if (propV === undefined || propV === '') {
            vValue = 1;
        } else {
            let value = obj[propV];
            vValue = (typeof value === 'number' || !isNaN(parseFloat(value))) ? parseFloat(value) : 1;
        }

        let key = `${xValue}-${yValue}`;
        if (map[key]) {
            map[key][2] += vValue;
        } else {
            map[key] = [xValue, yValue, vValue];
            result.push(map[key]);
        }
    });

    return result;
}


function statObjects(objects, categoryProp, statPropsAndOperations) {
    if (statPropsAndOperations === undefined || statPropsAndOperations.length === 0) {
        statPropsAndOperations = [{ prop: '*', operation: 'count' }];
    }
    let result = {};
    objects.forEach(obj => {
        let categoryValue = obj[categoryProp];
        if (!result[categoryValue]) {
            result[categoryValue] = {};
            statPropsAndOperations.forEach(({ prop, operation }) => {
                result[categoryValue][prop] = { count: 0, sum: 0 };
            });
        }
        statPropsAndOperations.forEach(({ prop, operation }) => {
            if (operation === 'count') {
                result[categoryValue][prop].count++;
            } else if (operation === 'sum' && !isNaN(obj[prop])) {
                result[categoryValue][prop].sum += obj[prop];
            }
        });
    });

    return Object.entries(result).map(([catValue, statValues]) => {
        let item = { [categoryProp]: catValue };
        statPropsAndOperations.forEach(({ prop, operation }) => {
            item[operation + '(' + prop + ')'] =
                statValues[prop][operation === 'sum' ? 'sum' : 'count'];
        });
        return item;
    });
}
/*
// 示例用法
let objects = [
    { category: 'A', value1: 5, value2: 3 },
    { category: 'B', value1: 3, value2: 1 },
    { category: 'A', value1: 2, value2: 2 },
    { category: 'B', value1: 1, value2: 4 }
];

let statPropsAndOperations = [
    { prop: 'value1', operation: 'sum' },
    { prop: 'value2', operation: 'count' }
];

console.log(statObjectArray(objects, 'category', statPropsAndOperations));
*/

function CreateHtmlTable(objs, sortHeaders = true) {
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
    var table = '<table>';
    table += '<thead><tr>';
    allprops.forEach(propName => {
        table += '<th>' + propName + '</th>';
    });
    table += '</tr></thead><tbody>';
    objs.forEach(obj => {
        table += '<tr>';
        allprops.forEach(propName => {
            table += '<td>' + obj[propName] || '<null>' + '</td>';
        });
        table += '</tr>';
    });
    table += '</tbody></table>';
    return table;
}

objs = [
    { id: 1, name: 'Alice', age: 25, sex: 'male' },
    { id: 2, name: 'Bob', job: 'teacher', sex: 'male' },
    { id: 3, name: 'Cathy', age: 30, sex: 'female' },
    { id: 4, name: 'David', job: '', age: 28, sex: 'male' },
    { id: 5, name: 'Eve', job: 'doctor', sex: 'female' }

];
console.log(CreateHtmlTable(objs));
