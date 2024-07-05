const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const app = express();

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.post('/compress', upload.single('uploaded_file'), (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const originalFilePath = req.file.path;
    const compressedFilePath = `${uploadDir}/compressed-${req.file.filename}`;

    sharp(originalFilePath)
        .resize({ width: 400 }) // Resize the image
        .toFormat('jpeg', { quality: 80 }) // Compress the image
        .toFile(compressedFilePath, (err) => {
            if (err) {
                return res.status(500).send('Error during image processing.');
            }

            // Redirect to the result page with query parameters
            res.redirect(`/?compressedFilePath=/${compressedFilePath}`);
        });
});

const port = 4000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

