export default class EdgeDetection {

    static types = ['None', 'Sobel', 'Scharr'];

    static Sobel = {
        Gx: [
            [-1,  0,  1],
            [-2,  0,  2],
            [-1,  0,  1],
        ],

        Gy: [
            [-1, -2, -1],
            [ 0,  0,  0],
            [ 1,  2,  1],
        ]
    }

    static Scharr = {
        Gx: [
            [ 3,  0,  -3],
            [10,  0, -10],
            [ 3,  0,  -3],
        ],

        Gy: [
            [ 3,  10,  3],
            [ 0,   0,  0],
            [-3, -10, -3],
        ]
    }

    static addFactor(matrix, factor) {
        return matrix.map(a => a.map(e => e * factor));
    }

    static sobelOperator(data, type, factor = 1, opacity = 1) {
        
        let x = data.convolution( this.addFactor(this[type].Gx, factor) );
        let y = data.convolution( this.addFactor(this[type].Gy, factor) );
        
        x.forEach((c1, cx, cy) => {
            let c2 = y.data[cy][cx];
            [c1[0], c1[1], c1[2]] = [c1[0], c1[1], c1[2]].map(
                (e,i) => Math.sqrt(e ** 2 + c2[i] ** 2)
            )
            c1[3] = opacity;
        })
        return x;
    }

}