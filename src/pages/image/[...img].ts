import { APIContext } from "astro";
import { ShareServiceClient } from "@azure/storage-file-share";
import sharp from "sharp";

export async function get(
  { params }: APIContext,
) {
  const q = params.img;
  let id = q.split("/")[0];
  let img;
  const serviceClient = ShareServiceClient.fromConnectionString(
    await import.meta.env.AZURE_KEY,
  );
  try {
    const fileClient = serviceClient
      .getShareClient("images")
      .getDirectoryClient("art")
      .getFileClient(id);
    img = await fileClient.downloadToBuffer();
    if (q.includes("quality") && q.split("/")[1].includes("quality")) {
      const a = q.split("/")[1].split("=")[1];
      if (q.split("/").length === 3) {
        const r = q.split("/")[2].split("=")[1].split("x");
        await sharp(img).resize(parseInt(r[0]), parseInt(r[1]), {
          kernel: sharp.kernel.nearest,
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy,
        }).webp({
          quality: parseInt(a),
        }).toBuffer().then((data) => img = data).catch((err) =>
          {
            throw Error
          }
        );
      } else {
        await sharp(img)
          .webp({
            quality: parseInt(a),
          })
          .toBuffer()
          .then((data) => {
            img = data;
          })
          .catch((err) => {
            throw Error
          });
      }
    }
    if(q.split('/').length > 1 && !q.includes('quality')) {
        throw Error
        
    }
    return new Response(img, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Error not found",
      }),
      {
        status: 404,
      },
    );
  }
}
