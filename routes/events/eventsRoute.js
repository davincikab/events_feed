const express = require("express");
const events = require("../../controller/events/eventController");
const { isAuthenticated } = require("../../config/auth");
const { allowOnly, accessLevels  } = require("../../config/roles");

// express route
var router = express.Router();

// event location path
router.get("/dashboard",isAuthenticated, allowOnly(accessLevels.admin, events.dashboard));
router.get("/events", events.getAllEvents);
router.post("/create_event_location/", events.createEventLocation);
router.get("/event/:event_name/:event_id/", events.getEventById);
router.get("/event/update/:event_name/:description_id/", events.getEventDescription);
router.get("/event/add-description/:event_name/:event_id/", events.addEventDescription);

// description path
router.post("/create_event_description/", isAuthenticated, events.createEventDescription);
router.post("/update_event_description/", isAuthenticated, events.updateEventDescription);

// default path
router.get("/", (req, res, next) => {
    res.render("pages/index", {user:req.user, section:"home"});
});

router.get("/map", isAuthenticated, (req, res) => {
    let context = {
        section:'map',
        user:req.user
    }
    res.render("pages/map", context)
});


router.get("/pending_events", isAuthenticated, allowOnly(accessLevels.admin, events.getUnPostedEvents));
router.get("/pending_contribution", isAuthenticated, allowOnly(accessLevels.admin, events.getUnPublishedDescription));

// delete or update events
router.post("/post_event/:event_id/:description_id/", isAuthenticated, allowOnly(accessLevels.admin, events.postEvent))
router.post("/delete_event/:event_id/", isAuthenticated, allowOnly(accessLevels.admin, events.deleteEventLocation))

// contribution
router.post("/publish_contribution/:description_id/", isAuthenticated, allowOnly(accessLevels.admin, events.publishContribution))
router.post("/delete_contribution/:description_id/", isAuthenticated, allowOnly(accessLevels.admin, events.deleteEventContribution))


module.exports = router;