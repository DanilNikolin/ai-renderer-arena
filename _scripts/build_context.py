# coding: utf-8
import os
import json

# --- НАСТРОЙКИ ---
PROJECT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUTPUT_PATH = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILENAME_BASE = "ai_renderer_arena_context"
CREATE_JSON_DOC = True
CREATE_MARKDOWN_DOC = True

# --- ФИЛЬТРЫ ---
EXTENSIONS = ('.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.mjs', '.cjs', '.gitignore', '.mdx')
IGNORE_PATHS = (
    'node_modules', '.git', '.next', 'dist', 'build', 'out',
    '.cache', '.swc', '.vscode', 'package-lock.json', '.env*',
    '_scripts'
)
LANG_MAP = {
    '.js': 'javascript', '.jsx': 'javascript', '.ts': 'typescript',
    '.tsx': 'typescript', '.html': 'html', '.css': 'css',
    '.json': 'json', '.md': 'markdown',
    '.mjs': 'javascript', '.cjs': 'javascript', '.gitignore': 'plaintext',
    '.mdx': 'markdown'
}

def create_file_tree(file_paths, project_root):
    """Создает текстовое дерево файлов для Markdown."""
    tree_header = "## Структура проекта\n\n```\n"
    tree_header += f"{os.path.basename(project_root)}\n"
    
    structure = {}
    for path in sorted(file_paths):
        parts = path.split('/')
        current_level = structure
        for part in parts:
            if part not in current_level:
                current_level[part] = {}
            current_level = current_level[part]

    def build_tree_string(d, indent=''):
        s = ''
        items = sorted(d.items())
        for i, (key, value) in enumerate(items):
            is_last = i == (len(items) - 1)
            s += indent
            if is_last:
                s += '└── '
                s_indent = '    '
            else:
                s += '├── '
                s_indent = '│   '
            s += key + '\n'
            if isinstance(value, dict) and value:
                 s += build_tree_string(value, indent + s_indent)
        return s

    tree = tree_header + build_tree_string(structure) + "```\n\n" + ("---") + "\n\n"
    return tree


def main():
    print(f"🚀 Начинаю обработку проекта: {PROJECT_PATH}")

    if not os.path.exists(OUTPUT_PATH):
        os.makedirs(OUTPUT_PATH)
        print(f"✓ Создана папка для вывода: {OUTPUT_PATH}")

    project_data = []
    relative_paths = []

    for root, dirs, files in os.walk(PROJECT_PATH, topdown=True):
        # Фильтруем папки на лету
        dirs[:] = [d for d in dirs if d not in IGNORE_PATHS]
        
        for file in files:
            full_path = os.path.join(root, file)
            relative_path = os.path.relpath(full_path, PROJECT_PATH).replace('\\', '/')

            # ✨ ИСПРАВЛЕНИЕ:
            # Сначала вычисляем relative_path, а потом используем его в проверках.
            # Также упрощаем проверку на вхождение в игнорируемые пути.
            
            # 1. Проверка по расширению файла
            if not file.endswith(EXTENSIONS):
                continue
            
            # 2. Проверка по игнорируемым путям
            path_parts = relative_path.split('/')
            if any(part in IGNORE_PATHS for part in path_parts):
                continue

            try:
                with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                file_size_kb = round(os.path.getsize(full_path) / 1024, 2)
                project_data.append({
                    "path": relative_path,
                    "content": content
                })
                relative_paths.append(relative_path)
                print(f"  [OK] {relative_path} ({file_size_kb} KB)")

            except Exception as e:
                print(f"  [WARN] Не удалось прочитать файл {full_path}: {e}")
    
    print(f"\n🔍 Найдено и отфильтровано {len(project_data)} файлов.")

    print("🌲 Создаю дерево файлов...")
    file_tree = create_file_tree(relative_paths, PROJECT_PATH)

    if CREATE_JSON_DOC:
        json_path = os.path.join(OUTPUT_PATH, f"{OUTPUT_FILENAME_BASE}.json")
        print(f"💾 Сохраняю в JSON: {json_path}")
        final_json_object = {
            "project_name": os.path.basename(PROJECT_PATH),
            "file_tree": file_tree,
            "code_files": project_data
        }
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(final_json_object, f, indent=2, ensure_ascii=False)

    if CREATE_MARKDOWN_DOC:
        md_path = os.path.join(OUTPUT_PATH, f"{OUTPUT_FILENAME_BASE}.md")
        print(f"💾 Сохраняю в Markdown: {md_path}")
        try:
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(f"# Контекст проекта: {os.path.basename(PROJECT_PATH)}\n\n")
                f.write(file_tree)
                
                for file_data in project_data:
                    f.write(f"## Файл: `{file_data['path']}`\n\n")
                    
                    _, extension = os.path.splitext(file_data['path'])
                    lang = LANG_MAP.get(extension, 'plaintext')
                    
                    f.write(f"```{lang}\n")
                    f.write(file_data['content'])
                    f.write("\n```\n\n")
                    f.write("---\n\n")

            print("✓ Документ Markdown успешно сохранен.")
        except Exception as e:
            print(f"💥 ОШИБКА при создании Markdown файла: {e}")

    print("\n✅ ГОТОВО. Контекст проекта собран.")

if __name__ == "__main__":
    main()