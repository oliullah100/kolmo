import multer from "multer";
import path from "path";
// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "public", "uploads"));
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

const reportPhoto = upload.single("report");




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
};
