import path from "path";
import { DEFAULT_IMAGE_NAME, FILE_PATHS, config, uploadData } from "@intmax2-functions/shared";
import fs from "fs/promises";

const bootstrap = async () => {
  const buffer = await fs.readFile(path.join(__dirname, DEFAULT_IMAGE_NAME));
  const imagePath = `${FILE_PATHS.images}/${DEFAULT_IMAGE_NAME}`;
  await uploadData({
    bucketName: config.GOOGLE_STORE_BUCKET,
    fileName: imagePath,
    buffer,
    makePublic: true,
  });
};
bootstrap();
