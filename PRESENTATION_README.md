# Presentation Files README

## 📊 Presentation Materials Created

This folder contains presentation materials for the Slalom Capabilities Management Platform project.

### Files Included

1. **PRESENTATION.md** - Full Markdown presentation (26 slides)
2. **PRESENTATION_OUTLINE.txt** - Text outline for PowerPoint import
3. **PRESENTATION_README.md** - This file (instructions)

---

## 🎯 How to Create PowerPoint

### Option 1: Using Pandoc (Recommended)

**Install Pandoc:**
```bash
# Mac
brew install pandoc

# Windows
choco install pandoc

# Linux
sudo apt-get install pandoc
```

**Convert Markdown to PowerPoint:**
```bash
pandoc PRESENTATION.md -o SlalomCapabilities.pptx
```

**With custom template:**
```bash
pandoc PRESENTATION.md -o SlalomCapabilities.pptx --reference-doc=template.pptx
```

---

### Option 2: Using Marp (Web-based)

1. Install Marp CLI:
```bash
npm install -g @marp-team/marp-cli
```

2. Convert to PowerPoint:
```bash
marp PRESENTATION.md --pptx -o SlalomCapabilities.pptx
```

3. Or use Marp VS Code extension:
   - Install "Marp for VS Code" extension
   - Open PRESENTATION.md
   - Click "Export Slide Deck" → Choose PPTX

---

### Option 3: Manual Import (Simple)

1. Open PowerPoint
2. Open `PRESENTATION_OUTLINE.txt`
3. For each slide:
   - Create new slide
   - Copy the slide title
   - Copy bullet points
   - Format as needed

---

### Option 4: Google Slides Import

1. Open Google Slides
2. File → Import Slides
3. Upload PRESENTATION.md (may need conversion)
4. Or use: https://marp.app (web interface)
   - Paste PRESENTATION.md content
   - Export to Google Slides or PPTX

---

## 📋 Presentation Overview

**Title:** Slalom Capabilities Management Platform  
**Subtitle:** Project Enhancements & Roadmap  
**Slides:** 26  
**Duration:** 20-25 minutes  
**Format:** Technical project review

### Slide Breakdown

- **Slides 1-3:** Introduction & Statistics
- **Slides 4-14:** Completed Enhancements (9 features)
- **Slides 15-19:** Pending Features (4 roadmap items)
- **Slides 20-26:** Roadmap, Success Factors, Next Steps

---

## 🎨 Recommended PowerPoint Theme

### Slalom Brand Colors
- **Primary Blue:** #003D7A
- **Light Blue:** #0066CC
- **Accent:** #00A3E0
- **Dark Text:** #333333
- **Background:** #FFFFFF or #F5F5F5

### Font Recommendations
- **Headers:** Calibri Bold or Arial Bold
- **Body:** Calibri Regular or Arial Regular
- **Code:** Consolas or Courier New

---

## 📊 Visual Enhancements

### Suggested Graphics

**Slide 3 (Statistics):**
- Use number callout cards
- Show +4,953 lines, 37 files, 3 days

**Slide 15 (Roadmap):**
- Gantt chart or timeline
- Color-code by priority (High/Medium)

**Slide 20 (Implementation):**
- Phased timeline diagram
- Show dependencies between issues

**Slide 22 (Impact):**
- Two-column comparison
- Icons for consultants vs practice leads

---

## 🎬 Presentation Tips

### Key Messages
1. **AI-Powered Development** - 10x productivity with Copilot + MCP
2. **Rapid Delivery** - 9 features in 3 days
3. **Clear Roadmap** - 4 more features planned
4. **Business Value** - Serving both consultants and practice leads

### Demo Moments
- **Slide 9:** Live demo of autocomplete search
- **Slide 10:** Show practice lead workspace
- **Slide 12:** Explain custom AI agents

### Q&A Preparation
- Be ready to explain MCP (Model Context Protocol)
- Discuss security approach (HMAC sessions)
- Show GitHub repository and issues
- Explain RAG for AI chat agent

---

## 🔗 Additional Resources

### Links to Include
- **Repository:** https://github.com/sukantadeyslalom/copilot-bootcamp-capstone-project
- **Live Demo:** [Add your Codespace URL]
- **Documentation:** `/docs` folder
- **Issues:** GitHub Issues tab

### Supporting Materials
- Screenshot of enhanced search with autocomplete
- Screenshot of practice lead dashboard
- Architecture diagram (from docs/screen-structure.md)
- Roadmap diagram (from docs/revamp-roadmap.md)

---

## 📱 Export Formats

### Available Formats
- **PPTX:** Microsoft PowerPoint
- **PDF:** For sharing/printing
- **Google Slides:** For cloud collaboration
- **HTML:** For web viewing (using Marp)

### Example Exports
```bash
# PowerPoint
pandoc PRESENTATION.md -o output.pptx

# PDF
pandoc PRESENTATION.md -o output.pdf

# HTML (with Marp)
marp PRESENTATION.md -o output.html
```

---

## ✏️ Customization

### To Customize Content

1. **Edit PRESENTATION.md** for structural changes
2. **Edit PRESENTATION_OUTLINE.txt** for quick text updates
3. Add speaker notes in PowerPoint after export
4. Insert screenshots from the live app
5. Add company logo to slides

### Speaker Notes Template
```
Slide X:
- Key point to emphasize
- Data to mention
- Transition to next slide
```

---

## 🎯 Target Audience

**Primary:** Technical stakeholders, practice leads, engineering teams  
**Secondary:** Business stakeholders, project managers  
**Level:** Technical with business context  

---

## 📞 Contact

**Presenter:** Sukanta Dey  
**Email:** sukanta.dey77@gmail.com  
**Slack:** @sukantadey

---

**Last Updated:** April 24, 2026  
**Version:** 1.0  
**Status:** Ready for presentation  

