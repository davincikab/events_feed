// get event model
const { eventLocationModel, eventDescriptionModel, eventMedia} = require("../../models/events/eventsModel");
const { request } = require("express");

exports.getAllEvents = function(req, res) {
    eventLocationModel.getAllEvents(function(err, events) {
        if(err) {
            res.send(err);
        }

        // specify other 
        let allEvents = [];

        events.forEach(event => {
            let myEvent = allEvents.find(singleEvent => event.event_id == singleEvent.event_id);
            if(myEvent) {
                myEvent.contribution.push(event);
            } else {
                event.contribution = [];
                allEvents.push(event);
            }
            
        });

        res.send(allEvents)
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

exports.getEventById = function(req, res) {
    // get the route params
    let title = req.params.event_name;
    let id = req.params.event_id;

    console.log("Event title");
    console.log(title);

    eventLocationModel.getEventById(title, id, function(err, response) {
        if(err) {
            res.send(err);
        }

        console.log(response);
        // res.send(response);
        let context = {
            event:response[0],
            contribution:response.slice(1,),
            user:req.user,
            section:'event_details'
        }
        // let usersDescription = ["david", "maina"];
        res.render('pages/event_detail', context);
    });

}

// event description
exports.createEventDescription = function(req, res) {
    // console.log(req.body);
    // console.log(req.files.photo.name);
    console.log("Files");
    let imagePath = './uploads/images/' + req.files.photo0.name;
    let imageFile = req.files.photo0;

    let videoPath = './uploads/videos/' + req.files.video.name;
    let videoFile = req.files.video;

    let imageFiles = Object.values(req.files);
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
            eventDescription.is_contribution = false;
    
            console.log(eventDescription);
    
            // update the description object
            eventDescriptionModel.createEventDescription(eventDescription, function(err, response){
                if(err) {
                    res.send(err);
                }
                
                console.log(response);
                // 
                insertMediaFiles(response.insertId, imageFiles, req.body.event_id, req.user.username);
                res.send(response);
            });
        });
    });

  
}

function insertMediaFiles(description_id, imageFiles, event_id, username) {
    console.log("Saving Media Files");

    imageFiles.forEach(image => {
        let path = './uploads/images/' + image.name;

        image.mv(path, function(err) {
            if(err) {
                return res.status(500).send(err);
            }

            let type = image.mimetype.includes('image') ? 'image': 'video';
            let media = {
                event_id:event_id,
                description_id:description_id,
                type:type,
                added_by:username,
                file:path
            }

            let event = new eventMedia(media);

            // create the media
            eventMedia.createMedia(event, function(err, response) {
                if(err) {
                    console.log("Error while updating file");
                    return res.status(500).send(err);
                }

                console.log("Updated File")
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
