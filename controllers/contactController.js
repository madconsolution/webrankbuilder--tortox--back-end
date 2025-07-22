const Contact = require("../models/Contact");

// Create a new contact message
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json({ message: "Message sent successfully", contact });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all contact messages (with pagination and optional status)
exports.getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status;
    const query = status ? { status } : {};

    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(query),
    ]);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      data: contacts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update contact message status (admin use)
exports.updateContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    contact.status = req.body.status || contact.status;
    await contact.save();

    res.json({ message: "Status updated", contact });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
