import { S3Client } from "@aws-sdk/client-s3";
import config from "../../config";

// Configure DigitalOcean Spaces (S3-compatible)

export const s3Client = new S3Client({
  region: config.S3.region,
  // endpoint: config.S3.endpoint,  //by default aws
  credentials: {
    accessKeyId: config.S3.accessKeyId as string,
    secretAccessKey: config.S3.secretAccessKey as string
  },
});


/*

export const s3Client2 = new S3Client({
  region: config.S3.region,
  endpoint: config.S3.region,
  credentials: {
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY || "",
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY || "",
  },
});

*/ 