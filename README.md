# Proposal: Mermaid to YAML/JSON – A Future-Ready Approach 🚀

## 🔍 The Challenge: Keeping Code and Documentation in Sync  

- **Imagine this:** You sketch out a **class diagram** in Mermaid.js 🏗️, but then manually translate it into **code** 💻.  
- Each time the design evolves, documentation and implementation **drift apart** 📉.  
- The result? **Confusion, outdated docs, and inconsistencies** across teams.  

> ❓ What if the **diagram itself** could be the **single source of truth**?  

> **I'm not asking to change how Mermaid works – i want to make it more powerful.💪**  

## 💡 The Opportunity: Empowering Mermaid.js Users  

Right now, Mermaid.js is **fantastic** for visualization. But what if we could **go beyond diagrams** and make them **actionable**?  

### 🔹 The Proposal  

Generate an intermediate structure that can easily be imported and used to generate a number of things.

In this piece of code a example application a classdiagram is converted into a yml file.

e.g.

Car.yml

You can then add additional properties to the Car that is valuable for a classdiagram visualization but might be valuable for a software unit.

Forexample, description above methods/classes and attributes.

Therefore you can add your own file

Car.Custom.yml

You can then load both into memory and then generate code from this. 

Maybe use [liquid](https://shopify.github.io/liquid/basics/introduction/) / [xslt](https://www.w3schools.com/xml/xml_xslt.asp) / [handlebarsjs](https://handlebarsjs.com/guide/) templates for this?

In C# you have the concept of [partial classes](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/partial-classes-and-methods)
Which you can then extend to implement the methods mentioned in the class diagrams

## Behond classdiagrams

I used classdiagrams but technically you can extend this structure for more than just class diagrams
, think of, 
[Threat modeling with STRIDE](https://owasp.org/www-community/Threat_Modeling_Process)
Drawing the diagram and then being able directly see which elements of the STRIDE is applicable.

Or Generating SQL Schema from ERDs

## 🔬 Proof of Concept  

This repo makes use of the class diagram jison file that was copied from the following [location](https://github.com/mermaid-js/mermaid/blob/develop/packages/mermaid/src/diagrams/class/parser/classDiagram.jison). 
It simply transforms mermaid to yml.

### How It Works:  

1️⃣ **Write a diagram** in Mermaid.js 📊  
2️⃣ **Convert it to YAML/JSON** with a lightweight parser  
3️⃣ **Use YAML to generate** transforms to yml  🎯  

🔗 The prototype builds on **Mermaid’s existing grammar**, ensuring a **non-intrusive** extension.

## 🤝 Why This Matters for Mermaid.js  

- **More Adoption** – Opens up Mermaid.js to **backend engineers, DevOps, and automation tools**.  
- **Stronger Ecosystem** – Enables integration with **code generation frameworks**.  
- **Minimal Overhead** – Uses **Mermaid’s existing class diagram syntax**, without introducing breaking changes.  

> 🚀 **This is a win-win. Developers get more power, and Mermaid.js solidifies its position as the go-to tool for both visualization and automation.**  

## 🔧 Next Steps  

### ✅ Seeking Community Feedback  

🔹 Would this feature help your workflow?  
🔹 Would you support adding YAML/JSON generation to Mermaid?  

This is a **proposal for future implementation**, but with the right momentum, we can bring this to life.  

👥 **Let’s discuss!** I’d love to hear feedback, collaborate, and refine this idea further.  

### Requiring assistance with adding this

I'm not so familiar with the mermaid repository but I am willing to learn and assist building this? Help might be needed

## Project Structure

- `classDiagram.jison`: Contains the Jison grammar for parsing Mermaid class diagrams. This file was copied from the following  [location](https://github.com/mermaid-js/mermaid/blob/develop/packages/mermaid/src/diagrams/class/parser/classDiagram.jison)
- `classDiagramParser.js`: Generated parser from the Jison grammar.
- `mermaid.md`: Example Mermaid class diagram.
- `processJison.js`: Script to generate the parser from the Jison grammar.
- `processMermaid.js`: Script to parse the Mermaid diagram and generate YAML files.
- `output/`: Directory where the generated YAML files are stored.
- `package.json`: Project dependencies and scripts.

## Usage

1. **Install dependencies**:
    ```sh
    npm install
    ```

2. **Generate the parser**:
    ```sh
    npm run produce-js
    ```

3. **Generate YAML files from the Mermaid diagram**:
    ```sh
    npm run produce-yml
    ```

## Example

The [mermaid.md](./mermaid.md) file contains an example Mermaid class diagram. Running the above commands will generate corresponding YAML files in the [output](./output/) directory.
