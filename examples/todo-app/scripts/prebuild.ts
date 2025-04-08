import * as path from 'node:path';
import * as fsp from 'node:fs/promises';

async function isExists(filePath: string) {
  try {
    return (await fsp.stat(filePath)).isFile();
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

if (!(await isExists('amplify_outputs.json'))) {
  await fsp.writeFile(path.join('amplify_outputs.json'), JSON.stringify({}));
}
