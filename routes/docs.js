const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { upload } = require("../app");
const { ensureAuthenticated } = require("../config/auth");

// Route to display the list of events with documentation
router.get("/documentation", ensureAuthenticated, async (req, res) => {
  try {
    const events = await Event.find({
      documentation: { $exists: true, $not: { $size: 0 } },
    });
    res.render("docs/documentation", { events: events });
  } catch (error) {
    req.flash("error_msg", "Failed to retrieve the events with documentation");
    res.redirect("/events/info");
  }
});

// Route to display the documentation for a specific event
router.get("/documentation/:eventId", ensureAuthenticated, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    res.render("docs/event-documentation", { event });
  } catch (error) {
    req.flash("error_msg", "Failed to retrieve the event documentation");
    res.redirect("/events/info");
  }
});

// Route to display the file upload form
router.get("/documentation/:eventId/upload", ensureAuthenticated, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    res.render("docs/upload-documentation", { event });
  } catch (error) {
    req.flash("error_msg", "Failed to retrieve the event for documentation upload");
    res.redirect("/events/info");
  }
});

// Route to handle the documentation upload
router.post(
  "/documentation/:eventId/upload",
  ensureAuthenticated,
  upload.single("file"),
  async (req, res) => {
    try {
      const eventId = req.params.eventId;
      const event = await Event.findById(eventId);

      // Handle file upload using Multer
      // Access the uploaded file using req.file
      // Save the file details to the event's documentation array
      event.documentation.push({
        filename: req.file.filename,
        path: req.file.path,
      });

      await event.save();

      req.flash("success_msg", "Documentation uploaded successfully");
      res.redirect(`/events/documentation/${eventId}`);
    } catch (error) {
      req.flash("error_msg", "Failed to upload the documentation");
      res.redirect(`/events/documentation/${eventId}`);
    }
  }
);

module.exports = router;
