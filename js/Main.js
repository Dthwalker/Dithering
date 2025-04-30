import UI from './UI.js';
import DiffusionDithering from './DiffusionDithering.js';
import OrderedDithering from './OrderedDithering.js';
import {matrixForEach, toGrayscale} from './tools.js';


class Main {

    settings = {
        size: 300,
        zoom: 1,
        brightness: 100,
        contrast: 100,
        'bit depth': 1,
        type: 'Floyd Steinberg',
        colored: false,
    }

    nav = [
        {type: 'file', name: 'Choise your image', inner: 'Choise', callback: this.load.bind(this)},
        {type: 'select', name: 'Dithering type', options: {'Diffusion Dithering': Object.keys(DiffusionDithering.types), 'Ordered Dithering': Object.keys(OrderedDithering.types)}, selected:this.settings.type, callback: ({target}) => this.set('type', target.value)},
        {type: 'toggle', names: ['monochrome', 'colored'], state: this.settings.colored, callback: () => this.set('colored', !this.settings.colored)},
        {type: 'number', name: 'size', min: 50, max: 1000, step: 10, value: this.settings.size, callback: this.input('size')},
        {type: 'range', name: 'zoom', min: 0.1, max: 4, step: 0.1, value: this.settings.zoom, callback: this.input('zoom')},
        {type: 'range', name: 'brightness', min: 0, max: 400, step: 1, value: this.settings.brightness, callback: this.input('brightness')},
        {type: 'range', name: 'contrast', min: 0, max: 400, step: 1, value: this.settings.contrast, callback: this.input('contrast')},
        {type: 'range', name: 'bit depth', min: 1, max: 32, step: 1, value: this.settings['bit depth'], callback: this.input('bit depth')},
    ]

    canvas = document.querySelector('canvas');
    ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    img = new Image();

    constructor() {
        let ui = new UI(this.nav, DiffusionDithering.types);
    }

    input(prop) { return ({target}) => this.set(prop, + target.value) }

    set(prop, value) {
        this.settings[prop] = value;
        this.createData();
    }

    load({target}) {
        let file = target.files[0];
        if (!file) return;
        let url = URL.createObjectURL(file);
        new Promise(r => {
            this.img.onload = () => r();
            this.img.src = url;
        }).then(e => this.createData());
    }

    draw(matrix) {
        let zoom = this.settings.zoom;
        matrixForEach(matrix, (e, x, y) => {
            this.ctx.fillStyle = `rgba(${e})`;
            this.ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
        })
    }

    createMatrix(data, w, h) {
        let matrix = [];
        let i = 0;
        for (let y = 0; y < h; y++) {
            matrix.push([]);
            for (let x = 0; x < w; x++) {
                matrix[y][x] = [data[i+0], data[i+1], data[i+2], data[i+3]];
                i += 4;
            }
        }
        return matrix;
    }

    createData() {
        if (!this.img.src) return;
        let ratio = this.img.naturalWidth / this.img.naturalHeight;
        let [w, h] = [this.settings.size, this.settings.size / ratio];

        let zoom = this.settings.zoom;
        [this.canvas.width, this.canvas.height] = [w, h];

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.filter = `brightness(${this.settings.brightness}%) contrast(${this.settings.contrast}%)`;
        this.ctx.drawImage(this.img, 0, 0, w, h);
        this.ctx.filter = "none";

        let rowData = this.ctx.getImageData(0, 0, w, h);
        let matrix = this.createMatrix(rowData.data, w, h);
        
        this.dithering(matrix, w, h);
    }

    dithering(data, w, h) {
        if (!this.settings.colored) {
            matrixForEach(data, (p, x, y) => {
                let l = toGrayscale(p);
                [p[0], p[1], p[2]] = [l, l, l];
            });
        }

        if (Object.keys(OrderedDithering.types).includes(this.settings.type))
            OrderedDithering.create(data, this.settings.type, this.settings['bit depth']);

        if (Object.keys(DiffusionDithering.types).includes(this.settings.type))
            DiffusionDithering.errorDiffusion(data, this.settings.type, this.settings['bit depth'])
        
        let z = this.settings.zoom;
        [this.canvas.width, this.canvas.height] = [w * z, h * z];

        this.draw(data);
    }

}


new Main();