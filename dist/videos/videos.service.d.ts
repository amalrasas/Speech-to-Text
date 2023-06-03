import { ConfigService } from '@nestjs/config';
export declare class VideosService {
    private configService;
    constructor(configService: ConfigService);
    OPENAI_API_KEY_TRANSCRIPTION: any;
    OPENAI_API_KEY_TRANSLATION: any;
    getAudio(filepath: string): Promise<string>;
    getTranscriptAndTranslation(filename: string): Promise<{
        vttPath: string;
        vttTranslationPath: string;
    }>;
    deleteFiles(filePath: string): Promise<void>;
    writeVttFiles(vttPath: string, response: any): Promise<string>;
}
