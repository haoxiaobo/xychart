// 测试用例1
var arr1 = [
    { group: 'A', x: 1, y: 2, size: 3 },
    { group: 'B', x: 4, y: 5, size: 6 },
    { group: 'A', x: 7, y: 8, size: 9 },
    { group: 'B', x: 10, y: 11, size: 12 }
];
console.log(ConverObjs2XYDataSets(arr1, 'group', 'x', 'y', 'size'));
// 输出: 
// [
//     {name: 'A', data: [[1, 2, 3, {group: 'A', x: 1, y: 2, size: 3}], [7, 8, 9, {group: 'A', x: 7, y: 8, size: 9}]]},
//     {name: 'B', data: [[4, 5, 6, {group: 'B', x: 4, y: 5, size: 6}], [10, 11, 12, {group: 'B', x: 10, y: 11, size: 12}]]}
// ]

// 测试用例2
var arr2 = [
    { group: 'C', x: 13, y: 14, size: 15 },
    { group: 'D', x: 16, y: 17, size: 18 },
    { group: 'C', x: 19, y: 20, size: 21 },
    { group: 'D', x: 22, y: 23, size: 24 }
];
console.log(ConverObjs2XYDataSets(arr2, 'group', 'x', 'y', 'size'));
// 输出:
// [
//     {name: 'C', data: [[13, 14, 15, {group: 'C', x: 13, y: 14, size: 15}], [19, 20, 21, {group: 'C', x: 19, y: 20, size: 21}]]},
//     {name: 'D', data: [[16, 17, 18, {group: 'D', x: 16, y: 17, size: 18}], [22, 23, 24, {group: 'D', x: 22, y: 23, size: 24}]]}
// ]
