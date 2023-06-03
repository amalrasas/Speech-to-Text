/// <reference types="multer" />
import { VideosService } from './videos.service';
export declare class VideosController {
    private readonly videosService;
    constructor(videosService: VideosService);
    handleUpload(file: Express.Multer.File): Promise<{
        transcriptPath: any;
        translationPath: {
            vttPath: string;
            vttTranslationPath: string;
        };
    }>;
}
