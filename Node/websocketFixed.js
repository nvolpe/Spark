/* Before Begining save script as websocket.js, then:
   1. input your client credentials in cityCredentials.js and make appropriate modifications to line 14
   2. verify you have node.js installed with this command: $ node -v
   3. verify you have node package manager installed with this command: $ npm -v
   4. navigate to the directory you have saved this file.  
   5. install node-fetch and ws packages with this command: $ npm install node-fetch ws
   6. in the directory that this file is saved, run this command: $ node websocket.js
*/

// Note this websocket demo returns Parking Related Events only.  
// If you do not intend to use the Parking API, please change the eventTypes and headers for the approrpiate API.

// cityCredentials.js contains all the necessary credentials for reference
const credentials = require("./cityCredentials")
/* be sure to input your credentials to the cityCredentials.js file.  
the following declaration establishes your credentials */

const fetch = require('node-fetch')
const WebSocket = require('ws')
const btoa = str => new Buffer.from(str).toString('base64')

// requests function formats requests via node.js
function request(url, headers, body) {
  let options = { headers: headers, body:body}
  return fetch(url, options).then(result => {
      if (result.status>=400) return(result.statusText) 
      else return result.text().then(txt => {
          try { return JSON.parse(txt) }
          catch (err) { return txt }
      })
  })
}

async function requestAuth() {   
  
  // REST requests necessary for getting the token - first layer of authentication
  let result = (await request(credentials.uaa+'oauth/token?grant_type=client_credentials',{authorization:'Basic '+btoa(credentials.developer)}))
  let token = result.access_token
  
  // REST request for metadata
  let queryURL = credentials.metadataservice+'metadata/assets/search?q=eventTypes:PKIN'
  let headersIn = {authorization: 'Bearer '+token,'predix-zone-id':credentials.parking}

  return headersIn
}

async function connetToLocationId(locationId, description) {   

  let headersIn = await requestAuth()

  // WebSocket Connection  
  let ws = new WebSocket(credentials.websocket, {headers: headersIn})

  ws.on('open', function open() {
    console.log('listening')  
    console.log(`started at : ${Date.now()}`)

    ws.send(JSON.stringify({locationUid:locationId,eventTypes:["PKIN","PKOUT"]}));
  })
  ws.on('message', data => {

    var obj = JSON.parse(data);

    console.log(`====================`)
    console.log(`=======================`)
    console.log(`==========================`)

    console.log(`event occurred at : ${Date.now()}`)

    console.log(`Event From : ${locationId} - ${description} - VERIFY THIS IS MATCHED`)
    console.log(`Expected : ${locationId} Got: ${obj.locationUid}`)

    const googleMapsUrl = formatGoogleMapsURL(obj.properties.geoCoordinates)

    if (obj.locationUid != locationId) {
      console.error("Event from the WRONG location zone!!")
      console.error(obj)
      console.error(obj)
      console.error(googleMapsUrl)
    } else {
      console.log(obj)
      console.log(googleMapsUrl)
    }

    console.log(`==========================`)
    console.log(`=======================`)
    console.log(`====================`)
  })
  ws.on('error', err => console.log(err))
}

function formatGoogleMapsURL(geoCoordinates) {

  let allCoords = geoCoordinates.split(",");
  let firstCoords = allCoords[0].split(":");
  let lat = firstCoords[0];
  let lng = firstCoords[1];
  
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

// assets
// connetToLocationId("435ocv1ke67jl8azlcd", "achilles coffee shop")
// connetToLocationId("0ig1lu2387jjjl6ofr9q", "donut bar")
// connetToLocationId("wguhem9oapjklir2a3", "14th street west side near albertsons and brew place")
// connetToLocationId("7jylpsbvnejjiytb0ub", "coffee shop i owe a drink at")
connetToLocationId("wu6paffkvqsjixlhrvz", "9th and J NW spot")

// 435ocv1ke67jl8azlcd achilles


// connetToLocationId('369c4c1c-8637-4170-acbe-5c09f189f5af',"irish place")
// connetToLocationId('0d99e159-272c-4ca4-8fa4-779266fd73b1',"irish place")

// ideas
// format google url
// use zones 1 - x to determine which zone it is in?
// remove invalid zoneids 
// https://www.npmjs.com/package/point-in-geopolygon