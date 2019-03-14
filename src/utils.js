/**
 * Useful utility functions for computing averages, mins and maxes in each bar etc.
 * 
 * @author Matthew Else <matthew.else@cl.cam.ac.uk>
 */

import {bars} from "./settings";

export let avg_in_bar = (data, bar) => {
    const start = Math.floor((bar / bars) * data.length);
    const length = Math.floor(data.length / bars);
    let sum = 0;

    for (let i = 0; i < length; i++) {
        sum += data[i + start];
    }

    return sum / length;
}

export let first_in_bar = (data, bar) => {
    const start = Math.floor((bar / bars) * data.length);
    return data[start];
}

export let max_without_zeros = (data) => {
    let max = 0;

    for (let bar = 0; bar < bars; bar++) {
        let avg = avg_in_bar(data, bar);

        if (avg != 0 && avg > max) {
            max = avg;
        }
    }

    return max;
}

export let min_without_zeros = (data) => {
    let min = 1000000;

    for (let bar = 0; bar < bars; bar++) {
        let avg = avg_in_bar(data, bar);

        if (avg != 0 && avg < min) {
            min = avg;
        }
    }
    
    return min;
}

export const moving_average = (data, count) => {
    if (data === undefined) {
        return undefined;
    }

    let averaged = [];

    const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
    const average_count = count;
    let window = [];
    for (let i = 0; i < data.length; i++) {
        window.push(data[i]);
        
        if (i > average_count) {
            averaged.push(average(window));
            window.shift();
        }
    }

    return averaged;
}

export const compute_gradients = (rider) => {
    let gradients = [];

    // compute the gradients for a particular rider
    for (let index = 0; index < rider['distance'].length - 1; index++) {
        const d_distance = rider['distance'][index + 1] - rider['distance'][index];
        const d_height = rider['altitude'][index + 1] - rider['altitude'][index];

        let gradient = d_height / d_distance;
        if (gradient < -0.15) { gradient = -0.15; }
        if (gradient > 0.15) { gradient = 0.15; }

        gradients.push(gradient);
    }

    return gradients;
}
