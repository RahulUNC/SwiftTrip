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
    serverData.forEach(function(attraction) {
        let params = {
            Item : {
                "attractionId": number,
                "name": attraction.title,
                "type": JSON.stringify(attraction.categoryName),
                "steet": attraction.street,
                "location" : JSON.stringify(attraction.location),
                "popularTime" : popularTime(attraction),
                "reviews" : JSON.stringify(attraction.reviewsDistribution),
                "image" : JSON.stringify(attraction.imageUrls),
                "website" : attraction.website,
                "rating": attraction.totalScore,
                "placeId": attraction.placeId,
            },
            TableName : 'attraction'
        };
        docClient.put(params, function(err, data) {
            if(err) { console.log("error: " + err) } else { console.log("success: " + data) }
        });
        number++;
    });
}

function popularTime(attraction) {
    try {
        return JSON.stringify(attraction.popularTimesHistogram)
    } catch (e) {
        return {}
    }
}

async function getData() {
    let result = await axios({
        method: 'GET',
        url: 'https://api.apify.com/v2/datasets/APIKEY/items'
    });
    return result['data'];
}