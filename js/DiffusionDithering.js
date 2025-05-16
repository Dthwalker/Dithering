import {toGrayscale, quantization} from './tools.js';


export default class DiffusionDithering {

    static types = {
        'Floyd Steinberg': [
            [0,  1, 7, 16],
            [1, -1, 3, 16],
            [1,  0, 5, 16],
            [1,  1, 1, 16],
        ],
        'Jarvis, Judice, Nink': [
            [0,  1, 7, 48],
            [0,  2, 5, 48],
            [1, -2, 3, 48],
            [1, -1, 5, 48],
            [1,  0, 7, 48],
            [1,  1, 5, 48],
            [1,  2, 3, 48],
            [2, -2, 1, 48],
            [2, -1, 3, 48],
            [2,  0, 5, 48],
            [2,  1, 3, 48],
            [2,  2, 1, 48],
        ],
        'Stucki': [
            [0,  1, 8, 42],
            [0,  2, 4, 42],
            [1, -2, 2, 42],
            [1, -1, 4, 42],
            [1,  0, 8, 42],
            [1,  1, 4, 42],
            [1,  2, 2, 42],
            [2, -2, 1, 42],
            [2, -1, 2, 42],
            [2,  0, 4, 42],
            [2,  1, 2, 42],
            [2,  2, 1, 42],
        ],
        'Atkinson': [
            [0,  1, 1, 8],
            [0,  2, 1, 8],
            [1, -1, 1, 8],
            [1,  0, 1, 8],
            [1,  1, 1, 8],
            [2,  0, 1, 8],
        ],
        'Burkes': [
            [0,  1, 8, 32],
            [0,  2, 4, 32],
            [1, -2, 2, 32],
            [1, -1, 4, 32],
            [1,  0, 8, 32],
            [1,  1, 4, 32],
            [1,  2, 2, 32],
        ],
        'One-dimensional horizontal': [
            [0, 1, 1, 1],
        ],
        'One-dimensional vertical': [
            [1, 0, 1, 1],
        ],
        'Two-dimensional': [
            [0, 1, 1, 2],
            [1, 0, 1, 2],
        ],
        'DTH glitch 1': [
            [0, 1, 1, 1],
            [-1, 2, 2, 1],
        ],
        'DTH glitch 2': [
            [0, 3, 1, 1],
        ],
        'DTH glitch 3': [
            [4, 0, 1, 1],
        ],
    }

    static errorDiffusion(matrix, type, bits) {
        let diffusion = (color, error) => {
            let [r, g, b] = color;
            [color[0], color[1], color[2]] = [r, g, b].map(e => e + error);
        }
        
        matrix.forEach((p, x, y) => {
            let oP = [...p];
            let nP =  quantization(p, bits);
            [p[0], p[1], p[2]] = nP;
            let quantError = toGrayscale(oP) - toGrayscale(nP);
            this.types[type].forEach(e => {
                try { diffusion(matrix.data[y + e[0]][x + e[1]], quantError * e[2] / e[3]) } catch {}
            });
        });
    }

}