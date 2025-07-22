const express = require("express");
const router = express.Router();

const {
  createContact,
  getAllContacts,
  updateContactStatus,
} = require("../controllers/contactController");

// Public: submit contact message
router.post("/", createContact);

// Admin: view & manage contacts
router.get("/", getAllContacts);
router.put("/:id/status", updateContactStatus);

module.exports = router;
