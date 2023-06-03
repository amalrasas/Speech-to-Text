import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';
import * as FormData from 'form-data';
import { ConfigService } from '@nestjs/config';

const model = 'whisper-1';
const format = 'vtt';

@Injectable()
export class VideosService {

  constructor(private configService: ConfigService) {}
  OPENAI_API_KEY_TRANSCRIPTION = this.configService.get(
    'OPENAI_API_KEY_TRANSCRIPTION',
  );
  OPENAI_API_KEY_TRANSLATION = this.configService.get(
    'OPENAI_API_KEY_TRANSLATION',
  );

  async getAudio(filepath: string) {
    const videoPath = filepath;

    const outputDir = 'files';
    const videoName = path.basename(videoPath, path.extname(videoPath));
    const outputPath = path.join(outputDir, `${videoName}.m4a`);
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .output(outputPath)
        .noVideo()
        .audioCodec('aac')
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
    console.log('Audio extraction completed');
    await this.deleteFiles(videoPath);
    return outputPath;
  }
  async getTranscriptAndTranslation(filename: string) {
    const formDataTranscript = new FormData();
    formDataTranscript.append('model', model);
    formDataTranscript.append('response_format', format);

    const filePath = 'files/' + filename;
    const audioPath = await this.getAudio(filePath);
    const Path = path.join(audioPath);
    formDataTranscript.append('file', fs.createReadStream(audioPath));
    const vttPath = `src/vtt files/${audioPath.replace('files/', '')}.vtt`;
    const vttTranslationPath = `src/translated vtt/${audioPath.replace(
      'files/',
      '',
    )}.vtt`;
    let transcriptPromise = () => {
      console.log('Generating transcript...');
      axios
        .post(
          'https://api.openai.com/v1/audio/transcriptions',
          formDataTranscript,
          {
            headers: {
              Authorization: `Bearer ${this.OPENAI_API_KEY_TRANSCRIPTION}`,
              'Content-Type': `multipart/form-data; boundary=${formDataTranscript}`,
            },
          },
        )
        .then((response) => {
          this.writeVttFiles(vttPath, response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };
    const formDataTranslate = new FormData();
    formDataTranslate.append('model', model);
    formDataTranslate.append('response_format', format);
    formDataTranslate.append('file', fs.createReadStream(audioPath));
    let translatePromise = () => {
      console.log('Generating translation...');
      axios
        .post(
          'https://api.openai.com/v1/audio/translations',
          formDataTranslate,
          {
            headers: {
              Authorization: `Bearer ${this.OPENAI_API_KEY_TRANSLATION}`,
              'Content-Type': `multipart/form-data; boundary=${formDataTranslate}`,
            },
          },
        )
        .then((response) => {
          this.writeVttFiles(vttTranslationPath, response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    await Promise.all([transcriptPromise(), translatePromise()]);
    return { vttPath, vttTranslationPath };
  }

  async deleteFiles(filePath: string) {
    try {
      await fs.promises.unlink(filePath);
      console.log('deleting files...');
    } catch (error) {
      console.error(error);
    }
  }
  async writeVttFiles(vttPath: string, response: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fs.writeFile(vttPath, response, async (err) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        console.log(`Transcript has been saved in ${vttPath}`);
        resolve(vttPath);
      });
    });
  }
}
