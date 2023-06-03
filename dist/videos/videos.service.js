"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const FormData = require("form-data");
const config_1 = require("@nestjs/config");
const model = 'whisper-1';
const format = 'vtt';
let VideosService = class VideosService {
    constructor(configService) {
        this.configService = configService;
        this.OPENAI_API_KEY_TRANSCRIPTION = this.configService.get('OPENAI_API_KEY_TRANSCRIPTION');
        this.OPENAI_API_KEY_TRANSLATION = this.configService.get('OPENAI_API_KEY_TRANSLATION');
    }
    async getAudio(filepath) {
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
    async getTranscriptAndTranslation(filename) {
        const formDataTranscript = new FormData();
        formDataTranscript.append('model', model);
        formDataTranscript.append('response_format', format);
        const filePath = 'files/' + filename;
        const audioPath = await this.getAudio(filePath);
        const Path = path.join(audioPath);
        formDataTranscript.append('file', fs.createReadStream(audioPath));
        const vttPath = `src/vtt files/${audioPath.replace('files/', '')}.vtt`;
        const vttTranslationPath = `src/translated vtt/${audioPath.replace('files/', '')}.vtt`;
        let transcriptPromise = () => {
            console.log('Generating transcript...');
            axios_1.default
                .post('https://api.openai.com/v1/audio/transcriptions', formDataTranscript, {
                headers: {
                    Authorization: `Bearer ${this.OPENAI_API_KEY_TRANSCRIPTION}`,
                    'Content-Type': `multipart/form-data; boundary=${formDataTranscript}`,
                },
            })
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
            axios_1.default
                .post('https://api.openai.com/v1/audio/translations', formDataTranslate, {
                headers: {
                    Authorization: `Bearer ${this.OPENAI_API_KEY_TRANSLATION}`,
                    'Content-Type': `multipart/form-data; boundary=${formDataTranslate}`,
                },
            })
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
    async deleteFiles(filePath) {
        try {
            await fs.promises.unlink(filePath);
            console.log('deleting files...');
        }
        catch (error) {
            console.error(error);
        }
    }
    async writeVttFiles(vttPath, response) {
        return new Promise((resolve, reject) => {
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
};
VideosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VideosService);
exports.VideosService = VideosService;
//# sourceMappingURL=videos.service.js.map