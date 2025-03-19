import { useMemo } from 'react';
const useModelGenerator  = (activeTable, metadata, useStronglyTyped, dataAccessType) => {
    const mapToCSharpType = (sqlType, isNullable) => {
        let csharpType = 'string';
        switch (sqlType.toLowerCase()) {
          case 'int': csharpType = 'int'; break;
          case 'bigint': csharpType = 'long'; break;
          case 'bit': csharpType = 'bool'; break;
          case 'decimal': csharpType = 'decimal'; break;
          case 'float': case 'real': csharpType = 'float'; break;
          case 'datetime': case 'datetime2': case 'date': csharpType = 'DateTime'; break;
          case 'uniqueidentifier': csharpType = 'Guid'; break;
          case 'varbinary': case 'binary': case 'image': csharpType = 'byte[]'; break;
          default: csharpType = 'string';
        }
        if (isNullable && csharpType !== 'string' && csharpType !== 'byte[]') {
          return `${csharpType}?`;
        }
        return csharpType;
      };
    
      const generateModel = useMemo(() => {
            // Check if we have primary keys
            const primaryKeys = metadata[activeTable].PrimaryKeys;
            const hasCompositeKey = primaryKeys.length > 1;
        
            // Get all the foreign keys for the table
            const foreignKeys = metadata[activeTable].ForeignKeys;
            
            let modelCode = `using System;
        using System.Collections.Generic;
        using System.ComponentModel.DataAnnotations;
        using System.ComponentModel.DataAnnotations.Schema;
        
        namespace YourNamespace.Models
        {
            [Table("${activeTable}")]
            public class ${activeTable}
            {`;
        
            // Add properties for each column
            modelCode += metadata[activeTable].Columns.map(column => {
              let propertyCode = '\n        ';
              
              // Add appropriate data annotations
              if (primaryKeys.includes(column.Name)) {
                propertyCode += '[Key]\n        ';
                
                if (column.Type.toLowerCase() === 'int') {
                  propertyCode += '[DatabaseGenerated(DatabaseGeneratedOption.Identity)]\n        ';
                }
              }
              
              // Required attribute if not nullable
              if (!column.IsNullable && column.Type.toLowerCase() !== 'bit') {
                propertyCode += '[Required]\n        ';
              }
              
              // String length for varchar/nvarchar
              if ((column.Type.toLowerCase() === 'nvarchar' || column.Type.toLowerCase() === 'varchar') && column.MaxLength) {
                propertyCode += `[StringLength(${column.MaxLength})]\n        `;
              }
              
              // Display name using column name (split camelCase with spaces)
              const displayName = column.Name.replace(/([A-Z])/g, ' $1').trim();
              propertyCode += `[Display(Name = "${displayName}")]\n        `;
              
              // ForeignKey attribute for foreign keys
              const foreignKey = foreignKeys.find(fk => fk.Column === column.Name);
              if (foreignKey) {
                propertyCode += `[ForeignKey("${foreignKey.ReferenceTable}")]\n        `;
              }
              
              // Column attribute to specify exact column name if different
              propertyCode += `[Column("${column.Name}")]\n        `;
              
              // Property declaration
              const csharpType = mapToCSharpType(column.Type, column.IsNullable);
              propertyCode += `public ${csharpType} ${column.Name} { get; set; }`;
              
              return propertyCode;
            }).join('\n');
        
            // Add navigation properties for foreign keys
            if (foreignKeys.length > 0) {
              modelCode += '\n\n        // Navigation Properties';
              
              foreignKeys.forEach(fk => {
                modelCode += `\n        public virtual ${fk.ReferenceTable} ${fk.ReferenceTable} { get; set; }`;
              });
            }
        
            // Complete the class definition
            modelCode += '\n    }\n}';
            
            return modelCode;
      }, [activeTable, metadata]);
    return {
        modelCode: generateModel,
      };
}

export default useModelGenerator;