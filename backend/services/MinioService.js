import { Client } from 'minio';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

class MinioService {
    constructor() {
        this.client = new Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: Number(process.env.MINIO_PORT) || 9000,
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY,
        });
    }

    /**
     * Завантажує буфер файлу в MinIO і повертає готовий URL
     */
    async saveImage(buffer, bucketName, mimetype = 'image/webp') {
        const fileName = `${uuidv4()}.webp`;
        const processedBuffer = await sharp(buffer)
            .resize(300, 300, { fit: "cover" })
            .webp({ quality: 80 })
            .toBuffer();

        await this.client.putObject(
            bucketName,
            fileName,
            processedBuffer,
            processedBuffer.length,
            { 'Content-Type': mimetype }
        );

        const host = process.env.MINIO_PUBLIC_HOST || 'http://localhost:9000';
        return fileName;
    }

    /**
     * Видаляє файл із MinIO (наприклад, стару аватарку)
     */
    async deleteImage(fileUrlOrName, bucketName) {
        if (!fileUrlOrName) return;

        // Якщо передали повний URL (http://.../avatar.webp), витягуємо тільки 'avatar.webp'
        const fileName = fileUrlOrName.split('/').pop();

        try {
            await this.client.removeObject(bucketName, fileName);
        } catch (error) {
            // console.error(`Помилка видалення файлу ${fileName} з MinIO:`, error);
        }
    }

    async uploadFiles(files, bucketName) {
        if (!files || files.length === 0) return [];

        const uploadPromises = files.map(async (file) => {
            const isImage = file.mimetype.startsWith('image/');
            let finalBuffer = file.buffer;
            let fileName;
            let contentType = file.mimetype;

            if (isImage) {
                fileName = `${uuidv4()}.webp`;
                contentType = 'image/webp';

                finalBuffer = await sharp(file.buffer)
                    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();
            } else {
                const extension = file.originalname.split('.').pop() || 'bin';
                fileName = `${uuidv4()}.${extension}`;
            }

            await this.client.putObject(
                bucketName,
                fileName,
                finalBuffer,
                finalBuffer.length,
                { 'Content-Type': contentType }
            );

            return fileName;
        });

        return Promise.all(uploadPromises);
    }
}

export default new MinioService();