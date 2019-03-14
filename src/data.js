/**
 * Access the relevant data from the JSON sources.
 * 
 * @author Matthew Else <matthew.else@cl.cam.ac.uk>
 */

import cyril from '../data/tdf_12_2016/cyrillemoine.json';
import degendt from '../data/tdf_12_2016/degendt.json';
import greipel from '../data/tdf_12_2016/greipel.json';
import iljo from '../data/tdf_12_2016/iljo.json';

export let rider_names = ["Thomas de Gendt", "Cyril Le Moine", "Andre Greipel", "Iljo Keisse"];
export let riders = [degendt, cyril, greipel, iljo];

export let rider_data = riders.map((r) => {
    const watts = r.hasOwnProperty("watts") ? r['watts'] : r['watts_calc'];

    const start_point = 0.5;

    let rider =  {
        times: r['time'].slice(r['time'].length * start_point),
        watts: watts.slice(watts.length * start_point),
        altitude: r['altitude'].slice(r['altitude'].length * start_point),
        distance: r['distance'].slice(r['distance'].length * start_point),
        velocity: r['velocity_smooth'].slice(r['velocity_smooth'].length * start_point),
        position: r['latlng'].slice(r['latlng'].length * start_point),
        cadence: r['cadence'].slice(r['cadence'].length * start_point),
    };

    if (r['heartrate']) {
        rider.heartrate = r['heartrate'].slice(r['heartrate'].length  * start_point);
    }

    return rider;
});

console.log("Following data streams are available:")
console.log(Object.keys(rider_data[0]));

