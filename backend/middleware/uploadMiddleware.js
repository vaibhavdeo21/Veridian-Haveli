const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folderPath = path.join(__dirname, '../uploads');

    // Logic for Customer Aadhar/ID Documents
    if (req.originalUrl.includes('upload-id')) {
      folderPath = path.join(folderPath, 'customer_documents');
    } 
    // Logic for Menu Items based on Category param
    else if (req.originalUrl.includes('food')) {
      const category = req.params.category || 'general';
      folderPath = path.join(folderPath, 'menu', category);
    }

    // CREATE FOLDER RECURSIVELY
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and images are allowed.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;