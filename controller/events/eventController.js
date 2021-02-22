// get event model
const { eventLocationModel, eventDescriptionModel, eventMedia} = require("../../models/events/eventsModel");
const userModel = require("../../models/user/userModel");
const { request } = require("express");
const { reportAccount } = require("../user/userController");

exports.getAllEvents = function(req, res) {
    if(req.user.is_admin) {
        eventLocationModel.getAllEvents(function(err, events) {
            if(err) {
                res.send(err);
            }

            addMediaFiles(events);
        });
    } else {
        eventLocationModel.getPostedEvents(function(err, events) {
            if(err) {
                res.send(err);
            }

            addMediaFiles(events);
        });
    }

    function addMediaFiles(events) {

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
                // console.log(event);
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
                if(mainEvent) {
                    let contribution = event.filter(ev => ev.is_contribution == 1);

                    mainEvent.contribution = contribution;

                    eventsArray.push(mainEvent);
                }
                
            }

            res.send(eventsArray);
        });

    }
}

exports.getUnPostedEvents = function(req, res) {
    // create the event location
    eventLocationModel.getUnPostedEvents(function(err, response) {
        if(err) {
            res.send(err);
        }

        // res.send(response);
        res.render("pages/pending_events", {
            events:response,
            user:req.user,
            section:"Pending Events"
        });
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
    let event_id = req.params.event_id;

    console.log("Event title");
    console.log(title);

    if(req.user.is_admin) {
        eventLocationModel.getEventById(title, event_id, function(err, response) {
            if(err) {
                res.send(err);
            }

            console.log(response);
            addMediaFiles(response, event_id);
            // res.send(response);
        });
    } else {
        eventLocationModel.getPostedEventById(title, event_id, function(err, response) {
            if(err) {
                res.send(err);
            }

            console.log(response);
            addMediaFiles(response, event_id);
            // res.send(response);
        });

    }

    function addMediaFiles(response, event_id) {
        eventMedia.getMediaByEventId(event_id, function(err, descriptionMedia) {
            if(err) {
                res.send(err);
            }

            // merge media to respective description id
            response.forEach(event => {
                let media = descriptionMedia.filter(mediaItem => mediaItem.description_id == event.description_id);
                
                event.media = media ? media : [];                
                return event;
            });

            let context = {
                event:response.find(event => event.is_contribution == 0),
                contribution:response.filter(event => event.is_contribution == 1),
                user:req.user,
                section:'event_details'
            }

            // res.send(context);

            // let usersDescription = ["david", "maina"];
            res.render('pages/event_detail', context);
        });
        
    }

}

exports.getUnPublishedDescription = function(req, res) {
    // create the event location
    eventDescriptionModel.getUnpublishedEventContribution(function(err, response) {
        if(err) {
            res.send(err);
        }

        res.render("pages/pending_contribution", {
            events:response,
            user:req.user,
            section:"Pending Contribution"
        });
    });
}

// event description
exports.createEventDescription = function(req, res) {
    let imageFiles = Object.values(req.files);

    let { event_id } = req.body;
    let { username } = req.user;

    console.log("Create a Description");
    console.log(req.body);
    let eventDescription = new eventDescriptionModel(req.body);

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
}

function insertMediaFiles(description_id, imageFiles, event_id, username) {
    console.log("Saving Media Files");

    return eventMedia.deleteMedia(description_id, function(err, response) {
        if(err) {
            return;
        }

        imageFiles.forEach(image => {
            let path = './uploads/images/' + image.name;

            image.mv(path, function(err) {
                if(err) {
                    console.log(err);
                    return ;
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
    });
}

exports.updateEventDescription = function(req, res) {
    let imageFiles = Object.values(req.files);
    console.log(imageFiles);

    let eventDescription = new eventDescriptionModel(req.body);
    let { description_id, event_id }= req.body;
    let { username } = req.user;
   
    eventDescriptionModel.updateEventDescription(eventDescription, description_id, function(err, response) {
        if(err) {
            res.send(err);
        }

        insertMediaFiles(description_id, imageFiles, event_id, username);
        res.send(response);
    });
}

exports.getEventDescription = function(req, res) {
    let { description_id } = req.params;

    console.log("Files")
    console.log(description_id);
    eventDescriptionModel.getDescriptionById(description_id, function(err, results) {
        if(err) {
            res.send(err);
        }

        console.log(results);
        let context = {
            user:req.user,
            section:'update event',
            event:results[0]
        };
        
        // res.send(context);
        res.render('pages/update_event', context);
    });

}

exports.addEventDescription = function(req, res) {
    let { event_name, event_id } = req.params;

    eventLocationModel.getEventById(event_name, event_id, function(err, results) {
        if(err) {
            res.send(err);
        }

        console.log(results);

        let context = {
            user:req.user,
            section:'Creat Event',
            event:{
                event_name:results[0].event_name,
                event_id:results[0].event_id,
                start_time:'',
                start_date:'',
                end_date:'',
                end_time:'',
                event_description:'',
                is_contribution:1,
            }
        }

        res.render('pages/update_event', context);
    });
}

exports.deleteEventContribution = function(req, res, next) {
    let { description_id } = req.params;
    eventDescriptionModel.deleteEventDescription(description_id, function(err, results) {
        if(err) {
            res.send(err);
        }

        eventMedia.deleteMedia(description_id, function(err, results) {
            if(err) {
                res.send(err);
            } 
            
            res.send({'message':'success'})
        });

        // res.send({'message':'success'})
    });
}

exports.deleteEventLocation = function(req, res, next) {
    let { event_id } = req.params;
    eventLocationModel.deleteEventLocation(event_id, function(err, results) {
        if(err) {
            res.send(err);
        }  

        eventDescriptionModel.deleteEventDescriptionByEventId(event_id, function(err, results) {
            if(err) {
                res.send(err);
            }  
            
            eventMedia.deleteMediaByEventId(event_id, function(err, results) {
                if(err) {
                    res.send(err);
                } 

                res.send({'message':'success'})
            });
           
        });
    });
    
}

exports.postEvent = function(req, res, next) {
    let { event_id, description_id } = req.params;
    console.log("Hitting url endpoint");

    eventLocationModel.postEvent(event_id, function(err, results) {
        if(err) {
            res.send(err);
        }  

        // update the main event description 
        eventDescriptionModel.publishEventContribution(description_id, function(err, results) {
            if(err) {
                res.send(err);
            }

            console.log(results);
            res.send({'message':'success'});
        });
        
    });
}

exports.publishContribution = function(req, res, next) {
    let { description_id } = req.params;
    eventDescriptionModel.publishEventContribution(description_id, function(err, results) {
        if(err) {
            res.send(err);
        }  

        res.send({'message':'success'});
    });
}

// dashboard
exports.dashboard = function(req, res, next) {
    // get pending contribution
    eventLocationModel.getUnPostedEvents(function(err, events) {
        if(err) {
            res.send(err);
        }

        eventDescriptionModel.getUnpublishedEventContribution(function(err, contribution) {
            if(err) {
                res.send(err);
            }

            userModel.getAllUsers(function(err, accounts) {
                if(err) {
                    res.send(err);
                }

                userModel.getReportedAccounts(function(err, reportedAccounts) {
                    if(err) {
                        res.send(err);
                    }

                    context = {
                        user:req.user,
                        unposted_events:events.length,
                        contribution:contribution.length,
                        accounts:accounts.length,
                        reportedAccounts:reportedAccounts.length,
                        section:'Dashboard'
                    };
                
                    res.render('pages/dashboard', context);  
                });
                
            });
        });
    });     
}

// 
exports.getReportedEvents = function(req, res, next) {
    eventDescriptionModel.getReportedEvents(function(err, result) {
        if(err) {
            res.send(err);
        }

        let context = {
            user:req.user,
            events:result,
            section:'Reported Events'
        };

        res.render("pages/reported_events", context);
    });
}

exports.getReportedContributions = function(req, res, next) {
    eventDescriptionModel.getReportedContributions(function(err, result) {
        if(err) {
            res.send(err);
        }

        let context = {
            user:req.user,
            events:result,
            section:'Reported Contribution'
        };

        res.render("pages/reported_contibution", context);
    })
}

// report events 
exports.reportEvent = function(req, res, next) {
    let { event_name, reason, is_contribution, description_id } = req.body;

    let report = {
        reported_by:req.user.username,
        event_name:event_name,
        reason:reason,
        is_contribution:is_contribution,
        description_id:description_id
    };

    eventDescriptionModel.reportEvent(report, function(err, result) {
        if(err) {
            res.send(err);
        } 

        res.status(200).send({message:'success'});
    });

}

// delete event report
exports.deleteEventReport = function(req, res, next) {
    let { report_id } = req.params;

    eventDescriptionModel.deleteEventReportById(report_id, function(err, result) {
        if(err) {
            res.send(err);
        } 

        res.status(200).send({message:'success'});
    });   
}