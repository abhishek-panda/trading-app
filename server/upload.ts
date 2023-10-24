import multer from 'multer';
import path from 'path';


// Define the storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'temp/'); // Files will be stored in the 'uploads' directory
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
});
  
// Create a multer instance with the storage options
const upload = multer({ storage: storage });

export default upload;