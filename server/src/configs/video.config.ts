import js_yaml from 'js-yaml';
import fs from 'fs';

class VideoConfig {
    maxSize: bigint;
    minDuration: number;
    maxDuration: number;

    constructor(maxSize: bigint, minDuration: number, maxDuration: number) {
        this.maxSize = maxSize;
        this.minDuration = minDuration;
        this.maxDuration = maxDuration;
    }

    static read(filePath: string): string {
        return fs.readFileSync(filePath, 'utf8');
    }

    static deserialize(yamlString: string): VideoConfig {
        const data = js_yaml.load(yamlString) as { maxSize: string; minDuration: number; maxDuration: number };
        
        if (typeof data.maxSize !== 'string' || typeof data.minDuration !== 'number' || typeof data.maxDuration !== 'number') {
            throw new Error('Invalid YAML format');
        }

        const maxSizeMatch = data.maxSize.match(/^(\d+)(mb)$/i);
        if (!maxSizeMatch) {
            throw new Error('Invalid maxSize format');
        }
        
        const maxSizeValue = BigInt(maxSizeMatch[1]);
        const maxSizeUnit = maxSizeMatch[2].toLowerCase();

        let maxSizeInBytes: bigint;
        switch (maxSizeUnit) {
            case 'mb':
                maxSizeInBytes = maxSizeValue * BigInt(1024 * 1024);
                break;
            default:
                throw new Error('Unsupported size unit');
        }

        return new VideoConfig(maxSizeInBytes, data.minDuration, data.maxDuration);
    }

    static fromFile(filePath: string): VideoConfig {
        const yamlString = VideoConfig.read(filePath);
        return VideoConfig.deserialize(yamlString);
    }
}

export default VideoConfig;
