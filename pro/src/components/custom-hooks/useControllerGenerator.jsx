import { useMemo } from 'react';
const useControllerGenerator = (activeTable, metadata, useStronglyTyped, dataAccessType) => {
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
    const generateController = useMemo(() => {

        const primaryKeys = metadata[activeTable].PrimaryKeys;

        // Define parameters for primary keys
        const paramList = primaryKeys.map(pk => {
            const column = metadata[activeTable].Columns.find(col => col.Name === pk);
            return `${mapToCSharpType(column.Type, false)} ${pk.toLowerCase()}`;
        }).join(', ');

        // Define primary key finder for Get method
        const primaryKeyFinder = primaryKeys.map(pk => `${pk} == ${pk.toLowerCase()}`).join(' && ');

        // Entity Framework controller
        if (dataAccessType === 'ef') {
            return `using System;
        using System.Collections.Generic;
        using System.Linq;
        using System.Threading.Tasks;
        using Microsoft.AspNetCore.Mvc;
        using Microsoft.EntityFrameworkCore;
        using YourNamespace.Data;
        using YourNamespace.Models;
        
        namespace YourNamespace.Controllers
        {
            public class ${activeTable}Controller : Controller
            {
                private readonly ApplicationDbContext _context;
        
                public ${activeTable}Controller(ApplicationDbContext context)
                {
                    _context = context;
                }
        
                // GET: ${activeTable}
                public async Task<IActionResult> Index()
                {
                    return View(await _context.${activeTable}
                        ${useStronglyTyped ? '.ToListAsync()' : '.Select(x => (dynamic)x).ToListAsync()'});
                }
        
                // GET: ${activeTable}/Details/5
                public async Task<IActionResult> Details(${paramList})
                {
                    if (${primaryKeys.length === 0 ? 'true' : 'false'})
                    {
                        return NotFound();
                    }
        
                    var ${activeTable.toLowerCase()} = await _context.${activeTable}
                        .FirstOrDefaultAsync(m => ${primaryKeyFinder || 'true'});
                        
                    if (${activeTable.toLowerCase()} == null)
                    {
                        return NotFound();
                    }
        
                    return View(${activeTable.toLowerCase()});
                }
        
                // GET: ${activeTable}/Create
                public IActionResult Create()
                {
                    return View();
                }
        
                // POST: ${activeTable}/Create
                [HttpPost]
                [ValidateAntiForgeryToken]
                public async Task<IActionResult> Create([Bind("${metadata[activeTable].Columns.map(col => col.Name).join(',')}")] ${activeTable} ${activeTable.toLowerCase()})
                {
                    if (ModelState.IsValid)
                    {
                        _context.Add(${activeTable.toLowerCase()});
                        await _context.SaveChangesAsync();
                        return RedirectToAction(nameof(Index));
                    }
                    return View(${activeTable.toLowerCase()});
                }
        
                // GET: ${activeTable}/Edit/5
                public async Task<IActionResult> Edit(${paramList})
                {
                    if (${primaryKeys.length === 0 ? 'true' : 'false'})
                    {
                        return NotFound();
                    }
        
                    var ${activeTable.toLowerCase()} = await _context.${activeTable}.FindAsync(${primaryKeys.map(pk => pk.toLowerCase()).join(', ')});
                    if (${activeTable.toLowerCase()} == null)
                    {
                        return NotFound();
                    }
                    return View(${activeTable.toLowerCase()});
                }
        
                // POST: ${activeTable}/Edit/5
                [HttpPost]
                [ValidateAntiForgeryToken]
                public async Task<IActionResult> Edit(${paramList}, [Bind("${metadata[activeTable].Columns.map(col => col.Name).join(',')}")] ${activeTable} ${activeTable.toLowerCase()})
                {
                    if (${primaryKeys.map(pk => `${pk.toLowerCase()} != ${activeTable.toLowerCase()}.${pk}`).join(' || ')})
                    {
                        return NotFound();
                    }
        
                    if (ModelState.IsValid)
                    {
                        try
                        {
                            _context.Update(${activeTable.toLowerCase()});
                            await _context.SaveChangesAsync();
                        }
                        catch (DbUpdateConcurrencyException)
                        {
                            if (!${activeTable}Exists(${primaryKeys.map(pk => `${activeTable.toLowerCase()}.${pk}`).join(', ')}))
                            {
                                return NotFound();
                            }
                            else
                            {
                                throw;
                            }
                        }
                        return RedirectToAction(nameof(Index));
                    }
                    return View(${activeTable.toLowerCase()});
                }
        
                // GET: ${activeTable}/Delete/5
                public async Task<IActionResult> Delete(${paramList})
                {
                    if (${primaryKeys.length === 0 ? 'true' : 'false'})
                    {
                        return NotFound();
                    }
        
                    var ${activeTable.toLowerCase()} = await _context.${activeTable}
                        .FirstOrDefaultAsync(m => ${primaryKeyFinder || 'true'});
                    if (${activeTable.toLowerCase()} == null)
                    {
                        return NotFound();
                    }
        
                    return View(${activeTable.toLowerCase()});
                }
        
                // POST: ${activeTable}/Delete/5
                [HttpPost, ActionName("Delete")]
                [ValidateAntiForgeryToken]
                public async Task<IActionResult> DeleteConfirmed(${paramList})
                {
                    var ${activeTable.toLowerCase()} = await _context.${activeTable}.FindAsync(${primaryKeys.map(pk => pk.toLowerCase()).join(', ')});
                    _context.${activeTable}.Remove(${activeTable.toLowerCase()});
                    await _context.SaveChangesAsync();
                    return RedirectToAction(nameof(Index));
                }
        
                private bool ${activeTable}Exists(${paramList})
                {
                    return _context.${activeTable}.Any(e => ${primaryKeyFinder || 'true'});
                }
            }
        }`;
        } else {
            // Stored Procedure controller
            return `using System;
        using System.Collections.Generic;
        using System.Data;
        using System.Linq;
        using System.Threading.Tasks;
        using Microsoft.AspNetCore.Mvc;
        using Microsoft.Data.SqlClient;
        using Dapper;
        using YourNamespace.Models;
        
        namespace YourNamespace.Controllers
        {
            public class ${activeTable}Controller : Controller
            {
                private readonly string _connectionString;
        
                public ${activeTable}Controller(IConfiguration configuration)
                {
                    _connectionString = configuration.GetConnectionString("DefaultConnection");
                }
        
                // GET: ${activeTable}
                public async Task<IActionResult> Index()
                {
                    using (var connection = new SqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();
                        var result = await connection.QueryAsync${useStronglyTyped ? `<${activeTable}>` : ''}("SP_Select_${activeTable}", commandType: CommandType.StoredProcedure);
                        return View(result.ToList());
                    }
                }
        
                // GET: ${activeTable}/Details/5
                public async Task<IActionResult> Details(${paramList})
                {
                    using (var connection = new SqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();
                        var parameters = new DynamicParameters();
                        ${primaryKeys.map(pk => `parameters.Add("@${pk}", ${pk.toLowerCase()});`).join('\n                ')}
                        
                        var ${activeTable.toLowerCase()} = await connection.QueryFirstOrDefaultAsync${useStronglyTyped ? `<${activeTable}>` : ''}(
                            "SP_Select_${activeTable}", parameters, commandType: CommandType.StoredProcedure);
                        
                        if (${activeTable.toLowerCase()} == null)
                        {
                            return NotFound();
                        }
        
                        return View(${activeTable.toLowerCase()});
                    }
                }
        
                // GET: ${activeTable}/Create
                public IActionResult Create()
                {
                    return View();
                }
        
                // POST: ${activeTable}/Create
                [HttpPost]
                [ValidateAntiForgeryToken]
                public async Task<IActionResult> Create([Bind("${metadata[activeTable].Columns.map(col => col.Name).join(',')}")] ${activeTable} ${activeTable.toLowerCase()})
                {
                    if (ModelState.IsValid)
                    {
                        using (var connection = new SqlConnection(_connectionString))
                        {
                            await connection.OpenAsync();
                            var parameters = new DynamicParameters();
                            ${metadata[activeTable].Columns.filter(col => !primaryKeys.includes(col.Name) || primaryKeys.includes(col.Name) && col.Type.toLowerCase() !== 'int').map(col => `parameters.Add("@${col.Name}", ${activeTable.toLowerCase()}.${col.Name});`).join('\n                    ')}
                            
                            await connection.ExecuteAsync("SP_Insert_${activeTable}", parameters, commandType: CommandType.StoredProcedure);
                            return RedirectToAction(nameof(Index));
                        }
                    }
                    return View(${activeTable.toLowerCase()});
                }
        
                // GET: ${activeTable}/Edit/5
                public async Task<IActionResult> Edit(${paramList})
                {
                    using (var connection = new SqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();
                        var parameters = new DynamicParameters();
                        ${primaryKeys.map(pk => `parameters.Add("@${pk}", ${pk.toLowerCase()});`).join('\n                ')}
                        
                        var ${activeTable.toLowerCase()} = await connection.QueryFirstOrDefaultAsync${useStronglyTyped ? `<${activeTable}>` : ''}(
                            "SP_Select_${activeTable}", parameters, commandType: CommandType.StoredProcedure);
                        
                        if (${activeTable.toLowerCase()} == null)
                        {
                            return NotFound();
                        }
        
                        return View(${activeTable.toLowerCase()});
                    }
                }
        
                // POST: ${activeTable}/Edit/5
                [HttpPost]
                [ValidateAntiForgeryToken]
                public async Task<IActionResult> Edit(${paramList}, [Bind("${metadata[activeTable].Columns.map(col => col.Name).join(',')}")] ${activeTable} ${activeTable.toLowerCase()})
                {
                    if (${primaryKeys.map(pk => `${pk.toLowerCase()} != ${activeTable.toLowerCase()}.${pk}`).join(' || ')})
                    {
                        return NotFound();
                    }
        
                    if (ModelState.IsValid)
                    {
                        using (var connection = new SqlConnection(_connectionString))
                        {
                            await connection.OpenAsync();
                            var parameters = new DynamicParameters();
                            ${metadata[activeTable].Columns.map(col => `parameters.Add("@${col.Name}", ${activeTable.toLowerCase()}.${col.Name});`).join('\n                    ')}
                            
                            await connection.ExecuteAsync("SP_Update_${activeTable}", parameters, commandType: CommandType.StoredProcedure);
                            return RedirectToAction(nameof(Index));
                        }
                    }
                    return View(${activeTable.toLowerCase()});
                }
        
                // GET: ${activeTable}/Delete/5
                public async Task<IActionResult> Delete(${paramList})
                {
                    using (var connection = new SqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();
                        var parameters = new DynamicParameters();
                        ${primaryKeys.map(pk => `parameters.Add("@${pk}", ${pk.toLowerCase()});`).join('\n                ')}
                        
                        var ${activeTable.toLowerCase()} = await connection.QueryFirstOrDefaultAsync${useStronglyTyped ? `<${activeTable}>` : ''}(
                            "SP_Select_${activeTable}", parameters, commandType: CommandType.StoredProcedure);
                        
                        if (${activeTable.toLowerCase()} == null)
                        {
                            return NotFound();
                        }
        
                        return View(${activeTable.toLowerCase()});
                    }
                }
        
                // POST: ${activeTable}/Delete/5
                [HttpPost, ActionName("Delete")]
                [ValidateAntiForgeryToken]
                public async Task<IActionResult> DeleteConfirmed(${paramList})
                {
                    using (var connection = new SqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();
                        var parameters = new DynamicParameters();
                        ${primaryKeys.map(pk => `parameters.Add("@${pk}", ${pk.toLowerCase()});`).join('\n                ')}
                        
                        await connection.ExecuteAsync("SP_Delete_${activeTable}", parameters, commandType: CommandType.StoredProcedure);
                        return RedirectToAction(nameof(Index));
                    }
                }
            }
        }`;
        }
    }, [activeTable, metadata, useStronglyTyped, dataAccessType]);

    return {
        controllerCode: generateController,
    };
}

export default useControllerGenerator;