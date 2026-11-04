import AWS from 'aws-sdk'
import fs from 'fs';
export async function downloadFromS3(file_key: string){
    try{
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        });
        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            },
            region: "eu-north-1",
        });
        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
        };

        const obj = await s3.getObject(params).promise()
        const file_name = `/tmp/pdf-${Date.now()}.pdf`
        fs.writeFileSync(file_name, obj.Body as Buffer)
        fs.writeFileSync(file_name, obj.Body as Buffer);

const stats = fs.statSync(file_name);
const downloadedBuffer = fs.readFileSync(file_name);

console.log("Downloaded file size:", stats.size);
console.log(
  "Downloaded PDF header:",
  downloadedBuffer.subarray(0, 5).toString()
);

console.log("S3 content type:", obj.ContentType);
console.log("S3 content length:", obj.ContentLength);
        return file_name
    }catch(error){
        console.error(error)
        return null
    }
}
