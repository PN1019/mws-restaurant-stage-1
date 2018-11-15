/**
 * Common database helper functions.
 */
//const RESTAURANT_REVIEWS_OBJ_STORE = 'restaurantReviews';

class DBHelper {

  /**
   * Database URL.
   * Function will return URL to fetch restaurant data
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants/`;
  }
/**
   * @description
   * This function will create object store name 'restaurantList' inside
   * 'restaurant-reviews' db and stores promise in a dbPromise variable
   */
  static initIDB() {
    this.dbPromise = idb.open('restaurant-reviews', 1, function (upgradeDb) {
      var reviewsStore = upgradeDb.createObjectStore('restaurantReviews', {
        keyPath: 'id'
      });
      
      reviewsStore.createIndex('restaurantId', 'restaurant_id');


    });
  }

  /**
   * @description
   * This function will return all the restaurant data from indexedDB.
   */
  static getRestaurantsDataFromIDBCache() {
    return this.dbPromise.then(db => {
      var tx = db.transaction('restaurantReviews');
      var reviewsStore = tx.objectStore('restaurantReviews');
      return reviewsStore.getAll();
    })
  }
  
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
	  var self = this;
     DBHelper.getRestaurantsDataFromIDBCache().then(restaurants => {
      /**
       * Check if restaurant data is already cached in Indexed DB.
       */
      if (restaurants.length > 0) {
        callback(null, restaurants);
	  }else {
		  /**
         * If data is not cached then make a network request.
         */
	  //Change from XHR To Fetch API
    fetch(DBHelper.DATABASE_URL)
    .then(response => {
          //If request is unsuccessfull then throw error.
          if (!response.ok) {
            throw new Error(response.statusText);
          }
		  //convert data in response received from server to json.
          return response.json();
	})
    .then(restaurants => {
          //processing the json data sent from the previous callback function.
          DBHelper.addRestaurantsToIDB(restaurants);
          callback(null, restaurants);
         }).catch(error => {
          callback(error, null);
    });
  }
	 });
 }
 /**
     * @description This method will add restaurant data to IDB
     * @param {string} restaurants - Array of restaurants
     */
    static addRestaurantsToIDB (restaurants) {
      var self = this;
      restaurants.forEach(restaurant => {
        self.dbPromise.then(db => {
          var tx = db.transaction(['restaurantReviews'], 'readwrite');
          var reviewsStore = tx.objectStore('restaurantReviews');
          reviewsStore.put(restaurant);
          return tx.complete;
        });
      });
    }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id,callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
	   //Changing map marker color to Red from blue
	   const redIcon = new L.Icon({
      iconUrl: './img/marker-icon-2x-red.png',
      shadowUrl: './img/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    // https://leafletjs.com/reference-1.3.0.html#marker  
    let marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {
	   icon:redIcon,
	   title: restaurant.name,
       alt: restaurant.name,
       url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
  

}

