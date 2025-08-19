import {  DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./fileUploader";
import config from "../../config";



/**
 * Delete file from S3 by its public URL
 * @param {string} fileUrl - The full URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFromS3ByUrl = async (fileUrl: string): Promise<void> => {
  const bucketName = config.S3.bucketName;

  if (!bucketName) {
    throw new Error("S3 bucket name is not defined in the configuration.");
  }

  // Extract the key from the URL

  const url = new URL(fileUrl);
  // console.log(32, fileUrl);
  const key = url.pathname.slice(1); // Remove the leading "/"
  // console.log("Extracted Key:", key);

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
};
