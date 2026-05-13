import { zip, strToU8 } from 'fflate';

export const createZip = (files: { name: string; content: string }[]): Promise<Blob> => {
  const data: Record<string, Uint8Array> = {};
  for (const file of files) {
    data[file.name] = strToU8(file.content);
  }

  return new Promise((resolve, reject) => {
    zip(data, (err, result) => {
      if (err) return reject(err);
      // @ts-ignore
      resolve(new Blob([result], { type: 'application/zip' }));
    });
  });
};
