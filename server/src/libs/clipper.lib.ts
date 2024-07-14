import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { MergeProps, TrimProps } from 'types/clipper.type';

class Clipper {
  static trim = ({ inputPath, outputPath, start, end }: TrimProps): Promise<void> => {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
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

  static merge = ({ inputPaths, outputPath, tmpFolder }: MergeProps): Promise<void> => {
    return new Promise((resolve, reject) => {
      const tmpFilePath = path.join(tmpFolder, 'filelist.txt');
      const fileContent = inputPaths.map((inputPath) => `file '${inputPath}'`).join('\n');

      fs.writeFile(tmpFilePath, fileContent, (err) => {
        if (err) {
          return reject(err);
        }

        ffmpeg()
          .input(tmpFilePath)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .outputOptions(['-c', 'copy'])
          .output(outputPath)
          .on('end', () => {
            fs.unlink(tmpFilePath, (unlinkErr) => {
              if (unlinkErr) {
                return reject(unlinkErr);
              }
              resolve();
            });
          })
          .on('error', (ffmpegErr) => {
            fs.unlink(tmpFilePath, () => {
              reject(ffmpegErr);
            });
          })
          .run();
      });
    });
  };
}

export default Clipper;
