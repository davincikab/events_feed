// get event model
const { eventLocationModel, eventDescriptionModel} = require("../../models/events/eventsModel");

exports.getAllEvents = function(req, res) {
    eventLocationModel.getAllEvents(function(err, events) {
        if(err) {
            res.send(err);
        }

        console.log("Events");
        console.log(events);

        res.send(events)
    });
}

exports.createEventLocation = function(req, res) {
    console.log(req.body);
    let eventLocation = new eventLocationModel(req.body.data);
    console.log(eventLocation);
    eventLocationModel.createEvent(eventLocation, function(err, response) {
        if(err) {
            res.send(err);
        }

        res.send(response);
    });
}


// event description
exports.createEventDescription = function(req, res) {
    console.log(req.body);
    console.log(req.files.photo.name);

    let imagePath = './uploads/' + req.files.photo.name;
    let imageFile = req.files.photo;

    imageFile.mv(imagePath, function(err) {
        if(err) {
            return res.status(500).send(err);
        } 

        let eventDescription = new eventDescriptionModel(req.body);
        eventDescription.photo = imagePath;
        eventDescription.video = "";

        console.log(eventDescription);

        // update the description object
        eventDescriptionModel.createEventDescription(eventDescription, function(err, response){
            if(err) {
                res.send(err);
            }
    
            res.send(response);
        });
    });
}

exports.updateEventDescription = function(req, res) {
    console.log(req.body);
    console.log(req.files.photo.name);

    let imagePath = './uploads/' + req.files.photo.name;
    let imageFile = req.files.photo;

    imageFile.mv(imagePath, function(err) {
        if(err) {
            return res.status(500).send(err);
        } 

        let eventDescription = new eventDescriptionModel(req.body);

        console.log(eventDescription);

        eventDescription.photo = imagePath;
        eventDescription.video = "";
        let description_id = req.body.description_id;

        // update the description object
        eventDescriptionModel.updateEventDescription(eventDescription, description_id, function(err, response){
            if(err) {
                res.send(err);
            }
    
            res.send(response);
        });
    });
}
