import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './files',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;

          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedExtensions = [
          '.mp3',
          '.wav',
          '.mp4',
          '.mpeg',
          '.mpga',
          '.m4a',
          '.webm',
        ];
        const ext = extname(file.originalname);
        if (!allowedExtensions.includes(ext)) {
          return callback(
            new BadRequestException(
              `Unsupported file type ${ext}. Only ${allowedExtensions.join(
                ', ',
              )} are allowed.`,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async handleUpload(@UploadedFile() file: Express.Multer.File) {
    let transcriptPath,
      translationPath = await this.videosService.getTranscriptAndTranslation(
        file.filename,
      );
    return { transcriptPath, translationPath };
    // console.log('Transcript path: ',transcriptPath)
    // console.log('Translate path: ', translationPath);
  }
}
