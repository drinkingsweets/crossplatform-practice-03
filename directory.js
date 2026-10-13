const fs = require('node:fs/promises');

async function listDirectory(root, dir) {
  if (dir !== '.') {
    return { ok: false, error: 'Разрешён только рабочий каталог.' };
  }
  try {
    const entries = await fs.readdir(root, { withFileTypes: true });
    return {
      ok: true,
      entries: entries.map(e => ({ name: e.name, isDir: e.isDirectory() }))
        .sort((a, b) => Number(b.isDir) - Number(a.isDir) ||
          a.name.localeCompare(b.name, 'ru'))
    };
  } catch (error) {
    const messages = {
      ENOENT: 'Каталог не найден.', EACCES: 'Нет доступа к каталогу.',
      EPERM: 'Операция запрещена.', ENOTDIR: 'Путь не является каталогом.'
    };
    return { ok: false, error: messages[error.code] || 'Не удалось прочитать каталог.' };
  }
}
module.exports = { listDirectory };
