#!/usr/bin/env python3
"""
Generate HTML presentation that can be printed to PDF
"""

import re
from pathlib import Path

def markdown_to_html(md_content):
    """Convert simple markdown to HTML"""
    # Split into slides
    slides = md_content.split('\n---\n')
    
    html_slides = []
    for i, slide in enumerate(slides):
        if not slide.strip():
            continue
            
        # Remove YAML frontmatter from first slide
        if i == 0 and slide.strip().startswith('---'):
            slide = re.sub(r'^---.*?---', '', slide, flags=re.DOTALL)
        
        # Convert headers
        slide = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', slide, flags=re.MULTILINE)
        slide = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', slide, flags=re.MULTILINE)
        slide = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', slide, flags=re.MULTILINE)
        slide = re.sub(r'^#### (.*?)$', r'<h4>\1</h4>', slide, flags=re.MULTILINE)
        
        # Convert bullet points
        slide = re.sub(r'^- (.*?)$', r'<li>\1</li>', slide, flags=re.MULTILINE)
        slide = re.sub(r'^• (.*?)$', r'<li>\1</li>', slide, flags=re.MULTILINE)
        slide = re.sub(r'^✅ (.*?)$', r'<li>✅ \1</li>', slide, flags=re.MULTILINE)
        slide = re.sub(r'^🔜 (.*?)$', r'<li>🔜 \1</li>', slide, flags=re.MULTILINE)
        
        # Wrap consecutive <li> in <ul>
        slide = re.sub(r'(<li>.*?</li>\n)+', lambda m: f'<ul>\n{m.group(0)}</ul>\n', slide, flags=re.MULTILINE)
        
        # Convert bold
        slide = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', slide)
        
        # Convert code blocks
        slide = re.sub(r'```(.*?)\n(.*?)```', r'<pre><code class="\1">\2</code></pre>', slide, flags=re.DOTALL)
        
        # Convert inline code
        slide = re.sub(r'`(.*?)`', r'<code>\1</code>', slide)
        
        # Convert paragraphs
        lines = slide.split('\n')
        processed = []
        in_list = False
        for line in lines:
            if line.strip().startswith('<'):
                processed.append(line)
                in_list = '</ul>' in line or '</ol>' in line
            elif line.strip() and not in_list:
                processed.append(f'<p>{line}</p>')
            else:
                processed.append(line)
        
        slide = '\n'.join(processed)
        html_slides.append(f'<div class="slide">\n{slide}\n</div>')
    
    return html_slides

# Read markdown
md_file = Path('PRESENTATION.md')
md_content = md_file.read_text()

# Convert to HTML
html_slides = markdown_to_html(md_content)

# Create HTML document
html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slalom Capabilities Management Platform - Presentation</title>
    <style>
        @page {{
            size: 11in 8.5in;
            margin: 0.5in;
        }}
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Calibri', 'Arial', sans-serif;
            color: #333;
            line-height: 1.6;
        }}
        
        .slide {{
            page-break-after: always;
            min-height: 7.5in;
            padding: 1in;
            background: white;
            position: relative;
        }}
        
        .slide:last-child {{
            page-break-after: avoid;
        }}
        
        h1 {{
            color: #003D7A;
            font-size: 2.5em;
            margin-bottom: 0.5em;
            border-bottom: 4px solid #0066CC;
            padding-bottom: 0.3em;
        }}
        
        h2 {{
            color: #003D7A;
            font-size: 2em;
            margin: 0.8em 0 0.5em 0;
        }}
        
        h3 {{
            color: #0066CC;
            font-size: 1.5em;
            margin: 0.6em 0 0.4em 0;
        }}
        
        h4 {{
            color: #00A3E0;
            font-size: 1.2em;
            margin: 0.5em 0 0.3em 0;
        }}
        
        p {{
            margin-bottom: 0.8em;
            font-size: 1.1em;
        }}
        
        ul, ol {{
            margin-left: 1.5em;
            margin-bottom: 1em;
        }}
        
        li {{
            margin-bottom: 0.5em;
            font-size: 1.1em;
        }}
        
        code {{
            background: #f4f4f4;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.9em;
        }}
        
        pre {{
            background: #f4f4f4;
            padding: 1em;
            border-radius: 5px;
            overflow-x: auto;
            margin-bottom: 1em;
        }}
        
        pre code {{
            background: none;
            padding: 0;
        }}
        
        strong {{
            color: #003D7A;
            font-weight: bold;
        }}
        
        .slide-number {{
            position: absolute;
            bottom: 0.5in;
            right: 0.5in;
            color: #999;
            font-size: 0.9em;
        }}
        
        @media print {{
            body {{
                background: white;
            }}
            
            .slide {{
                box-shadow: none;
            }}
        }}
        
        @media screen {{
            body {{
                background: #f0f0f0;
                padding: 2em;
            }}
            
            .slide {{
                max-width: 10in;
                margin: 2em auto;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }}
        }}
    </style>
</head>
<body>
{''.join(f'{slide}<div class="slide-number">Slide {i+1}</div>' for i, slide in enumerate(html_slides))}
</body>
</html>
"""

# Write HTML file
output_file = Path('PRESENTATION.html')
output_file.write_text(html)
print(f"✅ Created {output_file}")
print(f"📄 {len(html_slides)} slides generated")
print()
print("To convert to PDF:")
print("1. Open PRESENTATION.html in your browser")
print("2. Press Ctrl+P (Cmd+P on Mac)")
print("3. Select 'Save as PDF' as destination")
print("4. Save as 'SlalomCapabilities.pdf'")
