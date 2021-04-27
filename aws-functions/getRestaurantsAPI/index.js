const AWS = require('aws-sdk')
const dynamodb = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient()
const { default: axios } = require("axios");

exports.handler = (event) => {
    AWS.config.update({
      region: "us-east-1",
    });
    getData().then(data => {
        addToDB(data);
    });
    
};

function addToDB(serverData) {
    let number = 0; 
    serverData.forEach(function(restaurant) {
        let params = {
            Item : {
                "restaurantId": number,
                "name": restaurant.title,
                "type": JSON.stringify(restaurant.categoryName),
                "steet": restaurant.street,
                "location" : JSON.stringify(restaurant.location),
                "popularTime" : JSON.stringify(restaurant.popularTimesHistogram),
                "reviews" : JSON.stringify(restaurant.reviewsDistribution),
                "image" : JSON.stringify(restaurant.imageUrls),
                "website" : restaurant.website,
                "rating": restaurant.totalScore,
                "placeId": restaurant.placeId,
            },
            TableName : 'restaurant'
        };
        docClient.put(params, function(err, data) {
            if(err) { console.log("error: " + err) } else { console.log("success: " + data) }
        });
        number++;
    });
}

async function getData() {
    let result = await axios({
        method: 'GET',
        url: 'https://api.apify.com/v2/actor-tasks/TASK/runs/last/dataset/items?token=APIKEY'
    });
    return result['data'];
}