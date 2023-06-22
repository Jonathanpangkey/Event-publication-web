const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { ensureAuthenticated } = require("../config/auth");

// Route to get the form page for creating an event
router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("events/create"); // Assuming you have a corresponding EJS template named "create-event.ejs"
});

// Route to create a new event
router.post("/create", async (req, res) => {
  try {
    const { title, description, date, location, contact } = req.body;
    const { name, email } = req.user;
    const newEvent = new Event({
      name,
      email,
      title,
      description,
      date,
      location,
      contact,
    });
    await newEvent.save();
    req.flash("success_msg", "Event created successfully");
    res.redirect("/events/info"); // Assuming you have a route to display all events
  } catch (error) {
    req.flash("error_msg", "Failed to create the event");
    res.redirect("/events/create");
  }
});

// Route to display event details
router.get("/info", ensureAuthenticated, async (req, res) => {
  try {
    const events = await Event.find({});
    res.render("events/info", { events }); // Assuming you have a corresponding EJS template named "event-details.ejs"
  } catch (error) {
    req.flash("error_msg", "Failed to retrieve the events");
    res.redirect("/events/info"); // Redirect to the event listing page or handle the error accordingly
  }
});

router.get("/delete/:eventId", ensureAuthenticated, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    await Event.findByIdAndDelete(eventId);
    req.flash("success_msg", "Event deleted successfully");
    res.redirect("/events/info");
  } catch (error) {
    req.flash("error_msg", "Failed to delete the event");
    res.redirect("/events/info");
  }
});

router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.render("events/edit", { event });
});

router.post("/edit/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, location, contact } = req.body;
    await Event.findByIdAndUpdate(
      eventId,
      { title, description, date, location, contact },
      { new: true }
    );
    req.flash("success_msg", "Event updated successfully");
    res.redirect("/events/info"); // Assuming you have a route to display all events
  } catch (error) {
    req.flash("error_msg", "Failed to update the event");
    res.redirect("/events/info");
  }
});

module.exports = router;
