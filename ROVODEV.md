# ROVODEV Agent Instructions for Plank-Starter Project

## Project Overview
This project is a web-based floor plan designer built with Next.js 15, React 19, TypeScript, Konva.js, and Tailwind CSS 4.

## Effective Use of `docs/llm`

The `docs/llm` directory contains optimized documentation specifically for AI agents. Always refer to these documents for project context, technical specifications, architectural decisions, and implementation patterns.

- `project_summary.md`: Business requirements, stakeholders, and technical constraints.
- `task_management.md`: Development phases and task breakdown.
- `implementation_plan.md`: Step-by-step implementation guidance and technical details.


## Server Startup Best Practice

**Before starting the development server, always check if it is already running at <http://localhost:3000>.** This prevents redundant server startups and avoids port conflicts.

## General Interaction & Philosophy

-   **Code on Request Only**: Your default response should be a clear, natural language explanation. Do NOT provide code blocks unless explicitly asked, or if a very small and minimalist example is essential to illustrate a concept.
-   **Direct and Concise**: Answers must be precise, to the point, and free from unnecessary filler or verbose explanations. Get straight to the solution without "beating around the bush."
-   **Adherence to Best Practices**: All suggestions, architectural patterns, and solutions must align with widely accepted industry best practices and established design principles. Avoid experimental, obscure, or overly "creative" approaches. Stick to what is proven and reliable.
-   **Explain the "Why"**: Don't just provide an answer; briefly explain the reasoning behind it. Why is this the standard approach? What specific problem does this pattern solve? This context is more valuable than the solution itself.

## Minimalist & Standard Code Generation

-   **Principle of Simplicity**: Always provide the most straightforward and minimalist solution possible. The goal is to solve the problem with the least amount of code and complexity. Avoid premature optimization or over-engineering.
-   **Standard First**: Heavily favor standard library functions and widely accepted, common programming patterns. Only introduce third-party libraries if they are the industry standard for the task or absolutely necessary.
-   **Avoid Elaborate Solutions**: Do not propose complex, "clever," or obscure solutions. Prioritize readability, maintainability, and the shortest path to a working result over convoluted patterns.
-   **Focus on the Core Request**: Generate code that directly addresses the user's request, without adding extra features or handling edge cases that were not mentioned.


## Surgical Code Modification

-   **Preserve Existing Code**: The current codebase is the source of truth and must be respected. Your primary goal is to preserve its structure, style, and logic whenever possible.
-   **Minimal Necessary Changes**: When adding a new feature or making a modification, alter the absolute minimum amount of existing code required to implement the change successfully.
-   **Explicit Instructions Only**: Only modify, refactor, or delete code that has been explicitly targeted by the user's request. Do not perform unsolicited refactoring, cleanup, or style changes on untouched parts of the code.
-   **Integrate, Don't Replace**: Whenever feasible, integrate new logic into the existing structure rather than replacing entire functions or blocks of code.
