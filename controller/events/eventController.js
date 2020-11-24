// get event model
const { eventLocationModel, eventDescriptionModel} = require("../../models/events/eventsModel");

exports.getAllEvents = function(req, res) {
    eventLocationModel.getAllEvents(function(err, events) {
        if(err) {
            res.send(err);
        }

        res.send(events)
    });
}

exports.createEventLocation = function(req, res) {
    eventLocationModel.createEventLocation(function(err, eventLocation) {
        if(err) {
            res.send(err);
        }

        res.send(eventLocation);
    });
}


// event description
exports.createEventDescription = function(req, res) {
    let imagePath = '/upload/' + rqs.files.photo.name;
    imageFile = req.files.photo

    imageFiles.mv(imagePath, function(err) {
        if(err) {
            return res.status(500).send(err);
        } 

        let eventDescription = new eventDescriptionModel(req.body);

        console.log(eventDescription);

        eventDescription.photo = imagePath;
        eventDescription.video = "";

        // update the description object
        eventDescriptionModel.createEventDescription(eventDescription, function(err, response){
            if(err) {
                res.send(err);
            }
    
            res.send(eventLocation);
        });
    });
}

exports.updateEventDescription = function(req, res) {
    let imagePath = '/upload/' + rqs.files.photo.name;
    imageFile = req.files.photo

    imageFiles.mv(imagePath, function(err) {
        if(err) {
            return res.status(500).send(err);
        } 

        let eventDescription = new eventDescriptionModel(req.body);

        console.log(eventDescription);

        eventDescription.photo = imagePath;
        eventDescription.video = "";

        // update the description object
        eventDescriptionModel.updateEventDescription(eventDescription, function(err, response){
            if(err) {
                res.send(err);
            }
    
            res.send(eventLocation);
        });
    });
}