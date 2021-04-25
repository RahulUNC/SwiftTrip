const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

exports.handler = async (event) => {
    AWS.config.update({
      region: "us-east-1",
    });
    let response = {};
    try {
        let time = new Date();
        await dynamodb.scan({TableName: 'attraction'}).promise().then(data => {
            let returnArr = [];
            data['Items'].forEach(attraction => {
                let item =  AWS.DynamoDB.Converter.unmarshall(attraction);
                let updatedItem = {};
                try {
                    updatedItem = {
                        name: item.name,
                        street: item.steet + ', Chapel Hill, NC',
                        attractionId: item.attractionId,
                        popularTime: JSON.parse(item.popularTime)[getDayPrefix(time.getDay())][time.getHours()].occupancyPercent,
                        type: JSON.parse(item.type),
                        rating: item.rating,
                        website: item.website,
                        image: JSON.parse(item.image),
                        placeId: item.placeId
                    };
                } catch (e) {
                    updatedItem = {
                        name: item.name,
                        street: item.steet + ', Chapel Hill, NC',
                        attractionId: item.attractionId,
                        popularTime: 100,
                        type: JSON.parse(item.type),
                        rating: item.rating,
                        website: item.website,
                        image: JSON.parse(item.image),
                        placeId: item.placeId
                    };
                }
                returnArr.push(updatedItem);
            });
            response = {
                statusCode: 200,
                body: returnArr.sort((i, j) => i.popularTime - j.popularTime)
            };
            return response;
        });
    } catch (e) {
        response = {
            statusCode: 400,
            body: e
        };
    }
    return response;
};

function getDayPrefix(day) {
    if(day === 0) {
        return 'Su';
    } else if (day === 1) {
        return 'Mo';
    } else if (day === 2) {
        return 'Tu';
    } else if (day === 3) {
        return 'We';
    } else if (day === 4) {
        return 'Th';
    } else if (day === 5) {
        return 'Fr';
    } else {
        return 'Sa';
    }
}