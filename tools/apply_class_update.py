from pathlib import Path
import base64, lzma

parts = sorted(Path('tools/update_chunks').glob('finalize_*.txt'))
payload = ''.join(p.read_text(encoding='utf-8').strip() for p in parts)
source = lzma.decompress(base64.b64decode(payload)).decode('utf-8')
exec(compile(source, 'finalize_class_pages.py', 'exec'))
