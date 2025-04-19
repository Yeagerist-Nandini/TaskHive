import multer from "multer"

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/images')
    },
    filename: function(req,file, cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${file.fieldname}-${uniqueSuffix}`)
    }
}); 

export const upload = multer({
    storage,
    limits: {
        fileSize: 1* 1000 * 1000,
    }
})


//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
//cloudinary => File handling and storage
// express-fileupload and multer => both are same
// req.body m file data nhi aata that's why we use multer 
//so that it can recognize file data too.

//1. use multer to upload file and then store it into local storage
//2. then upload it to server(local) through cloudinary