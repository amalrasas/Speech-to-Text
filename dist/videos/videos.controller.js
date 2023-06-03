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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideosController = void 0;
const common_1 = require("@nestjs/common");
const videos_service_1 = require("./videos.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let VideosController = class VideosController {
    constructor(videosService) {
        this.videosService = videosService;
    }
    async handleUpload(file) {
        let transcriptPath, translationPath = await this.videosService.getTranscriptAndTranslation(file.filename);
        return { transcriptPath, translationPath };
    }
};
__decorate([
    (0, common_1.Post)('transcribe'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './files',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
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
            const ext = (0, path_1.extname)(file.originalname);
            if (!allowedExtensions.includes(ext)) {
                return callback(new common_1.BadRequestException(`Unsupported file type ${ext}. Only ${allowedExtensions.join(', ')} are allowed.`), false);
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VideosController.prototype, "handleUpload", null);
VideosController = __decorate([
    (0, common_1.Controller)('videos'),
    __metadata("design:paramtypes", [videos_service_1.VideosService])
], VideosController);
exports.VideosController = VideosController;
//# sourceMappingURL=videos.controller.js.map