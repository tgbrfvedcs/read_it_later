const AWS = require("aws-sdk");

//DynamoDB table name
const TableName = "read_it_later";

let awsConfig = {
  region: "eu-west-1",
  endpoint: "http://dynamodb.eu-west-1.amazonaws.com",
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESSKEY
};
AWS.config.update(awsConfig);

let docClient = new AWS.DynamoDB.DocumentClient();

const save = function(input) {
  const params = {
    TableName,
    Item: input
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.log("users::save::error - " + JSON.stringify(err, null, 2));
    } else {
      console.log("users::save::success");
    }
  });
};

const getList = async (showUnread = false) => {
  const params = {
    TableName
  };
  if (showUnread) {
    params.FilterExpression = "#ir = :bol";
    params.ExpressionAttributeNames = { "#ir": "is_read" };
    params.ExpressionAttributeValues = { ":bol": 0 };
  }
  return await docClient.scan(params).promise();
};

const randomPick = async () => {
  const allList = (await getList()).Items;
  const randomNum = Math.round(Math.random() * (allList.length - 1));
  return [allList[randomNum]];
};

const updateToIsRead = async url => {
  var params = {
    TableName,
    Key: { url },
    UpdateExpression: "set is_read = :bol",
    ExpressionAttributeValues: {
      ":bol": 1
    },
    ReturnValues: "UPDATED_NEW"
  };

  docClient.update(params, function(err, data) {
    if (err) {
      console.log("users::update::error - " + JSON.stringify(err, null, 2));
    } else {
      console.log("users::update::success " + JSON.stringify(data));
    }
  });
};

module.exports = { save, getList, randomPick, updateToIsRead };
