import * as Minio from 'minio';

export const BUCKET_NAMES = ["avatars", "group-avatars", "chat-attachments"];

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

export const initMinio = async () => {
  try {
    for (const bucketName of BUCKET_NAMES) {
      const exists = await minioClient.bucketExists(bucketName);
      
      if (!exists) {
        await minioClient.makeBucket(bucketName);
        console.log(`[MinIO] Бакет "${bucketName}" успішно створено.`);
      }

      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };

      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`[MinIO] Публічну політику для "${bucketName}" оновлено.`);
    }
  } catch (err) {
    console.error('[MinIO] Помилка ініціалізації:', err);
  }
};