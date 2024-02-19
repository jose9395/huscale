// const express = require('express');
// const multer = require('multer');
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const fs = require('fs');
// require('dotenv').config();
// const sharp = require('sharp');

// const app = express();
// const port = 3000; // You can use any port
// const upload = multer({ dest: 'uploads/' });

// const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// app.post('/process-images', upload.array('pictures', 4), async (req, res) => {
//     const files = req.files;
//     // const imageParts = files.map(file => fileToGenerativePart(file.path, file.mimetype));
//     const imageParts = await Promise.all(files.map(file => fileToGenerativePart(file.path, file.mimetype)));

//     const filteredImageParts = imageParts.filter(part => part !== null); // Filter out any null values
//     // Your existing code to process images
//     const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
//     const prompt = "What is in the image?.";

//     try {
//         const result = await model.generateContent([prompt, ...imageParts]);
//         const response = await result.response;
//         const text = await response.text();
//         console.log(text);
//         res.send(text); // Send the processing result back to the Flutter app
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error processing images");
//     }finally {
//         // Cleanup uploaded files asynchronously
//         cleanupFiles(files);
//     }

//     // Cleanup uploaded files
//     // files.forEach(file => fs.unlinkSync(file.path));
//     async function cleanupFiles(files) {
//         for (const file of files) {
//             try {
//                 await fs.unlink(file.path);
//                 console.log(`Successfully deleted file ${file.path}`);
//             } catch (error) {
//                 console.error(`Error deleting file ${file.path}: ${error}`);
//             }
//         }
//     }

// });

// // function fileToGenerativePart(path, mimeType) {
// //     return {
// //         inlineData: {
// //             data: Buffer.from(fs.readFileSync(path)).toString("base64"),
// //             mimeType
// //         },
// //     };
// // }

// async function fileToGenerativePart(path, originalMimeType) {
//     const acceptedMimeTypes = ["image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"];
//     let mimeType = acceptedMimeTypes.includes(originalMimeType) ? originalMimeType : "image/jpeg"; // Default to JPEG if not accepted

//     try {
//         // Convert the image to JPEG if it's not in an accepted format, otherwise just read the file
//         const imageBuffer = await sharp(path)
//             .toFormat('jpeg', { quality: 90 }) // Convert to JPEG with 90% quality
//             .toBuffer();

//         return {
//             inlineData: {
//                 data: imageBuffer.toString("base64"),
//                 mimeType: "image/jpeg", // Since we're converting to JPEG
//             },
//         };
//     } catch (error) {
//         console.error(`Error processing file ${path}: ${error}`);
//         return null;
//     }
// }

// app.listen(process.env.PORT || port, () => console.log(`Server running on port ${port}`));

const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const sharp = require('sharp');

const app = express();
const port = 3000; // You can use any port
const upload = multer();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/process-images', upload.array('pictures', 4), async (req, res) => {
    const files = req.files;

    try {
        const imageParts = await Promise.all(files.map(file => fileToGenerativePart(file.buffer, file.mimetype)));

        const filteredImageParts = imageParts.filter(part => part !== null);

        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const prompt = "What is in the image?.";

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = await response.text();
        console.log(text);
        res.send(text);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing images");
    }

    // Cleanup: No need to delete files when processing buffers in-memory

});

async function fileToGenerativePart(buffer, originalMimeType) {
    const acceptedMimeTypes = ["image/png", "image/jpeg", "image/webp", "image/heic", "image/heif"];
    let mimeType = acceptedMimeTypes.includes(originalMimeType) ? originalMimeType : "image/jpeg";

    try {
        const imageBuffer = await sharp(buffer)
            .toFormat('jpeg', { quality: 90 })
            .toBuffer();

        return {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg",
            },
        };
    } catch (error) {
        console.error("Error processing file:", error);
        return null;
    }
}

app.listen(process.env.PORT || port, () => console.log(`Server running on port ${port}`));
