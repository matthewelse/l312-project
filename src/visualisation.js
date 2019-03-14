/**
 * Main visualisation code - contains the setup and draw functions for p5.js.
 * 
 * @author Matthew Else <matthew.else@cl.cam.ac.uk>
 */
import Tone from 'tone';

import {rider_data} from './data';
import FilledGraph from './filledgraph';
import {draw_rider_view} from './rider_view';
import {duration} from './settings';
import {moving_average, compute_gradients} from './utils';

import 'p5';

const leader = rider_data[0];
const distance = leader.distance;
const altitude = leader.altitude;

const gradient_averaged = moving_average(compute_gradients(leader), 500);

const alt_graph = new FilledGraph(distance, altitude, 50, 200, 500, 100);

window.setup = () => {
    console.log("Constructing altitude graph");
    alt_graph.updatePosition(0, windowHeight);
    alt_graph.updateSize(windowWidth, windowWidth * 0.5);
    alt_graph.left_color = color(0xff, 0xff, 0xff);
    alt_graph.right_color = color(0xdd,0xdd,0xdd);

    console.log('Creating canvas');
    createCanvas(windowWidth,windowHeight);
}

let running = false;
let last_gradient = 0;

window.draw = () => {
    // this is (somewhat) nicely synchronised to the music
    const time = Tone.Transport.seconds - Tone.TransportTime("4:0:0").toSeconds();
    let split_point = time / (duration * 60);
    if (split_point < 0) { split_point = 0; }
    if (split_point > 1) { split_point = 1; }
    
    background(color(0x00, 0x9c, 0xc7));

    noStroke();
    beginShape();

    // Mountain thing that grows and falls as the gradient increases and decreases.
    fill(color(255, 100));

    let gradient_index = Math.floor(split_point * gradient_averaged.length);    
    let gradient = gradient_averaged[gradient_index];
    gradient = isNaN(gradient) ? last_gradient : gradient;
    last_gradient = gradient;

    vertex(0, height);
    vertex(width, height);
    vertex(0.7 * width, height - (height * (gradient*7 + 0.15)));

    endShape(CLOSE);

    if (running) {
        alt_graph.changeSplitPoint(split_point);
    } else {
        alt_graph.changeSplitPoint(0.0);
    }

    alt_graph.draw();

    draw_rider_view(split_point);
}

Tone.Transport.schedule(function(time) {
	Tone.Draw.schedule(function(){
        running = true;
	}, time)
}, "2:0:0")
