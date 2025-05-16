import UI from './UI.js';
import ColorMatrix from './ColorMatrix.js';
import DiffusionDithering from './DiffusionDithering.js';
import OrderedDithering from './OrderedDithering.js';
import EdgeDetection from './EdgeDetection.js';
import {matrixForEach, toGrayscale} from './tools.js';


class Main {

    settings = {
        size: 300,
        zoom: 1,
        brightness: 100,
        contrast: 100,
        bitDepth: 1,
        type: 'Floyd Steinberg',
        edge: 'Sobel',
        edgeFactor: 1,
        edgeOpacity: 0.1,
        colored: false,
    }

    nav = [
        {type: 'file', name: 'Choise your image', inner: 'Choise', callback: this.load.bind(this)},
        {type: 'select', name: 'Dithering type', options: {'Diffusion Dithering': Object.keys(DiffusionDithering.types), 'Ordered Dithering': Object.keys(OrderedDithering.types)}, selected:this.settings.type, callback: ({target}) => this.set('type', target.value)},
        {type: 'select', name: 'Edge detector', options: EdgeDetection.types, selected:this.settings.edge, callback: ({target}) => this.set('edge', target.value)},
        {type: 'range', name: 'Edge Factor', min: 0, max: 4, step: 0.1, value: this.settings.edgeFactor, callback: this.input('edgeFactor')},
        {type: 'range', name: 'Edge Opacity', min: 0, max: 1, step: 0.1, value: this.settings.edgeOpacity, callback: this.input('edgeOpacity')},
        {type: 'toggle', names: ['monochrome', 'colored'], state: this.settings.colored, callback: () => this.set('colored', !this.settings.colored)},
        {type: 'number', name: 'size', min: 50, max: 1000, step: 10, value: this.settings.size, callback: this.input('size')},
        {type: 'range', name: 'zoom', min: 1, max: 4, step: 1, value: this.settings.zoom, callback: this.input('zoom')},
        {type: 'range', name: 'brightness', min: 0, max: 400, step: 1, value: this.settings.brightness, callback: this.input('brightness')},
        {type: 'range', name: 'contrast', min: 0, max: 400, step: 1, value: this.settings.contrast, callback: this.input('contrast')},
        {type: 'range', name: 'bit depth', min: 1, max: 32, step: 1, value: this.settings.bitDepth, callback: this.input('bitDepth')},
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
        matrix.forEach((e, x, y) => {
            this.ctx.fillStyle = `rgba(${e})`;
            this.ctx.fillRect(x * zoom, y * zoom, zoom, zoom);
        })
    }

    getImageData(w, h) {
        let rowData = this.ctx.getImageData(0, 0, w, h);
        return new ColorMatrix(rowData.data, w, h);
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

        let matrix = this.getImageData(w, h)

        if (this.settings.edge != 'none') {
            this.edgeDraw(matrix);
            matrix = this.getImageData(w, h)
        }
        
        this.dithering(matrix, w, h);
    }

    edgeDraw(matrix) {
        this.draw(
            EdgeDetection.sobelOperator(
                matrix,
                this.settings.edge,
                this.settings.edgeFactor,
                this.settings.edgeOpacity
            )
        );
    }

    dithering(matrix, w, h) {
        if (!this.settings.colored) {
            matrix.forEach(p => {
                let l = toGrayscale(p);
                [p[0], p[1], p[2]] = [l, l, l];
            });
        }

        if (Object.keys(OrderedDithering.types).includes(this.settings.type))
            OrderedDithering.create(matrix, this.settings.type, this.settings.bitDepth);

        if (Object.keys(DiffusionDithering.types).includes(this.settings.type))
            DiffusionDithering.errorDiffusion(matrix, this.settings.type, this.settings.bitDepth)
        
        let z = this.settings.zoom;
        [this.canvas.width, this.canvas.height] = [w * z, h * z];

        this.draw(matrix);
    }

}


new Main();