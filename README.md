# CodeTantra Reports Portal

Institutional Trainer Reporting & Academic Performance Intelligence Portal.

Consolidates Course Insights, Single Test Reports, and Segregation Test Reports into a unified, high-performance, 100% client-side platform.

![CodeTantra Reports](public/codetantra-logo.png)

## Overview

CodeTantra Reports empowers technical trainers, academic coordinators, and placement leads to parse student assessment and course progress data directly in the browser. Zero student data is transferred to external servers—all Excel calculations, merging, formula evaluation, and file generation happen in-memory.

### Key Modules

1. **Course Intelligence & Progress Reports**
   - Multi-section course progress aggregation
   - Password activation tracking
   - At-risk learner identification
   - Group-wise and section-wise performance breakdowns

2. **Single Test Analytics & Merging**
   - Merging attempted and unattempted student records
   - Custom test metadata and cutoff thresholds
   - Automatic pass/fail classifications
   - Instant export to Excel, HTML, and formatted PDF ZIP packages

3. **Test Segregation & Banding**
   - Section-level score distributions
   - Dynamic performer banding (Advanced, Good, Average, Focus)
   - Visual charts and comprehensive performance summaries

## Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide Icons + Motion
- **Spreadsheet Processing:** XLSX (SheetJS)
- **Document Generation:** jsPDF + autoTable, html2canvas, JSZip

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/CodeNinja-194/CT-Reports.git

# Navigate to directory
cd CT-Reports

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Deployment

Configured for seamless deployment on [Vercel](https://vercel.com) with Single Page Application routing (`vercel.json`).

---

Maintained by CodeTantra Trainers Team.
