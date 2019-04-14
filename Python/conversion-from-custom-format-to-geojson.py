import os
import json
import math
from sys import argv
from pprint import pprint
from geojson import Feature, FeatureCollection, Point, Polygon


'''
1. I scraped the data from the GE light sensor API for ALL parking zones. I have that as a json file in this directory.
2. I wrote this script to parse that data into geojson features. I have that as a json file: converted_final.json.
3. I am using that output to display in a Map Viewer. The goal is to use this data and compare it to other datasets
the city has on their parking. I need to validate if those areas overlap with eachother so we are sending people
to the right location. Need all the data yo! 
'''

filename = "AllNodeLocations.json"

with open(filename) as customjson_file:
    data = json.load(customjson_file)

features = []
for node in data["content"]:
    nodeId = node["locationUid"]
    nodeCoords = node["coordinates"]
    # print(nodeId)

    coords = []

    coordArray = nodeCoords.split(",")

    listLength = len(coordArray) - 1
    firstItem = coordArray[0]

    for index, coordPair in enumerate(coordArray):
        coordPairArray = coordPair.split(":")

        latitude, longitude = map(float, (coordPairArray[0], coordPairArray[1]))
        point = Point((longitude, latitude))

        coords.append(point)

        if (index == listLength):
            lastCoordPairArray = firstItem.split(":")
            lat, lon = map(float, (lastCoordPairArray[0], lastCoordPairArray[1]))
            lastPoint = Point((lon, lat))
            coords.append(lastPoint)

    features.append(
        Feature(
            geometry = Polygon([coords]),
            properties = {
                'STATE': nodeId,
            }
        )
    )   

collection = FeatureCollection(features)
with open("converted_final.json", "w") as f:
    f.write('%s' % collection)

print("FINISHED")


