const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const express = require("express");
const router = express.Router();
const pool = require("../../db");
const { verifyRole } = require("../../middleware/middleware");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

router.post("/generate-presigned-url", async (req, res) => {
  const { fileName, fileType } = req.body;
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!allowedImageTypes.includes(fileType)) {
    return res.status(400).json({
      error:
        "Invalid image format. Allowed formats: jpeg, jpg, png, gif, webp.",
    });
  }

  const uniqueKey = `toleram/${uuidv4()}-${fileName}`;
  
  const s3Params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: uniqueKey,
    ContentType: fileType,
    ACL: 'public-read',
  };

  try {
    const command = new PutObjectCommand(s3Params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;
    res.json({ presignedUrl: url, imageUrl });
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
