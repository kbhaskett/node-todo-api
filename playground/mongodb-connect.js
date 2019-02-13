const MmongoClient = require('mongodb').MongoClient;

MmongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to Mongo DB Server', err);
    }
    console.log('Connected to Mongo DB Server');
    const db = client.db('Todo');

    db.collection('Users').insertOne({
        name: 'John Jacob',
        age: 53,
        location: 'Middle of Nowwhere'
    }, (err, result) => {
        if (err) {
            return console.log('Unable to insert into Mongo DB Server', err);
        }
        console.log(JSON.stringify(result.ops, undefined, 2));
    })

    client.close();
});