import multer from "multer";
import path from "path";

export class GlobalStorageConfig {
    public static staticStorageFolderPath: string[];

    public static setStaticStorageFolderPath(staticStorageFolderPath: string[]) {
        this.staticStorageFolderPath = staticStorageFolderPath;
    }

    public static storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(...this.staticStorageFolderPath));
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const basename = Buffer.from(path.basename(file.originalname, ext), 'latin1').toString('utf8');
            const uniqueId = `__${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            cb(null, basename + uniqueId + ext);
        }
    });

    public static readonly FILE_LIMIT_SIZE = 100 * 1024 * 1024; // 100MB in bytes
    
    // 100MB 용량 제한 설정
    public static upload = multer({ 
        storage: this.storage,
        limits: {
            fileSize: this.FILE_LIMIT_SIZE
        }
    });
    
    public static FILE_DELETE_TIME = 5 * 60 * 1000; // 5분

    public static getStaticStorageFileUrl(filename: string) {
        const staticStorageFolderPath = path.join(...this.staticStorageFolderPath);
        console.log("staticStorageFolderPath in getStaticStorageFileUrl", staticStorageFolderPath);
        return `${process.env.ENDPOINT_URL}/${staticStorageFolderPath}/${filename}`;
    }

}