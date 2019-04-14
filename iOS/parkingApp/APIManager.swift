//
//  APIManager.swift
//  parkingApp
//
//  Created by Nicholas Volpe on 4/13/19.
//  Copyright © 2019 Nick Volpe. All rights reserved.
//

import Foundation


/*
 Never got this working. I decided it wasnt worth the time to fight with the REST api right now.
 */

class APIManager: NSObject {
    
    static let sharedInstance = APIManager()
    
    static func requestData() {
        
        let headers = [
            "Authorization": "Basic aWMuc3RhZ2Uuc2ltLmRldmVsb3A6ZGV2,Basic UHVibGljQWNjZXNzOnVWZWVNdWl1ZTRrPQ==",
            "User-Agent": "PostmanRuntime/7.11.0",
            "Accept": "*/*",
            "Host": "auth.aa.cityiq.io",
            "accept-encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "cache-control": "no-cache",
            "Postman-Token": "7acfd0f4-8fe0-4326-a966-f412c0f67edf"
        ]
        
        let request = NSMutableURLRequest(url: NSURL(string: "https://auth.aa.cityiq.io/oauth/token?grant_type=client_credentials")! as URL,
                                          cachePolicy: .useProtocolCachePolicy,
                                          timeoutInterval: 10.0)
        request.httpMethod = "GET"
        request.allHTTPHeaderFields = headers
        
        let session = URLSession.shared
        let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
            if (error != nil) {
                print(error)
            } else {
                let httpResponse = response as? HTTPURLResponse
                print(httpResponse)
            }
        })
        
        dataTask.resume()
    }
}
