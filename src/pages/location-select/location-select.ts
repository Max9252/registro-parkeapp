import { NavController, Platform, ViewController } from 'ionic-angular';
import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { ConnectivityProvider } from '../../providers/connectivity/connectivity';

declare var google;

@Component({
  selector: 'page-location-select',
  templateUrl: 'location-select.html',
})
export class LocationSelectPage {

  @ViewChild('map') mapElement1: ElementRef;
  @ViewChild('pleaseConnect') pleaseConnect1: ElementRef;
  mapElement: any;
  pleaseConnect: any;
  latitude: number;
  longitude: number;
  autocompleteService: any;
  placesService: any;
  query: string = '';
  places: any = [];
  searchDisabled: boolean;
  saveDisabled: boolean;
  location: any;
  marker: any;
  map: any;
  mapInitialised: boolean = false;
  mapLoaded: any;
  mapLoadedObserver: any;
  currentMarker: any;
  geocoder: any;
  address: any;
  apiKey: string = "AIzaSyAEbSVmk04yeKvE9pG1p4ORpq7wzI4eysc";

  constructor(public navCtrl: NavController, public zone: NgZone, public platform: Platform, public geolocation: Geolocation, public viewCtrl: ViewController, public connectivityService: ConnectivityProvider) {
    this.searchDisabled = true;
    this.saveDisabled = true;
  }

  ionViewDidLoad(): void {


    let mapLoaded = this.init(this.mapElement1.nativeElement, this.pleaseConnect1.nativeElement).then(() => {

      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(this.map);
      this.searchDisabled = false;
    });

  }

  loadGoogleMaps(): Promise<any> {

    return new Promise((resolve) => {

      if (typeof google == "undefined" || typeof google.maps == "undefined") {

        console.log("Google maps JavaScript needs to be loaded.");
        this.disableMap();

        if (this.connectivityService.isOnline()) {

          window['mapInit'] = () => {

            this.initMap().then(() => {
              resolve(true);
            });

            this.enableMap();
          }

          let script = document.createElement("script");
          script.id = "googleMaps";

          if (this.apiKey) {
            script.src = 'http://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit&libraries=places';
          } else {
            script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
          }

          document.body.appendChild(script);

        }
      } else {

        if (this.connectivityService.isOnline()) {
          this.initMap();
          this.enableMap();
        }
        else {
          this.disableMap();
        }

        resolve(true);
      }

      this.addConnectivityListeners();

    });

  }

  init(mapElement: any, pleaseConnect: any): Promise<any> {

    this.mapElement = mapElement;
    this.pleaseConnect = pleaseConnect;
    return this.loadGoogleMaps();
  }

  initMap(): Promise<any> {

    this.mapInitialised = true;

    return new Promise((resolve) => {

      this.geolocation.getCurrentPosition().then((position) => {

        let latLng = this.getLatLng(position.coords.latitude, position.coords.longitude);

        let mapOptions = {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        let location = {
          lat: null,
          lng: null,
          address: null
        };
        this.geocoder = new google.maps.Geocoder();
        this.geocoder.geocode({
          'latLng': latLng
        }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              this.zone.run(() => {
                location.lat = lat;
                location.lng = lng;
                location.address = results[0].formatted_address;
                this.saveDisabled = false;
                this.location = location;
                this.setAddress(results[0].formatted_address);
              });
            } else {
              console.log('no hay resultados');
            }
          } else {
            console.log('Geocoder failed due to: ' + status);
          }
        });

        let marker = this.createMarker(latLng);
        this.map = new google.maps.Map(this.mapElement, mapOptions);
        marker.setMap(this.map);
        resolve(true);

      });
    });
  }

  disableMap(): void {

    if (this.pleaseConnect) {
      this.pleaseConnect.style.display = "block";
    }

  }

  enableMap(): void {
    if (this.pleaseConnect) {
      this.pleaseConnect.style.display = "none";
    }
  }

  addConnectivityListeners(): void {

    this.connectivityService.watchOnline().subscribe(() => {

      setTimeout(() => {

        if (typeof google == "undefined" || typeof google.maps == "undefined") {
          this.loadGoogleMaps();
        }
        else {
          if (!this.mapInitialised) {
            this.initMap();
          }

          this.enableMap();
        }

      }, 2000);

    });

    this.connectivityService.watchOffline().subscribe(() => {

      this.disableMap();

    });

  }

  createMarker(position: any) {
    let marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      position: position
    });
    google.maps.event.addListener(marker, 'dragend', () => {
      let position = marker.getPosition();
      let lng = position.lng();
      let lat = position.lat();
      let location = {
        lat: null,
        lng: null,
        address: null
      };
      var latlng = new google.maps.LatLng(lat, lng);
      this.geocoder = new google.maps.Geocoder();
      this.geocoder.geocode({
        'latLng': latlng
      }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            this.zone.run(() => {
              location.lat = lat;
              location.lng = lng;
              location.address = results[0].formatted_address;
              this.saveDisabled = false;
              this.location = location;
              this.setAddress(results[0].formatted_address);
            });
          } else {
            console.log('no hay resultados');
          }
        } else {
          console.log('Geocoder failed due to: ' + status);
        }
      })
    });
    google.maps.event.addListener(marker, 'click', function() {
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        alert(this.query);
      }
    });
    return marker;
  }

  getLatLng(lat: any, lng: any) {
    let latLng = new google.maps.LatLng(lat, lng);
    return latLng;
  }

  selectPlace(place) {

    this.places = [];

    let location = {
      lat: null,
      lng: null,
      name: place.name,
      address: place.formatted_address
    };

    this.placesService.getDetails({ placeId: place.place_id }, (details) => {

      this.zone.run(() => {

        location.name = details.name;
        location.lat = details.geometry.location.lat();
        location.lng = details.geometry.location.lng();
        location.address = details.formatted_address
        this.saveDisabled = false;

        let latLng = this.getLatLng(location.lat, location.lng);

        let marker = this.createMarker(latLng);
        this.map.setCenter(latLng);
        marker.setMap(this.map);

        this.location = location;
        this.query = location.address;

      });

    });

  }

  searchPlace() {

    this.saveDisabled = false;

    if (this.query.length > 0 && !this.searchDisabled) {

      let config = {
        types: ['geocode'],
        input: this.query
      }

      this.autocompleteService.getPlacePredictions(config, (predictions, status) => {

        if (status == google.maps.places.PlacesServiceStatus.OK && predictions) {

          this.places = [];

          predictions.forEach((prediction) => {
            this.places.push(prediction);
          });
        }

      });

    } else {
      this.places = [];
    }

  }

  save() {
    this.viewCtrl.dismiss(this.location);
  }

  close() {
    this.viewCtrl.dismiss();
  }

  setAddress(string: any) {
    this.query = string;
    console.log(string);
  }


}
