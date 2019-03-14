/**
 * Rider view - shows each rider's name, current heart rate, power, velocity and cadence.
 * 
 * @author Matthew Else <matthew.else@cl.cam.ac.uk>
 */

import {rider_data, rider_names} from './data';
import {moving_average} from './utils';

const hr_averaged = rider_data.map(x => moving_average(x["heartrate"], 1000));
const pr_averaged = rider_data.map(x => moving_average(x['watts'], 1000));
const vel_averaged = rider_data.map(x => moving_average(x['velocity'], 1000));
const cad_averaged = rider_data.map(x => moving_average(x['cadence'], 1000));

export let draw_rider_view = split_point => {
    let y = 50;
    
    noStroke();
    fill(255);

    // distance order
    let distance = rider_data.map((x, i) => {
        return [i, x['distance'][Math.floor(split_point * x['distance'].length)]];
    }).slice(1);

    distance.sort((a, b) => a[1] - b[1]);

    // put de gendt at the start throughout
    distance = [[0, 0]].concat(distance);

    for (let j = 0; j < rider_data.length; j++) {
        const [i, _] = distance[j];
        // For each rider, output their name and statistics
        const name = rider_names[i];
        const data = rider_data[i];

        text(name, 10, y);
        y += 10;

        const watts = pr_averaged[i][Math.floor(split_point * pr_averaged[i].length)];

        if (watts !== null && watts !== undefined) {
            rect(10, y, watts/3, 10);
            y += 10;
            text(Math.floor(watts.toString()) + " W", 175, y);
            y += 10;
        }

        if (hr_averaged[i] !== undefined) {
            const hr = hr_averaged[i][Math.floor(split_point * hr_averaged[i].length)];

            if (hr !== undefined) {
                rect(10, y, hr, 10);
                y += 10;
                text(Math.floor(hr.toString()) + " bpm", 175, y);
                y += 10;
            } else {
                y += 20;
            }
        }

        if (vel_averaged[i] !== undefined) {
            const vel = vel_averaged[i][Math.floor(split_point * vel_averaged[i].length)];

            if (vel !== undefined) {
                rect(10, y, vel * 3.6 * 2, 10);
                y += 10;
                text(Math.floor((vel*3.6).toString()) + " km/h", 175, y);
                y += 10;
            } else {
                y += 20;
            }
        }

        if (cad_averaged[i] !== undefined) {
            const cad = cad_averaged[i][Math.floor(split_point * cad_averaged[i].length)];

            if (cad !== undefined) {
                rect(10, y, cad, 10);
                y += 10;
                text(Math.floor((cad).toString()) + " rpm", 175, y);
                y += 10;
            } else {
                y += 20;
            }
        }

        y += 10;
        
    }
}
