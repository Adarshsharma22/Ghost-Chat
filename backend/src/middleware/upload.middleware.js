import multer from "multer";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },

    fileFilter: (req, file, cb) => {
        const isImage = file.mimetype.startsWith("image/");
        const isVideo = file.mimetype.startsWith("video/");

        if (!isImage && !isVideo){
            cd(new Error("Only Image and Video Uploads are allowed"));
            return;       
        }

        cd(null, true);
    },

});