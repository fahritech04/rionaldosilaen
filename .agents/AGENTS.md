# Project-Scoped Rules for AI Agent (Visualisasi Dashboard)

The rules in this file must be strictly followed for any future tasks or interactions within this workspace:

1. **MANDATORY READING (PRD)**
   - Before executing ANY new tasks, writing new features, or modifying the UI/Logic, you MUST read the `PRD.md` file located in the root directory. This document outlines the architecture, tech stack, and design guidelines.

2. **READ BEFORE WRITE**
   - You MUST read and analyze the existing codebase (HTML, CSS, JS) using `read_file` or `view_file` BEFORE you write any new code or apply modifications. Do not assume the structure of the existing code.

3. **CLEAN CODE & D.R.Y (DON'T REPEAT YOURSELF)**
   - Strictly adhere to the DRY principle. Never write repetitive code or hardcoded logic.
   - If a logic, UI element, or data configuration is used multiple times, extract it into a reusable JavaScript function or CSS utility class.
   - Keep the codebase lightweight, elegant, and data-driven.

4. **PERFORMANCE FOCUS**
   - The web app must remain highly performant on mobile devices.
   - Be extremely careful with heavy CSS properties like `backdrop-filter` or `background-image` transitions. Use hardware acceleration (`will-change`) strategically.
