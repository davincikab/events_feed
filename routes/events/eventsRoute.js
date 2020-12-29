const express = require("express");
const events = require("../../controller/events/eventController");
const { isAuthenticated } = require("../../config/auth");

// express route
var router = express.Router();

// event location path
router.get("/events", events.getAllEvents);
router.post("/create_event_location/", events.createEventLocation);
router.get("/event/:event_name/:event_id/", events.getEventById);

// description path
router.post("/create_event_description/", events.createEventDescription);
router.post("/update_event_description/", events.updateEventDescription);

// default path
router.get("/", (req, res, next) => {
    res.render("pages/index");
});

router.get("/map", isAuthenticated, (req, res) => {
    let context = {
        section:'map',
        user:req.user
    }
    res.render("pages/map", context)
});



module.exports = router;