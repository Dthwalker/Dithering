import { matrixForEach, quantization } from './tools.js';


export default class OrderedDithering {

    static types = {
        '2X2 map': [
            [0, 2],
            [3, 1],
        ],
        '4X4 map': [
            [ 0,  8,  2, 10],
            [12,  4, 14,  6],
            [ 3, 11,  1,  9],
            [15,  7, 13,  5],
        ],
    }
        

    static create(data, type, bits) {
        let l = this.types[type].length;
        let d = l ** 2;

        matrixForEach(data, (p, x, y) => {
            let factor = this.types[type][y % l][x % l];

            let bayer = 255 / bits * (factor / d - 0.5);
            for (let i = 0; i < 3; i++) {
                p[i] = p[i] + bayer;
            }
            [p[0], p[1], p[2]] = quantization(p, bits);
        });
    }

}