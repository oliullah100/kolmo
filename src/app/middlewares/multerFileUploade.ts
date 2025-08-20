import multer from "multer";
import path from "path";
import fs from "fs";
// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  // filename: function (req, file, cb) {
  //   cb(null, file.originalname);
  // },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}`;
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

const notificationImage = upload.single("notificationImage");
const uploadProfileImage = upload.single("profileImage");
const uploadCoverImage = upload.single("coverImage");
const uploadPhoto = upload.single("photo");
const uploadBannerImage = upload.single("image");
const uploadCategoryIcon = upload.single("icon");
const uploadIdentificationImages = upload.fields([
  { name: "document_front", maxCount: 1 },
  { name: "document_back", maxCount: 1 }
]);
const uploadProductImage = upload.fields([
  { name: "productImages", maxCount: 10 }
]);

// Multiple profile photos upload (1-4 photos)
const uploadProfilePhotos = upload.fields([
  { name: "photos", maxCount: 4 }
]);

// Identity document upload (1 file)
const uploadIdentityDocument = upload.single("document");

// Income document upload (1 file)
const uploadIncomeDocument = upload.single("document");

const reportPhoto = upload.single("report");

// Audio file upload
const uploadAudio = upload.single("audio");

// Export file uploader methods
export const fileUploader = {
  upload,
  uploadProfileImage,
  uploadCoverImage,
  reportPhoto,
  uploadProductImage,
  uploadPhoto,
  uploadIdentificationImages,
  uploadCategoryIcon,
  notificationImage,
  uploadProfilePhotos,
  uploadAudio,
  uploadIdentityDocument,
  uploadIncomeDocument,
};
