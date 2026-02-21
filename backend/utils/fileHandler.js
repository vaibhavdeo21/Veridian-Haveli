const fs = require('fs');
const path = require('path');

/**
 * Deletes a file from the uploads folder given its relative DB path
 * @param {string} relativePath - e.g., '/uploads/menu/breakfast/image.jpg'
 */
const deleteFile = (relativePath) => {
  if (!relativePath) return;

  // Convert the URL path into a physical file system path
  const filePath = path.join(__dirname, '..', relativePath);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error(`Error deleting file: ${filePath}`, unlinkErr);
        else console.log(`Successfully purged: ${filePath}`);
      });
    }
  });
};

module.exports = { deleteFile };