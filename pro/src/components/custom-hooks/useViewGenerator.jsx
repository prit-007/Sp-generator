import { useMemo } from 'react';
const useViewGenerator  = (activeTable, metadata, useStronglyTyped, dataAccessType) => {
    const generateView = useMemo(() => {
            // Get primary keys for links
            const primaryKeys = metadata[activeTable].PrimaryKeys;
            // Parameter string for action links
            const routeParams = primaryKeys.map(pk => `item.${pk}`).join(', ');
            
            return `@model ${useStronglyTyped ? `IEnumerable<${activeTable}>` : 'IEnumerable<dynamic>'}
        
        @{
            ViewData["Title"] = "${activeTable} List";
            Layout = "_Layout";
        }
        
        <h1>${activeTable} List</h1>
        
        <p>
            <a asp-action="Create" class="btn btn-primary">Create New</a>
        </p>
        
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
        ${metadata[activeTable].Columns.map(column => `                <th>@Html.DisplayNameFor(model => model.${useStronglyTyped ? column.Name : `["${column.Name}"]`})</th>`).join('\n')}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach (var item in Model)
                    {
                        <tr>
        ${metadata[activeTable].Columns.map(column => {
          if (column.Type.toLowerCase() === 'bit') {
            return `                    <td>@(item.${useStronglyTyped ? column.Name : `["${column.Name}"]`} ? "Yes" : "No")</td>`;
          } else if (column.Type.toLowerCase().includes('date')) {
            return `                    <td>@(item.${useStronglyTyped ? column.Name : `["${column.Name}"]`}?.ToString("yyyy-MM-dd"))</td>`;
          } else {
            return `                    <td>@Html.DisplayFor(modelItem => item.${useStronglyTyped ? column.Name : `["${column.Name}"]`})</td>`;
          }
        }).join('\n')}
                            <td>
                                <div class="btn-group">
                                    <a asp-action="Edit" asp-route-id="@${routeParams}" class="btn btn-sm btn-outline-primary">Edit</a>
                                    <a asp-action="Details" asp-route-id="@${routeParams}" class="btn btn-sm btn-outline-info">Details</a>
                                    <a asp-action="Delete" asp-route-id="@${routeParams}" class="btn btn-sm btn-outline-danger">Delete</a>
                                </div>
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
        
        @section Scripts {
            <script>
                $(document).ready(function() {
                    // Any JavaScript for the view
                });
            </script>
        }`;
      }, [activeTable, metadata, useStronglyTyped]);
    return {
        viewCode: generateView,
      };
}

export default useViewGenerator;