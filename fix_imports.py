import asyncio
import aiohttp
from bot.main import bot, logger

async def fix_missing_import():
    """Fix missing aiohttp import in bot main.py"""
    pass

# Add the missing import to bot/main.py
with open('/workspaces/spark-template/bot/main.py', 'r') as f:
    content = f.read()

if 'import aiohttp' not in content:
    # Insert aiohttp import after existing imports
    lines = content.split('\n')
    import_section_end = -1
    for i, line in enumerate(lines):
        if line.startswith('import ') or line.startswith('from '):
            import_section_end = i
    
    if import_section_end > -1:
        lines.insert(import_section_end + 1, 'import aiohttp')
        
        with open('/workspaces/spark-template/bot/main.py', 'w') as f:
            f.write('\n'.join(lines))

asyncio.run(fix_missing_import())