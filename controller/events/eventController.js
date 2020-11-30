// get event model
const { eventLocationModel, eventDescriptionModel} = require("../../models/events/eventsModel");
const { request } = require("express");

exports.getAllEvents = function(req, res) {
    eventLocationModel.getAllEvents(function(err, events) {
        if(err) {
            res.send(err);
        }

        res.send(events)
    });
}

exports.createEventLocation = function(req, res) {
    // console.log(req.body);
    let eventLocation = new eventLocationModel(req.body.data);
    eventLocation.added_by = req.user.username;
    // console.log(eventLocation);

    // create the event location
    eventLocationModel.createEvent(eventLocation, function(err, response) {
        if(err) {
            res.send(err);
        }

        res.send(response);
    });
}


// event description
exports.createEventDescription = function(req, res) {
    // console.log(req.body);
    // console.log(req.files.photo.name);

    let imagePath = './uploads/images/' + req.files.photo.name;
    let imageFile = req.files.photo;

    let videoPath = './uploads/videos/' + req.files.video.name;
    let videoFile = req.files.video;

    videoFile.mv(videoPath, function(err) {
        if(err) {
            return res.status(500).send(err);
        }

        imageFile.mv(imagePath, function(err) {
            if(err) {
                return res.status(500).send(err);
            } 
    
            // create event description instance
            let eventDescription = new eventDescriptionModel(req.body);
    
            // update event description properties
            eventDescription.photo = imagePath;
            eventDescription.video = videoPath;
            eventDescription.added_by = req.user.username;
    
            console.log(eventDescription);
    
            // update the description object
            eventDescriptionModel.createEventDescription(eventDescription, function(err, response){
                if(err) {
                    res.send(err);
                }
        
                res.send(response);
            });
        });
    });

  
}

exports.updateEventDescription = function(req, res) {
    // console.log(req.body);
    // console.log(req.files.photo.name);

    let imagePath = './uploads/images/' + req.files.photo.name;
    let imageFile = req.files.photo;

    let videoPath = './uploads/videos/' + req.files.video.name;
    let videoFile = req.files.video;

    videoFile.mv(videoPath, function(err) {
        if(err) {
            return res.status(500).send(err);
        }

        // move file to directory on your server
        imageFile.mv(imagePath, function(err) {
            if(err) {
                return res.status(500).send(err);
            } 

            // event description instance
            let eventDescription = new eventDescriptionModel(req.body);

            // update event description properties
            eventDescription.photo = imagePath;
            eventDescription.video = eventDescription.video = videoPath;
            // eventLocation.added_by = req.user.username;

            let description_id = req.body.description_id;

            // update the description object
            eventDescriptionModel.updateEventDescription(eventDescription, description_id, function(err, response){
                if(err) {
                    res.send(err);
                }
        
                res.send(response);
            });
        });
    });
}
