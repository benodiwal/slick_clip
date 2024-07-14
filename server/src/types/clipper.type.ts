export type TrimProps = {
    inputPath: string;
    outputPath: string;
    start: number;
    end: number;
}


export type MergeProps = {
    inputPaths: string[];
    outputPath: string;
    tmpFolder: string;
}
