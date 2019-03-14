/**
 * Main music construction script - iterates over each bar, deciding what to play based on the data.
 * 
 * @author Matthew Else <matthew.else@cl.cam.ac.uk>
 */

import Tone from 'tone';
import {rider_data} from './data';
import {SampleLibrary} from './instruments';
import {bpm, minutes, bars} from './settings';
import {avg_in_bar, min_without_zeros, max_without_zeros} from './utils';

Tone.Transport.bpm.value = bpm;

// This isn't intended to be interactive, so take a large latency hit in return for better playback.
Tone.context.latencyHint = 'playback'

if (bars * 4 / bpm != minutes) {
    console.error('Time doesn\'t match up (', bars * 4 / bpm, "vs", minutes);
}

// We'll move between these four chords during the piece to make things a bit more interesting
const note_choices = [
    ["C", "E", "G"],
    ["F", "A", "C"],
    ["G", "B", "D"],
    ["C", "E", "G"],
]
let notes = note_choices[0];

// Load sampled instruments
const instruments = SampleLibrary.load({
    instruments: ["cello", "clarinet", "piano", "contrabass", "snaredrum", "saxophone", "xylophone", "violin"]
});

const clarinet = instruments["clarinet"].sync().toMaster();
const piano = instruments["piano"].sync().toMaster();
const bass = instruments["contrabass"].sync().toMaster();
const snare = instruments["snaredrum"].sync().toMaster();
const sax = instruments["saxophone"].sync().toMaster();
const xylo = instruments["xylophone"].sync().toMaster();
const flute = instruments['violin'].sync().toMaster();

clarinet.release = 1;
piano.release = 1;
snare.release = 1;
sax.release = 1;
xylo.release = 3;
flute.release = 3;

bass.volume.value = -20;
piano.volume.value = -30;
clarinet.volume.value = -30;
snare.volume.value = -30;
sax.volume.value = -20;
xylo.volume.value = -10;
flute.volume.value = -20;

// Prepare a particular bar of the piece, and schedule it to the write time in the piece.
function prepare_bar (i, bar) {
    // more principled approach: map each parameter to a specific thing
    // 
    // map heart rate to volume
    // map speed to rhythm
    // map altitude to number of instruments
    return function (time) {
        let rider = rider_data[i];

        const hr = rider['heartrate'];
        const pr = rider['watts'];
        const vel = rider['velocity'];
        const altitude = rider['altitude'];
        const distance = rider['distance'];

        const max_hr = hr !== undefined ? max_without_zeros(hr) : 150;
        const min_hr = hr !== undefined ? min_without_zeros(hr) : 149;

        const max_alt = max_without_zeros(altitude);
        const min_alt = min_without_zeros(altitude);

        const max_vel = max_without_zeros(vel);
        const min_vel = min_without_zeros(vel);
        
        const section = Math.floor((bar) / (bars / 4));
    
        notes = note_choices[section];

        // 1. figure out the volume:
        const hr_avg = hr !== undefined ? avg_in_bar(hr, bar) : 149.5;
        const pwr_avg = avg_in_bar(pr, bar);
        const vel_avg = avg_in_bar(vel, bar);

        // how do we map to volume? maybe -10 to + 10 or -20 to +10?
        // what we  actually want is the block max and min, not overall max and min
        let volume = 20 * (hr_avg - min_hr) / (max_hr - min_hr) - 10;
        volume = isNaN(volume) ? 0 : volume;

        // maybe this shouldn't affect the master volume?
        if (i == 0) {
            Tone.Master.volume.linearRampToValueAtTime(volume, time + Tone.Time(bar.toString() + ':0:0'));
        }

        // 2. number of instruments
        const altitude_avg = avg_in_bar(altitude, bar);

        // instr_count is essentially the percentage of the way from our min altitude to our max altitude
        const instr_count = (altitude_avg - min_alt) / (max_alt - min_alt);

        // pick a note for each rider
        const note = notes[i % notes.length];

        // these are all pretty arbitrary instrument choices, and any creative decisions can go here
        ///
        /// WARNING: CREATIVITY REQUIRED
        ///
        if (instr_count >= 0) {
            clarinet.triggerAttackRelease(note + "3", "2n", time);
            clarinet.triggerAttackRelease(note + "3", "2n", time + Tone.Time("0:2:0"));
            clarinet.triggerAttackRelease(note + "3", "2n", time + Tone.Time("0:4:0"));
            clarinet.triggerAttackRelease(note + "3", "2n", time + Tone.Time("0:6:0"));
        }
        if (instr_count >= 0.01 && bar > 2) {
            for (let i = 0; i < 8; i++) {
                piano.triggerAttackRelease(notes[0] + "3", "4n", Tone.TimeBase({"4n": i}) + time);
            }
        }
        if (instr_count >= 0.2) {
            bass.triggerAttackRelease(notes[0] + "2", "1n", time);
        }
        if (instr_count >= 0.3) {
            xylo.triggerAttackRelease(note + "4", "8n", time);
            xylo.triggerAttackRelease(note + "4", "8n", time + Tone.Time("0:1:0"));
            xylo.triggerAttackRelease(note + "4", "8n", time + Tone.Time("0:6:0"));
            xylo.triggerAttackRelease(note + "4", "8n", time + Tone.Time("0:7:0"));
        }
        if (instr_count >= 0.5) {
            sax.triggerAttackRelease(note + "3", "2n", time);
            sax.triggerAttackRelease(note + "3", "2n", time + Tone.Time("0:2:0"));
            sax.triggerAttackRelease(note + "3", "2n", time + Tone.Time("0:6:0"));
        }
        if (instr_count >= 0.7) {
            flute.triggerAttackRelease(note + "3", "2n", time);
            flute.triggerAttackRelease(note + "3", "2n", time + Tone.Time("0:6:0"));
        }


        // if we're over 300W, we'll bring in a snare drum part... this is completely arbitrary and will
        // need changing if this is made into a proper thing
        // only show the power data for de gendt
        // if (pwr_avg > 300 && i == 0) {
        //     snare.triggerAttackRelease("E5", "8n", time);

        //     // again, hard coded values for now, but we'll improve this another time.
        //     snare.volume.linearRampToValueAtTime((pwr_avg - 500) / 20, time); 
        // }

        const vel_range = (vel_avg - min_vel) / (max_vel - min_vel);

        if (bar >= 3) {
            if (vel_range <= 0.1) {
                for (let i = 0; i < 8; i++) {
                    snare.triggerAttackRelease("E5", "16n", Tone.TimeBase({"4n": i}) + time);
                }
            } else if (vel_range <= 0.33) {
                for (let i = 0; i < 2; i++) {
                    snare.triggerAttackRelease("E5", "16n", Tone.TimeBase({"4n": i}) + time);
                }
                for (let i = 0; i < 4; i++) {
                    snare.triggerAttackRelease("E5", "32n", Tone.TimeBase({"4n": 2}) + Tone.TimeBase({"8n": i}) + time);
                }
            }
            else {
                for (let i = 0; i < 2; i++) {
                    snare.triggerAttackRelease("E5", "16n", Tone.TimeBase({"4n": i}) + time);
                }
                for (let i = 0; i < 2; i++) {
                    snare.triggerAttackRelease("E5", "32n", Tone.TimeBase({"4n": 2}) + Tone.TimeBase({"8n": i}) + time);
                }
                for (let i = 0; i < 4; i++) {
                    snare.triggerAttackRelease("E5", "64n", Tone.TimeBase({"4n": 3}) + Tone.TimeBase({"8n": i}) + time);
                }
            }
        }

        ///
        /// NOTE: END OF CREATIVITY
        ///
    }
}

// prepare the piece as a whole.
let prepare = () => {
    for (let i = 0; i < rider_data.length; i++) {
        for (let bar = 0; bar < bars; bar++) {
            Tone.Transport.scheduleOnce(prepare_bar(i, bar), (bar + 1).toString() + "m");
        }
    }
}

let playing = false;
let prepared = false;

document.getElementById('body').onclick = () => {
    if (playing) {
        Tone.Transport.pause();
    } else {
        if (!prepared) {
            prepare();
            prepared = true;
        }

        console.log("Starting the composition.");
        Tone.Transport.start();
    }

    playing = !playing;
}
