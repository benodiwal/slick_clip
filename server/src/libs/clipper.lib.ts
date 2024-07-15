import ffmpeg from 'fluent-ffmpeg';
import { MergeProps, TrimProps } from 'types/clipper.type';

class Clipper {
  static trim = ({ inputPath, outputPath, start, end }: TrimProps): Promise<void> => {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions(['-hwaccel auto'])
        .outputOptions(['-c copy'])
        .setStartTime(start)
        .setDuration(end - start)
        .output(outputPath)
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        })
        .run();
    });
  };

  static merge = ({ inputPaths, outputPath }: MergeProps): Promise<void> => {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      inputPaths.forEach((inputPath) => {
        command.input(inputPath);
      });

      command
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        })
        .mergeToFile(outputPath, '/tmp');
    });
  };

  static validate = (inputPath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        if (!metadata || !metadata.format || typeof metadata.format.duration !== 'number') {
          reject(new Error('Unable to determine video duration'));
          return;
        }

        const durationInSeconds = metadata.format.duration;
        resolve(durationInSeconds);
      });
    });
  };
}

export default Clipper;
