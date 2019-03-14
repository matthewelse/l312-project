/**
 * Map view for the visualisation - I didn't end up using this.
 * 
 * @author Matthew Else <matthew.else@cl.cam.ac.uk>
 */

let latlong_range = (data) => {
    let max_lat = -1000;
    let min_lat = 1000;
    let max_long = -1000;
    let min_long = 1000;

    for (let i = 0; i < data.length; i++) {
        if (data[i][0] > max_lat) {
            max_lat = data[i][0];
        }
        if (data[i][0] < min_lat) {
            min_lat = data[i][0];
        }

        if (data[i][1] > max_long) {
            max_long = data[i][1];
        }
        if (data[i][0] < min_long) {
            min_long = data[i][1];
        }
    }

    return [[max_lat, min_lat], [max_long, min_long]];
}

export default class MapView {
    constructor(map, x, y, width, height) {
        // find the minimum and maximum latitude and longitude
        const [[max_lat, min_lat], [max_long, min_long]] = latlong_range(map);

        this.lat_offset = min_lat;
        this.lat_scale = height / (max_lat - min_lat);
        
        this.long_offset = min_long;
        this.long_scale = width / (max_long - min_long);

        this.data = map;

        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
    }

    draw() {
        // noStroke();
        noFill();

        beginShape();

        for (let i = 0; i < this.data.length; i++) {
            const lat = this.data[i][0];
            const long = this.data[i][1];
            const x = (lat - this.lat_offset) * this.lat_scale;
            const y = (long - this.long_offset) * this.long_scale;
        
            vertex(this.x + x, this.y - y);
        }
        
        // vertex(endX, this.y);
        endShape();
        // stroke(0);
    }
}