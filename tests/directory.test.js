const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { listDirectory } = require('../directory');

test('Каталоги первыми, Unicode и необычные имена сохранены', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'electron-pr03-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.mkdir(path.join(root, 'Папка'));
  await fs.writeFile(path.join(root, '<b>текст.txt'), 'test');
  const result = await listDirectory(root, '.');
  assert.equal(result.ok, true);
  assert.deepEqual(result.entries, [
    { name: 'Папка', isDir: true }, { name: '<b>текст.txt', isDir: false }
  ]);
});
test('Пустой каталог, отсутствующий путь, файл вместо каталога', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'electron-pr03-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  assert.deepEqual(await listDirectory(root, '.'), { ok: true, entries: [] });
  assert.equal((await listDirectory(path.join(root, 'absent'), '.')).ok, false);
  await fs.writeFile(path.join(root, 'file'), 'x');
  assert.equal((await listDirectory(path.join(root, 'file'), '.')).ok, false);
});
test('Произвольные пути и неверные типы отклоняются', async () => {
  for (const dir of ['..', '/', '/etc', '', null, {}, 8]) {
    assert.equal((await listDirectory('/unused', dir)).ok, false);
  }
});
