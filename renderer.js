const button = document.querySelector('#list-button');
const list = document.querySelector('#entries');
const message = document.querySelector('#message');
const versions = document.querySelector('#versions');

button.addEventListener('click', async () => {
  button.disabled = true;
  message.textContent = 'Чтение каталога…';
  list.replaceChildren();
  try {
    const result = await window.api.listDir('.');
    if (!result.ok) throw new Error(result.error);
    for (const entry of result.entries) {
      const li = document.createElement('li');
      li.className = entry.isDir ? 'directory' : 'file';
      const icon = document.createElement('span');
      icon.className = 'file-icon';
      icon.textContent = entry.isDir ? '▣' : '▤';
      icon.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
      name.textContent = entry.name;
      const type = document.createElement('span');
      type.className = 'entry-type';
      type.textContent = entry.isDir ? 'Каталог' : 'Файл';
      li.append(icon, name, type);
      list.append(li);
    }
    message.textContent = result.entries.length
      ? `Объектов: ${result.entries.length}. Каталоги показаны первыми.`
      : 'Каталог пуст.';
  } catch (error) {
    message.textContent = `Ошибка: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});
window.api.getVersions().then(info => {
  versions.textContent = `Electron ${info.electron}  •  Chromium ${info.chrome}  •  Node.js ${info.node}`;
}).catch(() => { versions.textContent = 'Не удалось получить версии компонентов.'; });
