const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Notes = require('../models/Notes');
const { validationResult, body } = require('express-validator');


//ROUTE 1: Get all the notes: GET "/api/notes/fetchAllNotes", Login Required
router.get('/fetchAllNotes', fetchUser, (req, res) => {
    Notes.find({ user: req.user.id })
        .then(notes => res.status(200).json({ note: notes }))
        .catch(err => res.status(401).json({ error: err }))
});

//ROUTE 2: Add a note: POST "/api/notes/addNote", Login Required
router.post('/addNote', fetchUser, [
    //defining what needs to be validated
    body('title', "Enter a valid Title").isLength({ min: 3 }),
    body('description', "Description must be 5 character").isLength({ min: 5 }),
], (req, res) => {
    // storing error if any in a variable
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    //Creating a new Note
    Notes.create({
        title: req.body.title,
        description: req.body.description,
        tag: req.body.tag,
        user: req.user.id,
    }).then((note) => {
        res.status(200).json(note);
    }).catch((err) => {
        res.status(400).json({ error: err })
    })
});

//ROUTE 3: Update a existing note: PUT "/api/notes/updateNote", Login Required
router.put("/updateNote/:id", fetchUser, (req, res) => {
    const { title, description, tag } = req.body;
    const newNote = {};

    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };

    //Find the note to be updated and update it
    Notes.findById(req.params.id)
        .then((note) => {
            if (!note) return res.status(404).json({ error: "note not found in database" });
            if (note.user.toString() !== req.user.id) return res.status(401).json({ error: "Not allowed" });
            Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
                .then((updatedNote) => {
                    res.status(200).json({
                        message: "Updated Successfully",
                        newNote: updatedNote,
                    })
                })
                .catch((err) => {
                    res.status(400).json({
                        message: "Error while Updating",
                        error: err
                    })
                })
        })
        .catch((err) => {
            res.status(400).json({
                message: "Error while finding the note",
                error: err,
            });
        })
});

//ROUTE 3: delete a existing note: POST "/api/notes/deleteNote", Login Required
router.delete("/deleteNote/:id", fetchUser, (req, res) => {
    //Find the note to be deleted and delete it
    Notes.findById(req.params.id)
        .then((note) => {
            if (!note) return res.status(404).json({ error: "Note not found in database" });
            if (note.user.toString() !== req.user.id) return res.status(401).json({ error: "Operation not allowed" });
            Notes.findByIdAndDelete(req.params.id)
                .then((note) => {
                    res.status(200).json({
                        message: "deleted Successfully",
                        note: note,
                    })
                })
                .catch((err) => {
                    res.status(400).json({
                        message: "Error while deleting, please try again later",
                        error: err
                    });
                })
        })
        .catch((err) => {
            res.status(400).json({
                message: "Error while finding the note",
                error: err,
            });
        })
})
module.exports = router