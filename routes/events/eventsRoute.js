const express = require("express");
const events = require("../../controller/events/eventController");

var router = express.Router();

router.get("/events", events.getAllEvents);
router.post("/create_event_location/", events.createEventLocation);
// router.post("/update_event_location/", events.updateEventDescription);

router.post("/create_event_description/", events.createEventDescription);
router.post("/update_event_description/", events.updateEventDescription);

module.exports = router;