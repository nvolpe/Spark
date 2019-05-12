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

async function connect(asset, description) {   

  let headersIn = await requestAuth()

  console.log('Will now query for Parking events related to '+ description)
  
  // WebSocket Connection  
  let ws = new WebSocket(credentials.websocket, {headers: headersIn})

  ws.on('open', function open() {
    console.log('listening')  
    ws.send(JSON.stringify({assetUid:asset,eventTypes:["PKIN","PKOUT"]}));
  })
  ws.on('message', data => {
    var obj = JSON.parse(data);

    // if (data.locationUid != 'i7sncl0zzi7jj782339') {
    //   console.log("Event from the wrong zone!!")
    //   console.log(obj.locationUid)
    // } else {
    //   console.log(obj)
    //   console.log(description)
    //   console.log(obj.timestamp)
    //   console.log(obj.eventType)
    //   console.log(obj.assetUid)
    //   console.log(obj.properties.geoCoordinates)

    //   console.log('Time Diff:')
    //   console.log(Date.now() - obj.timestamp)
    // }


      console.log(obj)
      console.log(description)
      console.log(obj.timestamp)
      console.log(obj.eventType)
      console.log(obj.assetUid)
      console.log(obj.properties.geoCoordinates)

      console.log('Time Diff:')
      console.log(Date.now() - obj.timestamp)
  })
  ws.on('error', err => console.log(err))
}


async function connetToAssetId(assetId, locationId, description) {   

  let headersIn = await requestAuth()

  // WebSocket Connection  
  let ws = new WebSocket(credentials.websocket, {headers: headersIn})

  ws.on('open', function open() {
    console.log('listening') 
    console.log(`started at : ${Date.now()}`)
    ws.send(JSON.stringify({assetUid:assetId,eventTypes:["PKIN","PKOUT"]}));
  })
  ws.on('message', data => {
    var obj = JSON.parse(data);
    const googleMapsUrl = formatGoogleMapsURL(obj.properties.geoCoordinates[0], obj.properties.geoCoordinates[1])

    if (data.locationUid != locationId) {
      console.error("Event from the WRONG location zone!!")
      console.error(obj)
      console.error(googleMapsUrl)
    } else {
      console.log(`Event From : ${description}`)
      console.log(obj)
      console.log(googleMapsUrl)
    }
  })
  ws.on('error', err => console.log(err))
}

function formatGoogleMapsURL(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

// assets
connect("b26b1322-b6d6-4c60-b38a-d8a5897ae6f8", "irish place east")
connect('369c4c1c-8637-4170-acbe-5c09f189f5af',"irish place")
connect('0d99e159-272c-4ca4-8fa4-779266fd73b1',"irish place")

