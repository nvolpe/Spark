import UIKit
import MapboxCoreNavigation
import MapboxNavigation
import MapboxDirections
import Mapbox

/*
 
This is largely sample code I pulled from MapBox's API examples.
I have cut out the cruft I dont need and added fake datasets to get my point across.
I <3 Mapping software.

 */


class ViewController: UIViewController, MGLMapViewDelegate, CLLocationManagerDelegate, NavigationMapViewDelegate, NavigationViewControllerDelegate {
    
    var mapView: NavigationMapView?
    var currentRoute: Route? {
        get {
            return routes?.first
        }
        set {
            guard let selected = newValue else { routes?.remove(at: 0); return }
            guard let routes = routes else { self.routes = [selected]; return }
            self.routes = [selected] + routes.filter { $0 != selected }
        }
    }
    var routes: [Route]? {
        didSet {
            guard let routes = routes, let current = routes.first else { mapView?.removeRoutes(); return }
            mapView?.showRoutes(routes)
            mapView?.showWaypoints(current)
        }
    }
    
    var startButton: UIButton?
    var locationManager = CLLocationManager()
    
    //MARK: - Lifecycle Methods
    override func viewDidLoad() {
        super.viewDidLoad()
        
        locationManager.delegate = self
        locationManager.requestWhenInUseAuthorization()
        
        mapView = NavigationMapView(frame: view.bounds)
        mapView?.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        mapView?.userTrackingMode = .follow
        mapView?.delegate = self
        mapView?.navigationMapViewDelegate = self
        
        view.addSubview(mapView!)
        
        startButton = UIButton()
        startButton?.setTitle("Route me!", for: .normal)
        startButton?.translatesAutoresizingMaskIntoConstraints = false
        startButton?.backgroundColor = .green
        startButton?.contentEdgeInsets = UIEdgeInsets(top: 10, left: 20, bottom: 10, right: 20)
        startButton?.addTarget(self, action: #selector(tappedButton(sender:)), for: .touchUpInside)
        startButton?.isHidden = true
        view.addSubview(startButton!)
        startButton?.bottomAnchor.constraint(equalTo: self.view.safeAreaLayoutGuide.bottomAnchor, constant: -20).isActive = true
        startButton?.centerXAnchor.constraint(equalTo: self.view.centerXAnchor).isActive = true
        view.setNeedsLayout()
        
        Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { (timer) in
            // do stuff 3 seconds later. I am using a simulator with a fake location.
            // location updates wont fire :( I need to trigger manually.
            self.getDestination()
        }
    }
    
    //overriding layout lifecycle callback so we can style the start button
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        startButton?.layer.cornerRadius = startButton!.bounds.midY
        startButton?.clipsToBounds = true
        startButton?.setNeedsDisplay()
    }
    
    @objc func tappedButton(sender: UIButton) {
        guard let route = currentRoute else { return }
        // For demonstration purposes, simulate locations if the Simulate Navigation option is on.
        let navigationService = MapboxNavigationService(route: route, simulating: .always)
        let navigationOptions = NavigationOptions(navigationService: navigationService)
        let navigationViewController = NavigationViewController(for: route, options: navigationOptions)
        navigationViewController.delegate = self
        
        // Route me to the awesomeness.
        present(navigationViewController, animated: true, completion: nil)
    }

    func getDestination() {
        
        // Developer note: fake locations for now!
        // My server side code would generate the best parking location to present to the user.
    
        let littleItaly = CLLocationCoordinate2D(latitude: 32.72429002861491, longitude: -117.16859724978133)
        let cortezHill = CLLocationCoordinate2D(latitude: 32.7209077439066, longitude: -117.15818774421552)
        let petcoPark = CLLocationCoordinate2D(latitude: 32.70954919516812, longitude: -117.15644246683928)
        
        let coordinates = [
            littleItaly,
            cortezHill,
            petcoPark
        ]
        
        // lets randomize it between these 3 for super fun times.
        // or we could shuffle through options.
        
        // add original destination to the map, so they have a reference of how far they are
        
        requestRoute(destination: coordinates[0])
    }
    
    func requestRoute(destination: CLLocationCoordinate2D) {
        
        // Mapbox provides very powerful routing tools.
        // People looking for a spot will have peace of mind with audio route directions.
        
        let userLocation = CLLocation(latitude: 32.717990, longitude: -117.168095)
        let userWaypoint = Waypoint(location: userLocation, heading: mapView?.userLocation?.heading, name: "user")
        let destinationWaypoint = Waypoint(coordinate: destination)
        
        let options = NavigationRouteOptions(waypoints: [userWaypoint, destinationWaypoint])
        
        Directions.shared.calculate(options) { (waypoints, routes, error) in
            guard let routes = routes else { return }
            self.routes = routes
            self.startButton?.isHidden = false
            self.mapView?.showRoutes(routes)
            self.mapView?.showWaypoints(self.currentRoute!)
        }
    }
}
