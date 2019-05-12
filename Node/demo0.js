// Run this command: $node demo0.js
// to return the queries found in the async function demo0.
  
// For more details on simulated data please reference the API Documentation Appendix A (https://ie-cities-docs.run.aws-usw02-pr.ice.predix.io/#r_intelligent_cities_appendix_a.html)
// Your municipality will provide the necessary urls, username, password and predix zone ids

// cityiq.js sets up the requests
const cityiq = require("./cityiq.js")
// cityCredentials.js contains all the necessary credentials for reference
const credentials = require("./cityCredentials")

var fs = require('fs');

// this function is where queries can be specified.  
async function demo0 (){
    console.log('initiating demo')
    // specifies the credentials and begins authentication - see cityiq.js
    let ciq = await cityiq(credentials)  

    console.log('obtaining parking data')

    /* return all parking in events from the last 12 hours related to the camera asset found above
    timecalc is a function declared in cityiq.js. */

    // let locationId = "435ocv1ke67jl8azlcd"
    // let fileNameIn = `output/PKIN_10days_${locationId}.json`
    // let fileNameOut = `output/PKOUT_10days_${locationId}.json`

    let locationId = "f477a661-0f9c-4bc7-aa14-285bebc6a2ef"
    let fileNameIn = `output/PKIN_10days_${locationId}.json`
    let fileNameOut = `output/PKOUT_10days_${locationId}.json`

    // by Asset
    // let eventsIn = await ciq.events(credentials.parking, locationId,'assetUid','PKIN',ciq.timecalc(240))
    // let eventsOut = await ciq.events(credentials.parking, locationId,'assetUid','PKOUT',ciq.timecalc(240))

    // by Location
    let eventsIn = await ciq.events(credentials.parking, locationId,'locationUid','PKIN',ciq.timecalc(240))
    let eventsOut = await ciq.events(credentials.parking, locationId,'locationUid','PKOUT',ciq.timecalc(240))

    fs.writeFile (fileNameIn, JSON.stringify(eventsIn), function(err) {
        if (err) throw err;
        console.log('IN complete');
        }
    );

    fs.writeFile (fileNameOut, JSON.stringify(eventsOut), function(err) {
        if (err) throw err;
        console.log('OUT complete');
        }
    );

    console.log("Done")
}

// instantiates demo function to run queries
demo0()