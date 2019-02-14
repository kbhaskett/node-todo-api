const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to Mongo DB Server', err);
    }
    console.log('Connected to Mongo DB Server');
    const db = client.db('Todo');

    db.collection('Todos').findOneAndReplace.find({
        text: 'Eat some lunch',
    }).toArray().then((docs) => {
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        if (err) {
            return console.log('Unable to insert into Mongo DB Server', err);
        }
    });

    client.close();
});