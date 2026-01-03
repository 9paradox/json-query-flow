# Json Query Flow

Json Query Flow is a tool for **exploring, querying, and transforming JSON data** using a visual, node-based workflow.
It is intended for developers and data analysts who work with complex or unfamiliar JSON structures and need a fast, interactive way to understand and transform data.

---

## Overview

Json Query Flow provides a canvas where JSON data, queries, and outputs are connected as nodes.
It focuses on **exploration, validation, and prototyping** rather than production execution.

The tool helps users reason about JSON shape, experiment with queries, and verify results before those queries are moved into application code, scripts, or data pipelines.

---

## Screenshot

You can try the tool here:  
https://json-query-flow.9paradox.in/

![Json Query Flow – visual JSON query and transformation tool](./json-query-flow-screenshot.PNG)

---

## What this tool is

Json Query Flow allows you to:

* Load and inspect raw JSON data
* Write and test JSONata expressions interactively
* Chain transformations using a visual flow
* Inspect outputs as JSON, tables, or charts
* Optionally use AI assistance to help draft queries

It runs primarily in the browser and is designed for iterative exploration.

---

## Why this tool exists

Working with JSON often involves friction:

* API responses are deeply nested or undocumented
* Query logic is written blindly and tested later
* Data analysts need to explore structure before analysis
* Visualization requires extra scripts or tools

Json Query Flow reduces this friction by providing immediate feedback and visual context, making it easier to understand data and validate transformations early.

---

## Who this tool is for

* Backend engineers working with API responses
* Frontend engineers transforming data for UI consumption
* **Data analysts exploring JSON exports or API data**
* Developers prototyping transformation logic
* Teams debugging or validating JSON-based integrations

This tool is not intended to replace production data pipelines or analytics platforms.

---

## How the tool works

### Main Data Node

* Holds the input JSON
* Acts as the source for downstream nodes

### Query Nodes

* Accept JSON from connected nodes
* Support JSONata and natural language queries
* Emit transformed results

### Visualization

* Outputs can be viewed as:

  * Raw JSON
  * Table (for arrays of objects)
  * Bar and pie charts with aggregation options

### Execution model

* Queries execute client-side where possible
* AI-assisted queries are routed through a Cloudflare Worker
* API keys are forwarded per request and not persisted by the application

---

## AI integration (optional)

AI features are optional and require a user-provided API key.

* The key is sent securely to a Cloudflare Worker
* The worker forwards requests to the selected AI provider
* The application does not store or log API keys

AI assistance is intended to help with exploration and query drafting, not to replace manual validation.

---

## Built with

* **JSONata** – JSON query and transformation language
* **React Flow** – Node-based editor and canvas
* **Monaco Editor** – JSON and query editing
* **shadcn/ui** – UI components and accessibility primitives
* **Cloudflare Workers** – Secure edge runtime for AI requests

---

## Feedback and contributions

Feedback, bug reports, and contributions are welcome.

* Use GitHub Issues to report bugs or unexpected behavior
* Provide reproducible examples where possible
* Pull requests are welcome for fixes, improvements, or documentation updates

This project is evolving and open to practical improvements.

---

## License

MIT License
