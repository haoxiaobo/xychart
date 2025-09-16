
/***计算皮尔逊相关系数 */
function correl(arrx, arry) {
    //console.log("correl", arrx, arry);

    if (arrx.length != arry.length || arrx.length < 2) {
        return NaN;
    }

    var avgx = Math.avg(arrx);
    var avgy = Math.avg(arry);
    var sumxx = 0;
    var sumyy = 0;
    var sumxy = 0;
    for (var i = 0; i < arrx.length; i++) {
        sumxx += (arrx[i] - avgx) * (arrx[i] - avgx);
        sumyy += (arry[i] - avgy) * (arry[i] - avgy);
        sumxy += (arrx[i] - avgx) * (arry[i] - avgy);
    }
    return sumxy / Math.sqrt(sumxx * sumyy);

}

/**
 * 计算t分布的P值（双侧检验）
 * @param {number} t - t统计量
 * @param {number} df - 自由度
 * @returns {number} P值
 */

// 计算t分布的累积分布函数（近似）
// t分布累积分布函数（更准确的贝塔不完全函数实现，保证返回值在[0,1]）
function tCDF(t, df) {
    if (!isFinite(t) || !isFinite(df) || df <= 0) return NaN;
    // t=0时，累积概率为0.5
    if (t === 0) return 0.5;
    var x = df / (df + t * t);
    var a = df / 2;
    var b = 0.5;
    var ibeta = regularizedIncompleteBeta(x, a, b);
    // t>0时，累积概率为1-0.5*ibeta；t<0时为0.5*ibeta
    var cdf = t > 0 ? 1 - 0.5 * ibeta : 0.5 * ibeta;
    // 保证cdf在[0,1]区间
    return Math.max(0, Math.min(1, cdf));
}

// 正则化不完全贝塔函数（更准确，防止溢出）
function regularizedIncompleteBeta(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var bt = Math.exp(
        gammaln(a + b) - gammaln(a) - gammaln(b) +
        a * Math.log(x) + b * Math.log(1 - x)
    );
    if (x < (a + 1) / (a + b + 2)) {
        return bt * betacfFunc(x, a, b) / a;
    } else {
        return 1 - bt * betacfFunc(1 - x, b, a) / b;
    }
}

// 伽马函数的对数（Lanczos近似，防止溢出）
function gammaln(z) {
    var cof = [
        76.18009172947146, -86.50532032941677,
        24.01409824083091, -1.231739572450155,
        0.1208650973866179e-2, -0.5395239384953e-5
    ];
    var x = z, y = z, tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    var ser = 1.000000000190015;
    for (var j = 0; j < cof.length; j++) ser += cof[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / x);
}

// 连分数展开（贝塔函数辅助）
function betacfFunc(x, a, b) {
    var MAXIT = 100, EPS = 1e-10, FPMIN = 1e-30;
    var qab = a + b, qap = a + 1, qam = a - 1;
    var c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    var h = d;
    for (var m = 1, m2 = 2; m <= MAXIT; m++, m2 += 2) {
        var aa = m * (b - m) * x / ((qam + m2) * (a + m2));
        d = 1 + aa * d;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        c = 1 + aa / c;
        if (Math.abs(c) < FPMIN) c = FPMIN;
        d = 1 / d;
        h *= d * c;
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
        d = 1 + aa * d;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        c = 1 + aa / c;
        if (Math.abs(c) < FPMIN) c = FPMIN;
        d = 1 / d;
        var del = d * c;
        h *= del;
        if (Math.abs(del - 1) < EPS) break;
    }
    return h;
}

/**
 * 正态分布累积分布函数（用于大自由度近似）
 */
function normalDistributionCDF(x) {
    const t = 1 / (1 + 0.2316419 * x);
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 +
        t * (-1.821256 + t * 1.330274))));
    return 1 - prob;
}

/**
 * 不完全贝塔函数（用于计算t分布的P值）
 * @param {number} x - 输入值
 * @param {number} a - 参数a
 * @param {number} b - 参数b
 * @returns {number} 不完全贝塔函数值
 */
function incompleteBetaFunction(x, a, b) {
    // 处理边界情况
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    // 交换参数以提高计算效率
    let swap = false;
    if (x > (a + 1) / (a + b + 2)) {
        x = 1 - x;
        [a, b] = [b, a];
        swap = true;
    }

    // 使用连分数展开计算
    let result = 1;
    let term = 1;
    let aPlusB = a + b;
    let aMinusB = a - b;
    let xSquared = x * x;

    for (let n = 0; n < 1000; n++) {
        const factor = (n * (b - n) * x) / ((a + 2 * n - 1) * (a + 2 * n));
        term *= factor;
        result += term;

        // 当项足够小时停止迭代
        if (Math.abs(term) < 1e-15) break;
    }

    result *= Math.pow(x, a) * Math.pow(1 - x, b) * gammaFunction(aPlusB) /
        (gammaFunction(a) * gammaFunction(b) * a);

    return swap ? 1 - result : result;
}

/**
 * 伽马函数的近似计算（用于不完全贝塔函数）
 * @param {number} z - 输入值
 * @returns {number} 伽马函数值
 */
function gammaFunction(z) {
    // 处理特殊情况
    if (isNaN(z)) return NaN;
    if (z <= 0) return Infinity;

    // 对于整数使用阶乘近似
    if (z === Math.floor(z) && z > 0) {
        let result = 1;
        for (let i = 2; i < z; i++) {
            result *= i;
        }
        return result;
    }

    // 对非整数使用Lanczos近似公式
    const g = 7;
    const c = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];

    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaFunction(1 - z));

    z -= 1;
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
        x += c[i] / (z + i);
    }

    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * 计算皮尔逊相关系数的P值（双侧检验）
 * @param {number[]} x - 第一个数组
 * @param {number[]} y - 第二个数组
 * @returns {Object} 包含相关系数r和P值的对象
 */
function correlPValue(x, y) {
    try {
        const r = correl(x, y);
        const n = x.length;
        const df = n - 2;
        if (Math.abs(r) === 1) return { r, p: 0 };
        const denominator = 1 - r * r;
        if (denominator <= 0) return { r, p: 0 };
        const t = r * Math.sqrt(df / denominator);
        let p = 2 * (1 - tCDF(Math.abs(t), df));
        // 保证p在[0,1]区间
        p = Math.max(0, Math.min(1, p));
        return {
            r: Number.isFinite(r) ? r : 0,
            p: Number.isFinite(p) ? p : 1
        };
    } catch (error) {
        console.error("计算出错:", error.message);
        return { r: NaN, p: NaN };
    }
}
