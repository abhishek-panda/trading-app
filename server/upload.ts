import multer from 'multer';
import fs from 'fs';


// Define the storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const tempDirectory = process.env.TEMP_DIRECTORY ?? 'temp/';
      if (!fs.existsSync(tempDirectory)){
        fs.mkdirSync(tempDirectory);
      }
      cb(null, tempDirectory); // Files will be stored in the 'uploads' directory
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});
  
// Create a multer instance with the storage options
const upload = multer({ storage: storage });

export default upload;