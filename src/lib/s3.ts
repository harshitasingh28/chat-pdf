import AWS from "aws-sdk";

export async function uploadToS3(file: File) {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      region: "eu-north-1",
    });

    const s3 = new AWS.S3();

    const fileKey =
      "upload/" + Date.now().toString() + "-" + file.name.replace(/\s/g, "-");

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
      Body: file,
      ContentType: file.type,
    };

    await s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        if (evt.total) {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          console.log("Uploading to S3:", percent + "%");
        }
      })
      .promise();

    return {
      file_key: fileKey,
      file_name: file.name,
      url: getS3Url(fileKey),
    };
  } catch (error) {
    console.error(error);
    throw new Error("S3 upload failed");
  }
}

export function getS3Url(fileKey: string) {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${fileKey}`;
  return url;
}
