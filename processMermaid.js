// We'll remove empty object fields (Dependencies, Compositions, Aggregations, etc.) in the final YAML.
// Updated code below:

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Ensure this import is present at the top
const parser = require('./classDiagramParser.js').parser;

// Extend the parser's `yy` object to handle class-specific logic
parser.yy = {
    namespaces: {},

    addNamespace: function (namespace) {
        if (!this.namespaces[namespace]) {
            this.namespaces[namespace] = {};
        }
        this.currentNamespace = namespace; // Set the current namespace
    },

    addClass: function (className) {
        const currentNamespace = this.currentNamespace || 'global';
        if (!this.namespaces[currentNamespace]) {
            this.namespaces[currentNamespace] = {};
        }
        if (!this.namespaces[currentNamespace][className]) {
            this.namespaces[currentNamespace][className] = {
                Name: className,
                Namespace: currentNamespace,
                Type: 'Class',
                Attributes: {},
                Methods: {},
                Dependencies: {},
                Compositions: {},
                Aggregations: {},
                Assocations: {},
                Realizations: {},
                Implementations: {},
                Inheritance: '',
                Lines: {},
                DashedLinks: {},

            };
        }
    },

    addMembers: function (className, members) {
        const currentNamespace = this.currentNamespace || 'global';
        if (this.namespaces[currentNamespace] && this.namespaces[currentNamespace][className]) {
            members.forEach((member) => {
                //Method: + methodName(args): returnType
                const matchMethod = member.trim().match(/([+\-#~])\s*([\w<>]+)\s+(\w+)\s*\(([^)]*)\)\s*[;]*([\*\$]*)*?$/);

                const matchAttribute = member.trim().match(/([+\-#~])\s*([\w<>]+)\s+(\w+)\s*[;]*([\*\$]*)*?$/);
                
                if (matchMethod) {
                    
                    const [_, scopeSymbol, type, name, methodArgs] = matchMethod;
                    const scopeMap = { '+': 'Public', '-': 'Private', '#': 'Protected', '~': 'Package' };
                    const scope = scopeMap[scopeSymbol] || 'Public';

                    if (methodArgs) {
                        // Add method
                        this.namespaces[currentNamespace][className].Methods[name] = {
                            ReturnType: type,
                            Scope: scope,
                            Classifiers: '',
                            Arguments: methodArgs.split(',').map((arg) => {
                                const [argType, argName] = arg.trim().split(/\s+/);
                                return {
                                    Type: argType,
                                    Name: argName,
                                };
                            }),
                        };
                    }
                    else
                    {
                        this.namespaces[currentNamespace][className].Methods[name] = {
                            ReturnType: type,
                            Scope: scope,
                            Classifiers: ''
                        };
                    }
                }

                //Attribute: - attributeName: type
                else if(matchAttribute) {
                    const [_, scopeSymbol, type, name] = matchAttribute;
                    const scopeMap = { '+': 'Public', '-': 'Private', '#': 'Protected', '~': 'Package' };
                    const scope = scopeMap[scopeSymbol] || 'Public';
                    // Add attribute
                    this.namespaces[currentNamespace][className].Attributes[name] = {
                        Type: type,
                        IsSystemType: !!type.match(/^[A-Z]/),
                        Scope: scope,
                        DefaultValue: '',
                    };
                }
            });
        } else {
            console.warn(
                `Warning: Attempted to add members to class "${className}" in namespace "${currentNamespace}", but it does not exist.`
            );
        }
    },

    addRelation: function (relation) {
        const { id1, id2, relation: relationType, multiplicity = '1', title } = relation;
        for (const ns of Object.values(this.namespaces)) {
           

            for (const className of Object.values(ns))
            {
                if (className.Name === id1) {
                    
                    const relationEntry = {
                        Multiplicity: multiplicity,
                        // Type: relationType.lineType.toLowerCase().replace('_', ''),
                        Description: title.replace(':','').trim(),
                    };
                    const relationTypeLine = relationType.lineType.toLowerCase().replace('_', '');
                    if (relationTypeLine === 'composition') {
                        ns[id1].Compositions[id2] = relationEntry;
                    } else if (relationTypeLine === 'aggregation') {
                        ns[id1].Aggregations[id2] = relationEntry;
                    } else if (relationTypeLine === 'association') {
                        ns[id1].Assocations[id2] = relationEntry;
                    }
                    else if (relationTypeLine === 'realization') {
                        ns[id1].Realizations[id2] = relationEntry;
                    }
                    else if(relationTypeLine === 'inheritance') {
                        ns[id1].Inheritance = id2;
                    }
                    else if(relationTypeLine === 'implementation') {
                        ns[id1].Implementations[id2] = relationEntry;
                    }
                    else if(relationTypeLine === 'line') {
                        ns[id1].Lines[id2] = relationEntry;
                    }
                    else if(relationTypeLine === 'dottedline') {
                        ns[id1].DashedLinks[id2] = relationEntry;
                    }
                    else if (relationTypeLine === 'dependency') {
                        ns[id1].Dependencies[id2] = relationEntry;
                    }
                }
                
            }
        }
    },

    cleanupLabel: function (label) {
        return label.trim();
    },

    addClassesToNamespace: function (namespace, classes) {
        this.addNamespace(namespace); // Ensure namespace is created
        this.currentNamespace = namespace;
        classes.forEach((className) => this.addClass(className));
    },

    relationType: {
        EXTENSION: 'extension',
        COMPOSITION: 'composition',
        AGGREGATION: 'aggregation',
        ASSOCIATION: 'association',
        DEPENDENCY: 'dependency',
        REALIZATION: 'realization'
    },

    lineType: {
        LINE: 'line',
        DOTTED_LINE: 'dotted_line'
    },
};

// Helper function to remove empty object keys
function removeEmptyKeys(obj) {
    if (typeof obj !== 'object' || obj === null) return;

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];

            if (typeof value === 'object') {
                // Recursively clean nested objects
                removeEmptyKeys(value);

                // After cleaning, remove the key if still empty
                if (Object.keys(value).length === 0) {
                    delete obj[key];
                }
            } else if (Array.isArray(value) && value.length === 0) {
                delete obj[key];
            } else if (value === '' && (key !== 'Name' && key !== 'Namespace' && key !== 'Type')) {
                // Optionally remove empty strings, except for these fields if needed
                delete obj[key];
            }
        }
    }
}

// Read the Mermaid file
const mermaidFilePath = path.join(__dirname, 'mermaid.md');
const mermaidFileContent = fs.readFileSync(mermaidFilePath, 'utf8');

// Parse the Mermaid file
try {
    parser.parse(mermaidFileContent);

    // Generate YAML files for each class
    for (const [namespace, classes] of Object.entries(parser.yy.namespaces)) {
        const namespaceDir = path.join(__dirname, 'output', namespace.replace(/\./g, '_'));
        fs.mkdirSync(namespaceDir, { recursive: true });

        for (const [className, classData] of Object.entries(classes)) {
            // Remove empty keys before converting to YAML
            removeEmptyKeys(classData);

            const yamlOutput = yaml.dump(classData, { noRefs: true });
            const outputFilePath = path.join(namespaceDir, `${className}.yml`);
            fs.writeFileSync(outputFilePath, yamlOutput);
            console.log(`Generated YAML for class: ${className}, namespace: ${namespace}`);
        }
    }
} catch (error) {
    console.error('Error parsing Mermaid diagram:', error.message);
    console.error(error.stack);
}
