export default class ColorMatrix {

    data;

    constructor(data, w, h) {
        if (data instanceof ColorMatrix)
            this.data = JSON.parse(JSON.stringify(data.data));
        else
            this.data = this.create(data, w, h);
    }

    create(data, w, h) {
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

    forEach(callback) {
        for (let y = 0; y < this.data.length; y++)
            for (let x = 0; x < this.data[y].length; x++)
        callback(this.data[y][x], x, y)
}

    convolution(matrix) {
        let newMatrix = new ColorMatrix(this);

        this.forEach((c, x, y) => {
            let nC = newMatrix.data[y][x];
            let [r,g,b] = [0,0,0];
            for (let my = 0; my < matrix.length; my++)
                for (let mx = 0; mx < matrix[0].length; mx++) {
                    if (!this.data[y + my] || !this.data[y + my][x + mx])
                        continue

                    let el = this.data[y + my][x + mx]
                    r += el[0] * matrix[my][mx];
                    g += el[0] * matrix[my][mx];
                    b += el[0] * matrix[my][mx];
                }
            nC[0] = r;
            nC[1] = g;
            nC[2] = b;
        });

        return newMatrix;
    }

}