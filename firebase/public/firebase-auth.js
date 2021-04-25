import landingPage from './script.js'

//log user out
document.getElementById('logout').addEventListener('click', event => {
    event.preventDefault();
    logoutUser();
})
document.getElementById('logout-mobile').addEventListener('click', event => {
    event.preventDefault();
    logoutUser();
})
function logoutUser() {
    auth.signOut().then(() => {});
}

//sign up new user
const newUser = document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    let email = document.getElementById('signup-email').value;
    let pass = document.getElementById('signup-password').value;
    let name = document.getElementById('signup-name').value;
    let _address = document.getElementById('signup-address').value;
    let age = document.getElementById('signup-age').value;
    let geoCode = await callGeoCode(_address.replace(/\s/g, '+')); 
    auth.createUserWithEmailAndPassword(email, pass).then(loggedInCredential => {
        return firestore.collection('users').doc(loggedInCredential.user.uid).set({
            mailing_address : _address,
            _name: name,
            _age : age,
            favorites: [],
            favorites1: [],
            placeId: geoCode
        });
    }).then(() => {
        M.Modal.getInstance(document.getElementById('modal-signup')).close();
        document.getElementById('signup-form').reset();
        document.getElementById('logout-error').innerHTML = ``;
    }).catch(e => {
        document.getElementById('logout-error').innerHTML = `<p class='red-text'>Invalid feild information or an account with this email address may already exist!</p>`;
    })
})

//call geocode api via firebase functions
export default async function callGeoCode(_address) {
    const getGeoCode = firebase.functions().httpsCallable('getGeoCode');
    let geocode = getGeoCode({address: _address}).then(result => {
        return result.data.results[0].place_id
    })
    return geocode;
} 

//log in user
const logInUser = document.getElementById('login-form').addEventListener('submit', event => {
    event.preventDefault();
    let email = document.getElementById('login-email').value;
    let pass = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, pass).then(loginResult => {
        M.Modal.getInstance(document.getElementById('modal-login')).close();
        document.getElementById('login-form').reset();
        document.getElementById('login-error').innerHTML = ``;
    }).catch(e => {
        document.getElementById('login-error').innerHTML = `<p class='red-text'>Invalid login information!</p>`;
    })
})

//change content based on auth status
auth.onAuthStateChanged(currentUser => {
    let loggedIn = document.querySelectorAll('.logged-in');
    let loggedOut = document.querySelectorAll('.logged-out');
    if(currentUser != null) {
        landingPage();
        loggedIn.forEach(loggedInUser => {loggedInUser.style.display = 'block';});
        loggedOut.forEach(loggedOutUser => {loggedOutUser.style.display = 'none'});
    } else {
        document.getElementById('logged-in-content').innerHTML = "";   
        loggedIn.forEach(loggedInUser => {loggedInUser.style.display = 'none';});
        loggedOut.forEach(loggedOutUser => {loggedOutUser.style.display = 'block'});
    }
})
