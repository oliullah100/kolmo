import { ListBucketsCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import config from "../../config";
import { s3Client } from "./S3Client";



export const deleteFromS3ByUrl = async (fileUrl: string): Promise<void> => {
  const bucketName = config.S3.bucketName
  

  if (!bucketName) {
    throw new Error("S3 bucket name is not defined in the configuration.");
  }

  // Extract the key from the URL
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1); // Remove the leading "/"
    // console.log("Extracted Key:", key);

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error: any) {
    throw new Error(`Failed to delete file from S3: ${fileUrl}`);
  }
};
