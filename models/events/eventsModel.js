const connection = require('../../db.js');

const eventLocationModel = function(eventLocation){
    // this.event_id = eventLocation.event_id, 
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

eventLocationModel.createEvent = function(eventLocation, result) {
    connection.query("INSERT INTO event_location set ?", eventLocation, function(error, response) {
        if(error) throw error;
        result(null, response);
    });

}

eventLocationModel.getAllEvents = function(result) {
    connection.query('SELECT * FROM event_location AS el LEFT JOIN event_description AS ed ON el.event_id = ed.event_id', function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results[0]);

        result(null, results);
    });
}

eventLocationModel.getEventById = function(title, event_id, result) {
    connection.query('SELECT * FROM event_location AS el LEFT JOIN event_description AS ed ON el.event_id = ed.event_id WHERE el.event_id=?', event_id, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results[0]);

        result(null, results);
    });
}

eventLocationModel.getEventByUser = function(user, result) {
    connection.query('SELECT * FROM event_description AS el WHERE el.added_by=?', user, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results[0]);

        result(null, results);
    });
}

const eventDescriptionModel = function(eventDescription) {
    this.event_id = eventDescription.event_id, 
    this.added_by = eventDescription.added_by, 
    this.event_name = eventDescription.event_name, 
    this.start_date = eventDescription.start_date, 
    this.end_date = eventDescription.end_date, 
    this.start_time = eventDescription.start_time, 
    this.end_time = eventDescription.end_time, 
    this.event_description = eventDescription.event_description, 
    this.is_contribution = eventDescription.is_contribution
};

eventDescriptionModel.createEventDescription = function(eventDescription, result) {

    // file upload
    connection.query('INSERT INTO event_description set ?', eventDescription, function (error, results, fields) {
        if (error) throw error;
        // console.log('The solution is: ', results);

        result(null, results);
    });
}

eventDescriptionModel.updateEventDescription = function(eventDescription, description_id, result) {
    let values = Object.values(eventDescription);
    console.log(values);

     // file upload
     connection.query("UPDATE event_description SET ? WHERE description_id = ?", [eventDescription, description_id], function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);

        result(null, results);
    });
}

eventDescriptionModel.getDescriptionById = function(description_id, result) {
    connection.query("SELECT * FROM event_description WHERE description_id=?", description_id, function(error, results) {
        if(error) throw error;
        result(null, results);
    });
}

eventDescriptionModel.deleteEvent = function(event_id) {
    // connection.query("UPDATE event_description SET event_id=?,added_by=?,event_name=?,start_date=?,end_date=?,start_time=?,end_time=?,event_description=?,photo=?,video=? WHERE description_id = ?", [...values, description_id], function (error, results, fields) {
    //     if (error) throw error;
    //     console.log('The solution is: ', results);

    //     result(null, results);
    // });
}


// Events media files
var eventMedia = function(media) {
    this.event_id = media.event_id;
    this.description_id = media.description_id;
    this.added_on = media.added_on;
    this.type = media.type;
    this.media = media.file;
    this.added_by = media.added_by;
}

eventMedia.createMedia = function(eventMedia, result) {
    connection.query("INSERT INTO event_media set ?", eventMedia, function(error, response) {
        if(error) throw error;
        result(null, response);
    });
}

eventMedia.updateMedia = function(eventMedia, result) {
    connection.query("UPDATE INTO event_media set ?", eventMedia, function(error, response) {
        if(error) throw error;
        result(null, response);
    });
}

eventMedia.deleteMedia = function(description_id, result) {
    connection.query("DELETE FROM event_media WHERE description_id= ?", description_id, function(error, response) {
        if(error) throw error;
        result(null, response);
    });
}

eventMedia.getAllMedia = function(result) {
    connection.query("SELECT * FROM event_media", function(error, results) {
        if(error) throw error;
        result(null, results);
    });
}

eventMedia.getMediaByEventId = function(event_id, result) {
    connection.query("SELECT * FROM event_media WHERE event_id=?", event_id, function(error, results) {
        if(error) throw error;
        result(null, results);
    });
}

module.exports = { eventLocationModel, eventDescriptionModel, eventMedia}

