const connection = require('../../db.js');

const eventLocationModel = function(eventLocation){
    this.event_id = eventLocation.event_id, 
    this.added_by = eventLocation.added_by, 
    this.street_number = eventLocation.street_number, 
    this.street_name = eventLocation.street_name, 
    this.suburb = eventLocation.suburb, 
    this.city = eventLocation.city, 
    this.state = eventLocation.state, 
    this.country = eventLocation.country, 
    this.latitude = eventLocation.latitude, 
    this.longitude = eventLocation.longitude
};

eventLocationModel.createEvent = function(eventLocation) {

}

eventLocationModel.updateEvent = function(eventLocation) {

}

eventLocationModel.deleteEventLocation = function(eventLocation) {

}

eventLocationModel.getAllEvents = function() {

}

const eventDescriptionModel = function(eventDescription) {
    this.description_id = eventDescription.description_id, 
    this.event_id = eventDescription.event_id, 
    this.added_by = eventDescription.added_by, 
    this.event_name = eventDescription.event_name, 
    this.start_date = eventDescription.start_date, 
    this.end_date = eventDescription.end_date, 
    this.start_time = eventDescription.start_time, 
    this.end_time = eventDescription.end_time, 
    this.event_description = eventDescription.eventDescription, 
    this.photo = eventDescription.photo, 
    this.video = eventDescription.video
};

eventDescriptionModel.createEvent = function(eventLocation) {

}

eventDescriptionModel.updateEvent = function(eventLocation) {

}

eventDescriptionModel.deleteEventLocation = function(eventLocation) {

}


moudle.exports = { eventLocationModel, eventDescriptionModel}

