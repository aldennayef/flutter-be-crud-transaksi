import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Direktori default penyimpanan file lokal
const BASE_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

// Pastikan folder upload ada, jika belum otomatis dibuat
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Konfigurasi Disk Storage Multer
 */
const createDiskStorage = (subDir = 'general') => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const targetDir = path.join(BASE_UPLOAD_DIR, subDir);
      ensureDirExists(targetDir);
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      // Buat nama file unik dan aman: timestamp-randomHex.ext (contoh: 1728394012-a1b2c3d4.webp)
      const ext = path.extname(file.originalname).toLowerCase();
      const randomName = crypto.randomBytes(6).toString('hex');
      const safeFilename = `${Date.now()}-${randomName}${ext}`;
      cb(null, safeFilename);
    },
  });
};

/**
 * Filter MIME Type yang diizinkan
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Wrapper error handling agar error Multer keluar dalam format JSON 400 yang rapi
 */
const wrapMulterMiddleware = (multerInstance) => {
  return (req, res, next) => {
    multerInstance(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        let message = 'Terjadi kesalahan saat upload file.';
        if (err.code === 'LIMIT_FILE_SIZE') {
          message = 'Ukuran file melebihi batas yang diizinkan.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          message = `Field upload '${err.field}' tidak dikenali atau jumlah file melebihi batas.`;
        }

        return res.status(400).json({
          status: 'error',
          code: err.code,
          message,
        });
      } else if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message || 'File tidak valid.',
        });
      }

      next();
    });
  };
};

/**
 * 🖼️ Upload 1 Gambar (Foto Profil, Banner, Thumbnail Project)
 * @param {string} fieldName - Nama field form-data (default: 'image')
 * @param {number} maxSizeMB - Batas ukuran file dalam Megabyte (default: 5MB)
 * @param {string} subDir - Subfolder di dalam /uploads (default: 'images')
 */
export const uploadImage = (fieldName = 'image', maxSizeMB = 5, subDir = 'images') => {
  const upload = multer({
    storage: createDiskStorage(subDir),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipe file tidak didukung. Format yang diizinkan: JPG, PNG, WEBP, GIF, SVG.`));
      }
    },
  }).single(fieldName);

  return wrapMulterMiddleware(upload);
};

/**
 * 🖼️🖼️ Upload Banyak Gambar Sekaligus (Galeri Project)
 * @param {string} fieldName - Nama field form-data (default: 'images')
 * @param {number} maxCount - Maksimal jumlah file (default: 5)
 * @param {number} maxSizeMB - Batas ukuran per file (default: 5MB)
 */
export const uploadImages = (fieldName = 'images', maxCount = 5, maxSizeMB = 5, subDir = 'images') => {
  const upload = multer({
    storage: createDiskStorage(subDir),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipe file tidak didukung. Format yang diizinkan: JPG, PNG, WEBP, GIF, SVG.`));
      }
    },
  }).array(fieldName, maxCount);

  return wrapMulterMiddleware(upload);
};

/**
 * 📄 Upload Dokumen / PDF (Contoh: File CV / Resume)
 * @param {string} fieldName - Nama field form-data (default: 'document')
 * @param {number} maxSizeMB - Batas ukuran file dalam Megabyte (default: 10MB)
 */
export const uploadDocument = (fieldName = 'document', maxSizeMB = 10, subDir = 'documents') => {
  const upload = multer({
    storage: createDiskStorage(subDir),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Hanya dokumen berformat PDF atau Word yang diizinkan.`));
      }
    },
  }).single(fieldName);

  return wrapMulterMiddleware(upload);
};
