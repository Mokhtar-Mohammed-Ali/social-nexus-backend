import {
  APPLICATION_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_EXPIRATION_TIME,
  AWS_REGION,
  AWS_S3_BUCKET_NAME,
  AWS_SECRET_ACCESS_KEY,
} from "../../config/config.service";
import {
  CompleteMultipartUploadCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { BadRequestExpetions } from "../exptions";
import { MulterStorage, UploadsEnum } from "../enums";
import { createReadStream } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
  private client: S3Client;
  constructor() {
    this.client = new S3Client({
      region: AWS_REGION,

      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  // apload file to s3 and return the file key small file
  async uploadAsset({
    storageApproache = MulterStorage.MEMORY,
    ACL = ObjectCannedACL.private,
    Bucket,
    path = "general",

    file,
    ContentType,
  }: {
    storageApproache?: MulterStorage;
    ACL?: ObjectCannedACL;
    Bucket?: string| undefined;
    path?: string;
    file: Express.Multer.File;
    ContentType?: string | undefined;
  }): Promise<string> {
    const command = new PutObjectCommand({
      ACL,
      Bucket,
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
      Body:
        storageApproache === MulterStorage.MEMORY
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype || ContentType,
    });
    if (!command.input.Key) {
      throw new BadRequestExpetions("cannot upload file");
    }
    await this.client.send(command);
    return command.input.Key;
  }
  //apload large file to s3 and return the file key by lib-storage

  async uploadLargeAsset({
    storageApproache = MulterStorage.DISK,
    ACL = ObjectCannedACL.private,
    Bucket,
    path = "general",

    file,
    ContentType,
    partSize = 5,
  }: {
    storageApproache?: MulterStorage;
    ACL?: ObjectCannedACL;
    Bucket?: string | undefined;
    path?: string;
    file: Express.Multer.File;
    ContentType?: string | undefined;
    partSize?: number;
  }): Promise<CompleteMultipartUploadCommandOutput> {
    const uploadFile = new Upload({
      client: this.client,
      params: {
        ACL,
        Bucket,
        Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`,
        Body:
          storageApproache === MulterStorage.MEMORY
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype || ContentType,
      },
      partSize: partSize * 1024 * 1024, // 5MB
    });

    uploadFile.on("httpUploadProgress", (progress) => {
      console.log(progress);
      console.log(
        `uploaded ${Math.round(
          ((progress.loaded as number) / (progress.total as number)) * 100,
        )}%`,
      );
    });
    return await uploadFile.done();
  }

  //upload assets

 async uploadAssets({
  storageApproache = MulterStorage.MEMORY,
 uploadApproache = UploadsEnum.SMALL,
  ACL = ObjectCannedACL.private,
  Bucket,
  path = "general",
  files,
  ContentType,
}: {
  storageApproache?: MulterStorage;
  uploadApproache?: UploadsEnum;
  ACL?: ObjectCannedACL;
  Bucket?: string | undefined;
  path?: string;
  files: Express.Multer.File[];
  ContentType?: string;
}) : Promise<string[]> {
  let urls: string[] = [];
  if (uploadApproache === UploadsEnum.SMALL) {
  urls=   await Promise.all(
    files.map((file) => {
      return this.uploadAsset({
        storageApproache,
        ACL,
        Bucket,
        path,
        file,
        ContentType,
      });
    })

  );
  } else {
    const data= await Promise.all(
    files.map((file) => {
      return this.uploadLargeAsset({
        storageApproache,
        ACL,
        Bucket,
        path,
        file,
        ContentType,
      });
    })

  );
  urls = data.map((ele)=>ele.Key as string)
  }
 
    return urls
}

//pre signed url

 async PresignedUploadLink({
    Bucket,
    path = "general",

    ContentType,
    originalname,
    expiresIn=AWS_EXPIRATION_TIME
  }: {
  
    Bucket?: string| undefined;
    path?: string;
    ContentType?: string| undefined;
    originalname:string;
    expiresIn?: number;
  }): Promise<{url:string,key:string}> {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${APPLICATION_NAME}/${path}/${randomUUID()}__${originalname}`,
      ContentType,
    });
     if (!command.input.Key) {
      throw new BadRequestExpetions("cannot upload file");
    }
   const url = await getSignedUrl(this.client,command,{expiresIn})
    return {url,key:command.input.Key as string}
}

// get file from s3 by url presigned url

async getPresignedUploadLink({
    Bucket,
    Key,
 fileName,
    download,

    expiresIn=AWS_EXPIRATION_TIME
  }: {
  
    Bucket?: string| undefined;
    Key: string ;
    fileName?:string| undefined;
    download?:string| undefined;
   
    expiresIn?: number;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
        ResponseContentDisposition:download==="true" ? `attachment; filename="${
      fileName || Key.split("/").pop()
    }"` : undefined,
    
    });
    
   const url = await getSignedUrl(this.client,command,{expiresIn})
    return url
}

// get file from s3 by key
 async getAsset({
    Bucket,

    Key
  }: {
    
    Bucket?: string| undefined;
    Key: string ;
  }): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket,
      Key
    });
   return await this.client.send(command);
  }

  // delete file from s3 by key
   async deleteAsset({
    Bucket,

    Key
  }: {
    
    Bucket?: string| undefined;
    Key: string ;
  }): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket,
      Key
    });
   return await this.client.send(command);
  }


  // delete multiple files from s3 by key
   async deleteAssets({
    Bucket,

    Keys
  }: {
    
    Bucket?: string| undefined;
    Keys: { Key: string }[] ; 
  }): Promise<DeleteObjectsCommandOutput> {
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {Objects: Keys,Quiet: false}
      
    });
   return await this.client.send(command);
  }



  



// list files in s3 by prefix
 async listFileDirectory  ({
  Bucket = AWS_S3_BUCKET_NAME as string,
  
  prefix,
}: {
  Bucket?: string;
  Quiet?: boolean;
  prefix: string;
}): Promise<ListObjectsV2CommandOutput> {
  const command = new ListObjectsV2Command({
    Bucket,
    Prefix: `${APPLICATION_NAME}/${prefix}/`,
  });
  return await this.client.send(command);

}


// delete folder from s3 by prefix
async deleteFolderContent({
  Bucket = AWS_S3_BUCKET_NAME as string,
 
  prifix,
}: {
  Bucket?: string;
  Quiet?: boolean;
  prifix: string;
}): Promise<DeleteObjectsCommandOutput> {
  const result= await this.listFileDirectory({Bucket,prefix:prifix})
  const keys = result.Contents?.map((ele) => ({ Key: ele.Key}))as {Key: string}[] || [];
 return await this.deleteAssets({Bucket,Keys:keys})
};

}
export const s3Service = new S3Service();
