import { Client } from 'minio';
import sharp from 'sharp';

class MinioService {
    constructor() {
        this.client = new Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: Number(process.env.MINIO_PORT) || 9000,
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY,
        });

        this.bucketName = process.env.MINIO_BUCKET || 'avatars';
    }

    /**
     * Завантажує буфер файлу в MinIO і повертає готовий URL
     */
    async saveImage(buffer, fileName, mimetype = 'image/webp') {
        const processedBuffer = await sharp(buffer)
            .resize(300, 300, { fit: "cover" })
            .webp({ quality: 80 })
            .toBuffer();

        await this.client.putObject(
            this.bucketName,
            fileName,
            processedBuffer,
            processedBuffer.length,
            { 'Content-Type': mimetype }
        );

        const host = process.env.MINIO_PUBLIC_HOST || 'http://localhost:9000';
        return `${host}/${this.bucketName}/${fileName}`;
    }

    /**
     * Видаляє файл із MinIO (наприклад, стару аватарку)
     */
    async deleteImage(fileUrlOrName) {
        if (!fileUrlOrName) return;

        // Якщо передали повний URL (http://.../avatar.webp), витягуємо тільки 'avatar.webp'
        const fileName = fileUrlOrName.split('/').pop();

        try {
            await this.client.removeObject(this.bucketName, fileName);
        } catch (error) {
            // console.error(`Помилка видалення файлу ${fileName} з MinIO:`, error);
        }
    }
}

export default new MinioService();