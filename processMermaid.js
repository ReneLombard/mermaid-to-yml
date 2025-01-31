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
        console.log('Namespace added:', namespace);
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
            };
        }
        console.log('Class added:', className, 'to namespace:', currentNamespace);
    },

    addMembers: function (className, members) {
        const currentNamespace = this.currentNamespace || 'global';
        if (this.namespaces[currentNamespace] && this.namespaces[currentNamespace][className]) {
            members.forEach((member) => {
                const match = member.trim().match(/^([+\-#~])(\w+)\s+([\w<>]+)\s*(\(.+\))?\s*$/);
                if (match) {
                    const [_, scopeSymbol, type, name,  methodArgs] = match;
                    const scopeMap = { '+': 'Public', '-': 'Private', '#': 'Protected', '~': 'Package' };
                    const scope = scopeMap[scopeSymbol] || 'Public';

                    if (methodArgs) {
                        // Add method
                        this.namespaces[currentNamespace][className].Methods[name] = {
                            ReturnType: type,
                            Scope: scope,
                            Classifiers: '',
                        };
                    } else {
                        // Add attribute
                        this.namespaces[currentNamespace][className].Attributes[name] = {
                            Type: type,
                            IsSystemType: !!type.match(/^[A-Z]/),
                            Scope: scope,
                            DefaultValue: '',
                        };
                    }
                }
            });
        } else {
            console.warn(
                `Warning: Attempted to add members to class "${className}" in namespace "${currentNamespace}", but it does not exist.`
            );
        }
        console.log('Members added to class:', className, members);
    },

    addRelation: function (relation) {
        const { id1, id2, relation: relationType, multiplicity = '1' } = relation;
        
        console.log('Relation:', relation);
        if (typeof relationType !== 'string') {
            console.error(`Invalid relation type for relation:`, relation);
            return;
        }

        for (const ns of Object.values(this.namespaces)) {
            
            if (ns[id1]) {
                const relationEntry = {
                    Multiplicity: multiplicity,
                    Type: relationType.toLowerCase().replace('_', ''),
                };
                if (relationType === 'composition') {
                    ns[id1].Compositions[id2] = relationEntry;
                } else if (relationType === 'aggregation') {
                    ns[id1].Aggregations[id2] = relationEntry;
                } else {
                    ns[id1].Dependencies[id2] = { Type: id2, Scope: 'Private' };
                }
            }
        }
        console.log('Relation added:', relation);
    },

    cleanupLabel: function (label) {
        return label.trim();
    },
    addClassesToNamespace: function (namespace, classes) {
        this.addNamespace(namespace); // Ensure namespace is created
        this.currentNamespace = namespace;
        classes.forEach((className) => this.addClass(className));
        console.log('Classes added to namespace:', namespace, classes);
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

// Read the Mermaid file
const mermaidFilePath = path.join(__dirname, 'mermaid.md');
const mermaidFileContent = fs.readFileSync(mermaidFilePath, 'utf8');

// Parse the Mermaid file
try {
    const parsedObject = parser.parse(mermaidFileContent);

    // Generate YAML files for each class
    for (const [namespace, classes] of Object.entries(parser.yy.namespaces)) {
        const namespaceDir = path.join(__dirname, 'output', namespace.replace(/\./g, '_'));
        fs.mkdirSync(namespaceDir, { recursive: true });

        for (const [className, classData] of Object.entries(classes)) {
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
