import callGeoCode from './firebase-auth.js'

//side nav and modal initializer
document.addEventListener('DOMContentLoaded', () => {
    let elem = document.querySelector('.sidenav');
    let instance = new M.Sidenav(elem);
    const modal = document.querySelectorAll('.modal');
    M.Modal.init(modal);
})

$(document).ready(function(){
    $('.parallax').parallax();
});
document.getElementById('feed-desk').addEventListener('click', () => loadItems());
document.getElementById('feed-mobile').addEventListener('click', () => loadItems());
document.getElementById('attraction-desk').addEventListener('click', () => loadAttractions());
document.getElementById('attraction-mobile').addEventListener('click', () => loadAttractions());
document.getElementById('account-details').addEventListener('click', async () => { accountDetails()});
document.getElementById('account-details-mobile').addEventListener('click', async () => { accountDetails()});

//Variables that store data
let responseRestaurant = [];
let responseAttraction = [];
let likes = [];
let likes1 = [];
let likedRestaurants = ``;
let likedAttractions = ``;
let weather = ``;
let weatherIcon = ``;
let temp;
let type;

//landing Page functions
export default function landingPage() {
    document.getElementById('logged-in-content').innerHTML = `<h4 class="center">Welcome to SwiftTrip!</h4>    
                                                                <div class="parallax-container logged-out">
                                                                    <div class="parallax"><img src="images/dusk.jpg" style="transform: translate3d(-40%, 150px, 0px); opacity: 1;"></div>
                                                                </div>
                                                              <p>Explore Chapel Hill to the fullest extent possible. The Restaurants
                                                              tab will show you food within the area while the Attractions tab
                                                              will let you find the perfect place to spend your evening! We have 
                                                              shown the occupancy of each location so you can stay socially distant 
                                                              during the pandemic, while still enjoying the town! Your account 
                                                              tab will mark locations that you have saved, and you can update user 
                                                              info if required.</p>
                                                                <div class="parallax-container logged-out">
                                                                    <div class="parallax"><img src="images/tower.jpg" style="transform: translate3d(-40%, 150px, 0px); opacity: 1;"></div>
                                                                </div>`
    $("#logged-in-content").ready(function(){
        $('.parallax').parallax();
    });
}

//Main Attactions Page
export async function loadAttractions() {
    document.getElementById('logged-in-content').innerHTML = `
    <div class="center" style:"height: 100%">
        <h4>Loading...</h4>
        <div class="preloader-wrapper big active center">
            <div class="spinner-layer spinner-blue-only">
                <div class="circle-clipper left">
                    <div class="circle"></div>
                </div>
                <div class="gap-patch">
                    <div class="circle"></div>
                </div>
                <div class="circle-clipper right">
                    <div class="circle"></div>
                </div>
            </div>
        </div>
    </div>`;
    let credentials = auth.currentUser;
    let user = await firestore.collection('users').doc(credentials.uid).get();
    let userData = user.data();
    likes1 = userData.favorites1;
    if(responseAttraction.length === 0 ){
        const getWeather = firebase.functions().httpsCallable('getWeather');
        await getWeather().then(result => {
            type = result.data.weather[0].main;
            temp = Math.round(((result.data.main.temp - 273.15) * 9/5) + 32);
        })
        const getAttraction = firebase.functions().httpsCallable('getAttractions');
        await getAttraction().then(result => {
            responseAttraction = result.data.body;
        });
    }
    let html = `<h4>Attractions</h4>
                <div>
                    ${weatherHtml()}
                </div>`;
    responseAttraction.forEach(attraction => {
        let toAdd = loadAttractionElement(attraction);
        html += toAdd;
        if(likes1.includes(attraction.attractionId.toString())) {
            likedAttractions += toAdd;
        }
    })
    document.getElementById('logged-in-content').innerHTML = html;
    document.querySelectorAll(".add-favorite1").forEach(item => {
        item.addEventListener('click', event => {
            addToFavorites1(event.currentTarget.id);
        });
    })
    document.querySelectorAll(".direction").forEach(item => {
        item.addEventListener('click', event => {
            getDirections(event.currentTarget.id);
        });
    })
    let image = document.querySelectorAll('.materialboxed');
    let imageInstance = M.Materialbox.init(image);
}

//render attractions page
function loadAttractionElement(attraction) {
    return `<div class="card small" id="card-${attraction.attractionId}">
        <div class="card-image">
            <img class="materialboxed responsive-img" src="${attraction.image[0]}">
           <span class="card-title activator black">${attraction.name} | ${attraction.popularTime}% Occupied</span>
        </div>
        <div class="card-content">
            <p>${attraction.street}</p>
            <p>${attraction.type}</p>
        </div>
        <div id="likes-${attraction.attractionId}"class="card-action">
            ${genLikeHtml1(attraction.attractionId)}
        </div>
        <div class="card-reveal">
            <span class="card-title grey-text text-darken-4">${attraction.name}<i class="material-icons right">close</i></span>
            <p>${attraction.street}</p>
            <div class="row">
                <div class="col s12 m4">
                    <h6>Information</h6>
                    <p><i class="material-icons-outlined left">reviews</i> Overall Rating: ${attraction.rating}/5</p>
                    <p><i class="material-icons-outlined left">groups</i> Currently ${attraction.popularTime}% Occupied</p>
                    <a target="_blank" href="http://www.${attraction.website}"><i class="material-icons-outlined left">language</i>Website</a>
                    <p><i class="material-icons-outlined left">restaurant</i> Cuisine: ${attraction.type}</p>
                </div>
                <div class="col s12 m4">
                    <h6>Map</h6>
                    <iframe class="center" width="275" style="border:0" loading="lazy" allowfullscreen
                        src="https://www.google.com/maps/embed/v1/place?key=APIKEY&q=place_id:${attraction.placeId}">
                    </iframe>
                </div>
                <div class="col s12 m4" id="direction-${attraction.placeId}">
                    <a id="${attraction.placeId}" class="waves-effect blue btn direction center"><i class="material-icons-outlined left">directions</i>Directions</a>
                </div>
            </div>
        </div>
    </div><br>`;
}   

//attraction like html
function genLikeHtml1(id) {
    if(likes1.includes(id.toString())) {
        return `<a id="${id}" class="add-favorite1">Remove from Favorites</a>`;
    } else {
        return `<a id="${id}" class="add-favorite1">Add to Favorites</a>`;
    }
}

//like an attraction and push to db
async function addToFavorites1(id) {
    let credentials = auth.currentUser;
    let user = await firestore.collection('users').doc(credentials.uid).get();
    if (user) {
        let userData = user.data();
        likes1 = userData.favorites1;
        let html = document.getElementById('likes-'+id);
        if(likes1.includes(id.toString())) {
            let index = likes.indexOf(id.toString());
            likes1.splice(index, 1);
            html.innerHTML = `<a id="${id}" class="add-favorite1">Add to Favorites</a>`;
        } else {
            likes1.push(id);
            html.innerHTML = `<a id="${id}" class="add-favorite1">Remove from Favorites</a>`;
        }
        document.querySelectorAll(".add-favorite1").forEach(item => {
            item.addEventListener('click', event => {
                addToFavorites1(event.currentTarget.id);
            })
        })
        firestore.collection('users').doc(credentials.uid).update({favorites1: likes1});
    }
}

//Main Feed Page
export async function loadItems() {
    document.getElementById('logged-in-content').innerHTML = `
    <div class="center" style:"height: 100%">
        <h4>Loading...</h4>
        <div class="preloader-wrapper big active center">
            <div class="spinner-layer spinner-blue-only">
                <div class="circle-clipper left">
                    <div class="circle"></div>
                </div>
                <div class="gap-patch">
                    <div class="circle"></div>
                </div>
                <div class="circle-clipper right">
                    <div class="circle"></div>
                </div>
            </div>
        </div>
    </div>`;
    let credentials = auth.currentUser;
    let user = await firestore.collection('users').doc(credentials.uid).get();
    let userData = user.data();
    likes = userData.favorites;
    if(responseRestaurant.length === 0 ){
        const getWeather = firebase.functions().httpsCallable('getWeather');
        await getWeather().then(result => {
            type = result.data.weather[0].main;
            temp = Math.round(((result.data.main.temp - 273.15) * 9/5) + 32);
        })
        const getItems = firebase.functions().httpsCallable('getItems');
        await getItems().then(result => {
            responseRestaurant = result.data.body;
        });
    }
    let html = `<h4>Restaurant</h4>
                <div>
                    ${weatherHtml()}
                </div>`;
    responseRestaurant.forEach(restaurant => {
        let toAdd = loadRestaurantElement(restaurant);
        html += toAdd;
        if(likes.includes(restaurant.retaurantId.toString())) {
            likedRestaurants += toAdd;
        }
    })
    document.getElementById('logged-in-content').innerHTML = html;
    document.querySelectorAll(".add-favorite").forEach(item => {
        item.addEventListener('click', event => {
            addToFavorites(event.currentTarget.id);
        });
    })
    document.querySelectorAll(".direction").forEach(item => {
        item.addEventListener('click', event => {
            getDirections(event.currentTarget.id);
        });
    })
    let image = document.querySelectorAll('.materialboxed');
    let imageInstance = M.Materialbox.init(image);
}

//generate the card layout
function loadRestaurantElement(restaurant) {
    return `<div class="card small" id="card-${restaurant.retaurantId}">
        <div class="card-image">
            <img class="materialboxed " src="${restaurant.image[0]}">
           <span class="card-title activator black">${restaurant.name} | ${restaurant.popularTime}% Occupied</span>
        </div>
        <div class="card-content">
            <p>${restaurant.street}</p>
            <p>${restaurant.type}</p>
        </div>
        <div id="likes-${restaurant.retaurantId}"class="card-action">
            ${genLikeHtml(restaurant.retaurantId)}
        </div>
        <div class="card-reveal">
            <span class="card-title grey-text text-darken-4">${restaurant.name}<i class="material-icons right">close</i></span>
            <p>${restaurant.street}</p>
            <div class="row">
                <div class="col s12 m4">
                    <h6>Information</h6>
                    <p><i class="material-icons-outlined left">reviews</i> Overall Rating: ${restaurant.rating}/5</p>
                    <p><i class="material-icons-outlined left">groups</i> Currently ${restaurant.popularTime}% Occupied</p>
                    <a target="_blank" href="http://www.${restaurant.website}"><i class="material-icons-outlined left">language</i>Website</a>
                    <p><i class="material-icons-outlined left">restaurant</i> Cuisine: ${restaurant.type}</p>
                </div>
                <div class="col s12 m4">
                    <h6>Map</h6>
                    <iframe
                        class="center"
                        width="275"
                        style="border:0"
                        loading="lazy"
                        allowfullscreen
                        src="https://www.google.com/maps/embed/v1/place?key=APIKEY&q=place_id:${restaurant.placeId}">
                    </iframe>
                </div>
                <div class="col s12 m4" id="direction-${restaurant.placeId}">
                    <a id="${restaurant.placeId}" class="waves-effect blue btn direction center"><i class="material-icons-outlined left">directions</i>Directions</a>
                </div>
            </div>
        </div>
    </div><br>`;
}   

//generate logic for rendering like button
function genLikeHtml(id) {
    if(likes.includes(id.toString())) {
        return `<a id="${id}" class="add-favorite">Remove from Favorites</a>`;
    } else {
        return `<a id="${id}" class="add-favorite">Add to Favorites</a>`;
    }
}

//add to restaurt to favorites and update db
async function addToFavorites(id) {
    let credentials = auth.currentUser;
    let user = await firestore.collection('users').doc(credentials.uid).get();
    if (user) {
        let userData = user.data();
        likes = userData.favorites;
        let html = document.getElementById('likes-'+id);
        if(likes.includes(id.toString())) {
            let index = likes.indexOf(id.toString());
            likes.splice(index, 1);
            html.innerHTML = `<a id="${id}" class="add-favorite">Add to Favorites</a>`;
        } else {
            likes.push(id);
            html.innerHTML = `<a id="${id}" class="add-favorite">Remove from Favorites</a>`;
        }
        document.querySelectorAll(".add-favorite").forEach(item => {
            item.addEventListener('click', event => {
                addToFavorites(event.currentTarget.id);
            })
        })
        firestore.collection('users').doc(credentials.uid).update({favorites: likes});
    }
}

//get directions from directions api, call through firebase functions
async function getDirections(origin) {
    document.getElementById('direction-'+origin).innerHTML = `<div class="center">
                                                                <div class="preloader-wrapper small active">
                                                                    <div class="spinner-layer spinner-blue-only">
                                                                        <div class="circle-clipper left">
                                                                            <div class="circle"></div>
                                                                        </div>
                                                                        <div class="gap-patch">
                                                                            <div class="circle"></div>
                                                                        </div>
                                                                        <div class="circle-clipper right">
                                                                            <div class="circle"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>`;
    let credentials = auth.currentUser;
    let user = await firestore.collection('users').doc(credentials.uid).get();
    let destination = user.data().placeId;
    const getDirectionFromGoogle = firebase.functions().httpsCallable('getDirections');
    let directions = await getDirectionFromGoogle({origin: destination, destination: origin});
    let time = directions.data.routes[0].legs[0].duration.text;
    let miles = directions.data.routes[0].legs[0].distance.text;
    let mainRoad = directions.data.routes[0].summary;
    document.getElementById('direction-'+origin).innerHTML = `<h6>Fastest Route</h6>
                                                              <p><i class="material-icons-outlined left">schedule</i> ${time}</p>
                                                              <p><i class="material-icons-outlined left">map</i> ${miles}</p>
                                                              <p><i class="material-icons-outlined left">add_road</i> via ${mainRoad}</p>`
}

//account details page and helper functions
async function accountDetails() {
    likedAttractions = ``;
    likedRestaurants = ``;
    await loadItems();
    await loadAttractions();
    let credentials = auth.currentUser;
    let user = await firestore.collection('users').doc(credentials.uid).get();
    if (user) {
        let userData = user.data();
        likes = userData.favorites;
        document.getElementById("logged-in-content").innerHTML = `
        <h4 class="center">Welcome ${userData._name}!</h4>
        <form id="details-form">
            <div class="input-field">
                 <i class="material-icons-outlined prefix">badge</i>
                <input type="text" id="detail-name" required>
            </div>
            <div class="input-field">
                <i class="material-icons-outlined prefix">email</i>
                <input disabled type="email" id="detail-email" required>
            </div>
            <div class="input-field">
                <i class="material-icons-outlined prefix">contact_mail</i>
                <input type="text" id="detail-address" required>
            </div>
            <div class="input-field">
                <i class="material-icons-outlined prefix">cake</i>
                <input type="text" id="detail-age" required>
            </div>
            <button class="btn waves-effect blue darken-4">Update</button>
            <div id="update-status"></div>
            <br>
        </form>
        <h4 class="center">Favorite Restaurants</h4>
        ${likedRestaurants}
        <h4 class="center">Favorite Attractions</h4>
        ${likedAttractions}
        <br>`;
        let image = document.querySelectorAll('.materialboxed');
        let imageInstance = M.Materialbox.init(image);
        document.querySelectorAll(".add-favorite").forEach(item => {
            item.addEventListener('click', event => {
                removeFromFavorites(event.currentTarget.id, "r");
            })
        })
        document.querySelectorAll(".add-favorite1").forEach(item => {
            item.addEventListener('click', event => {
                removeFromFavorites(event.currentTarget.id, "a");
            })
        })
        document.querySelectorAll(".direction").forEach(item => {
            item.addEventListener('click', event => {
                getDirections(event.currentTarget.id);
            })
        })
        document.getElementById("detail-name").value = userData._name;
        document.getElementById("detail-age").value = userData._age;
        document.getElementById("detail-address").value = userData.mailing_address;
        document.getElementById("detail-email").value = credentials.email;
        document.getElementById('details-form').addEventListener('submit', async function(event) {
            event.preventDefault();
            let name = document.getElementById('detail-name').value;
            let _address = document.getElementById('detail-address').value;
            let age = document.getElementById('detail-age').value;
            let geoCode = await callGeoCode(_address.replace(/\s/g, '+')); 
            firestore.collection('users').doc(credentials.uid).update({
                mailing_address : _address,
                _name: name,
                _age : age,
                placeId: geoCode
            }).then(() => {
                document.getElementById("update-status").innerHTML = `<p class="green-text">Update successful!</p>`;
            })
        })
    }
}

//remove location from favorites from account page
async function removeFromFavorites(id, type) {
    let credentials = auth.currentUser;
    let user = await firestore.collection('users').doc(credentials.uid).get();
    if (user) {
        let userData = user.data();
        if(type === "r") {
            if(likes.includes(id.toString())) {
                let index = likes.indexOf(id.toString());
                likes.splice(index, 1);
                document.getElementById("card-" + id).remove();
            }
            firestore.collection('users').doc(credentials.uid).update({favorites: likes});
        } else if(type === "a") {
            if(likes1.includes(id.toString())) {
                let index = likes1.indexOf(id.toString());
                likes1.splice(index, 1);
                document.getElementById("card-" + id).remove();
            }
            firestore.collection('users').doc(credentials.uid).update({favorites1: likes1});
        }
    }
}

//weather html
function weatherHtml() {
    if(type === "Thunderstorm") {
        return `<p>Weather Tip: <i class="fas fa-poo-storm"></i> ${temp}°F | Grab your umbrella it will be raining hard!</p>`
    } else if (type === "Drizzle") {
        return `<p>Weather Tip: <i class="fas fa-cloud-rain"></i> ${temp}°F | You may encounter a light drizzle.</p>`
    } else if (type === "Rain") { 
        return `<p>Weather Tip: <i class="fas fa-cloud-showers-heavy"></i> ${temp}°F | Grab your umbrella it will be raining.</p>`
    } else if (type === "Snow") {
        return `<p>Weather Tip: <i class="far fa-snowflake"></i> ${temp}°F | Drive carefully snow has made the road slick!</p>`
    } else if (type === "Atmosphere") {
        return `<p>Weather Tip: <i class="fas fa-smog"></i>> ${temp}°F | Drive carefully fog has made visibility low.</p>`
    } else if (type === "Clear") { 
        return `<p>Weather Tip: <i class="far fa-sun"></i> ${temp}°F | Grab your sunglasses for the clear skies!</p>`
    } else if (type === "Clouds") {
        return `<p>Weather Tip: <i class="fas fa-cloud"></i> ${temp}°F | Don't let the gloom of the clouds dampen your day.</p>`
    }
}