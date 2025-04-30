function matrixForEach(data, callback) {
    for (let y = 0; y < data.length; y++)
        for (let x = 0; x < data[y].length; x++)
            callback(data[y][x], x, y)
}


function toGrayscale([r, g, b]) {
    return r * 0.3 + g * 0.59 + b * 0.11;
}


function quant(color, bits) {
    return Math.round( (color / bits)) * bits
}

function quantization([r, g, b], bits) {
    bits = 255 / bits;
    return [r, g, b].map(e => quant(e, bits))
}




export {matrixForEach, toGrayscale, quantization}