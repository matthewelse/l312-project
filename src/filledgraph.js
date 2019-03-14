/**
 * Filled graph view, used to indicate the altitude profile of the route.
 * 
 * @author Matthew Else <matthew.else@cl.cam.ac.uk>
 */

export default class FilledGraph {
    constructor (xdata, ydata, x, y, width, height, left_color, right_color) {
        this.xdata = xdata;
        this.ydata = ydata;

        this.width = width;
        this.height = height;

        this.left_color = left_color;
        this.right_color = right_color;

        this.x = x;
        this.y = y;

        this.computeScales();
        this.split = 1.0;

        // compute a rolling average of xs and ys
        const points = 400
        const average_count = Math.ceil(this.xdata.length / points);

        const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
        let xpoints = [];
        let ypoints = [];

        let x_out = [];
        let y_out = [];

        for (let i = 0; i < this.xdata.length; i++) {
            xpoints.push(this.xdata[i]);
            ypoints.push(this.ydata[i]);

            x_out.push(average(xpoints));
            y_out.push(average(ypoints));

            if (i > average_count) {
                xpoints.shift();
                ypoints.shift();
            }
        }

        this.xdata = x_out;
        this.ydata = y_out;

        this.computeScales();
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;     

        this.computeScales();
    }

    updateSize(width, height) {
        this.width = width;
        this.height = height;

        this.computeScales();
    }

    computeScales() {
        // compute the minimum and maximum altitudes
        // Math.max.apply(Math, data);
        const max_alt = Math.max.apply(Math, this.ydata);
        const min_alt = Math.min.apply(Math, this.ydata);

        // y = (altitude - yoffset) * yscale
        this.yscale =  this.height/(max_alt - min_alt);
        this.yoffset = min_alt;

        const max_dist = Math.max.apply(Math, this.xdata);
        const min_dist = Math.min.apply(Math, this.xdata);        

        this.xscale = this.width/(max_dist - min_dist);
        this.xoffset = min_dist;
    }

    changeSplitPoint(proportion) {
        this.split = proportion;
    }

    draw () {
        let upTo = Math.floor((this.xdata.length - 1) * this.split);

        this.drawUpTo(0, upTo, this.left_color);
        this.drawUpTo(upTo + 1, this.xdata.length - 1, this.right_color);
    }

    drawUpTo (from, to, color) {
        noStroke();

        if (color !== undefined) {
            fill(color);
        }
        
        const start_distance = this.xdata[from];
        const startX = (start_distance - this.xoffset) * this.xscale;

        const to_distance = this.xdata[to];
        const endX = (to_distance - this.xoffset) * this.xscale;

        beginShape();
        vertex(startX, this.y);

        for (let i = from; i < to; i++) {
            const distance = this.xdata[i];
            const x = (distance - this.xoffset) * this.xscale;

            const altitude = this.ydata[i];
            const y = (altitude - this.yoffset) * this.yscale;

            vertex(this.x + x, this.y - y);
        }
        
        vertex(endX, this.y);
        endShape(CLOSE);
        stroke(0);
    }
}
