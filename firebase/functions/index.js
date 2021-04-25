const functions = require("firebase-functions");
const axios = require("axios");

exports.getItems = functions.https.onCall(async (data, context) => {
  const get = await axios({
    method: 'GET',
    url: 'https://z394mxj370.execute-api.us-east-1.amazonaws.com/dev/getrestaurants'
  });
  return get["data"];
});

exports.getGeoCode = functions.https.onCall(async (data, context) => {
  const get = await axios({
    method: 'GET',
    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${data.address}&key=APIKEY`
  });
  return get["data"];
});

exports.getDirections = functions.https.onCall(async (data, context) => {
  const get = await axios({
    method: 'GET',
    url: `https://maps.googleapis.com/maps/api/directions/json?origin=place_id:${data.origin}&destination=place_id:${data.destination}&key=APIKEY`
  });
  return get["data"];
});

exports.getAttractions = functions.https.onCall(async (data, context) => {
  const get = await axios({
    method: 'GET',
    url: 'https://z394mxj370.execute-api.us-east-1.amazonaws.com/dev/getattraction'
  });
  return get["data"]
});

exports.getWeather = functions.https.onCall(async (data, context) => {
  const get = await axios({
    method: 'GET',
    url: "https://api.openweathermap.org/data/2.5/weather?q=chapel+hill&appid=APIKEY"
  });
  return get["data"];
});