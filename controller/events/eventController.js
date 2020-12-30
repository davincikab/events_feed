// get event model
const { eventLocationModel, eventDescriptionModel, eventMedia} = require("../../models/events/eventsModel");
const { request } = require("express");

exports.getAllEvents = function(req, res) {
    eventLocationModel.getAllEvents(function(err, events) {
        if(err) {
            res.send(err);
        }

        eventMedia.getAllMedia(function(err, mediaEntries) {
            if(err) {
                res.send(err);
            }

            let allEvents = events.reduce((r, a) => {
                r[a.event_id] =  r[a.event_id] || [];
                r[a.event_id].push(a);

                return r;
            }, Object.create(null));

            let descriptionMedia = mediaEntries.reduce((r, a) => {
                r[a.description_id] =  r[a.description_id] || [];
                r[a.description_id].push(a);

                return r;
            }, Object.create(null));

            // combine the two datasets
            for (const key in allEvents) {
                let event = allEvents[key]
                console.log(event);
                event.forEach(ev => {
                    let media = descriptionMedia[ev.description_id];

                    if(media) {
                        ev.media =  media;
                    } else {
                        ev.media = [];
                    }
                });
            }

            // convert the object to flat array
            let eventsArray = [];
            for (const key in allEvents) {
                let event = allEvents[key];

                let mainEvent = event.find(ev => ev.is_contribution == 0);
                contribution = event.filter(ev => ev.is_contribution == 1);

                mainEvent.contribution = contribution;

                eventsArray.push(mainEvent);
            }



            res.send(eventsArray);
        });

        // specify other 
        // let allEvents = [];
        // let event_ids = events.map(event => event.event_id);
        // event_ids = [... new Set(event_ids)];

        // event_ids.forEach(eventId => {

        // });

        // events.forEach(event => {
        //     let myEvent = allEvents.find(singleEvent => event.event_id == singleEvent.event_id);
        //     if(myEvent) {
        //         myEvent.contribution.push(event)
        //         myEvent.media
        //     } else {
        //         event.contribution = [];
        //         // event.media = []
        //         allEvents.push(event);
        //     }
            
        // });
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
    // console.log("Files");
    // let imagePath = './uploads/images/' + req.files.photo0.name;
    // let imageFile = req.files.photo0;

    // let videoPath = './uploads/videos/' + req.files.video.name;
    // let videoFile = req.files.video;

    let imageFiles = Object.values(req.files);
    let { event_id } = req.body;
    let { username } = req.user;

    console.log("Create a Description");
    console.log(req.body);
    let eventDescription = new eventDescriptionModel(req.body);
    // eventDescription.is_contribution = eventDescription.contribution != undefined ? eventDescription.is_contribution : false;

    // update the description object
    eventDescriptionModel.createEventDescription(eventDescription, function(err, response){
        if(err) {
            res.send(err);
        }
        
        console.log(response);
        // 
        insertMediaFiles(response.insertId, imageFiles, event_id, username);
        res.send(response);
    });

//     videoFile.mv(videoPath, function(err) {
//         if(err) {
//             return res.status(500).send(err);
//         }

//         imageFile.mv(imagePath, function(err) {
//             if(err) {
//                 return res.status(500).send(err);
//             } 
    
//             // create event description instance
//             let eventDescription = new eventDescriptionModel(req.body);
    
//             // update event description properties
//             eventDescription.photo = imagePath;
//             eventDescription.video = videoPath;
//             eventDescription.added_by = req.user.username;
//             eventDescription.is_contribution = false;
    
//             console.log(eventDescription);
    
//             // update the description object
//             eventDescriptionModel.createEventDescription(eventDescription, function(err, response){
//                 if(err) {
//                     res.send(err);
//                 }
                
//                 console.log(response);
//                 // 
//                 insertMediaFiles(response.insertId, imageFiles, req.body.event_id, req.user.username);
//                 res.send(response);
//             });
//         });
//     });

  
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

    // let imagePath = './uploads/images/' + req.files.photo.name;
    // let imageFile = req.files.photo;

    // let videoPath = './uploads/videos/' + req.files.video.name;
    // let videoFile = req.files.video;

    let imageFiles = Object.values(req.files);

    let eventDescription = new eventDescriptionModel(req.body);
    let { description_id, event_id }= req.body;
    let { username } = req.user;
   
    eventDescriptionModel.updateEventDescription(eventDescription, description_id, function(err, response) {
        if(err) {
            res.send(err);
        }

        // deleteMediaFiles(description_id);
        insertMediaFiles(description_id, imageFiles, event_id, username);
        res.send(response);
    });

    // videoFile.mv(videoPath, function(err) {
    //     if(err) {
    //         return res.status(500).send(err);
    //     }

    //     // move file to directory on your server
    //     imageFile.mv(imagePath, function(err) {
    //         if(err) {
    //             return res.status(500).send(err);
    //         } 

    //         // event description instance
    //         let eventDescription = new eventDescriptionModel(req.body);

    //         // update event description properties
    //         eventDescription.photo = imagePath;
    //         eventDescription.video = eventDescription.video = videoPath;

    //         let description_id = req.body.description_id;

    //         // update the description object
    //         eventDescriptionModel.updateEventDescription(eventDescription, description_id, function(err, response){
    //             if(err) {
    //                 res.send(err);
    //             }
        
    //             res.send(response);
    //         });
    //     });
    // });
}

function deleteMediaFiles(description_id) {
    eventMedia.deleteMedia(description_id, function(err, response) {
        if(err) {
            res.send(err);
            return;
        }

        return;
    });
}