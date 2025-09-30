import { useMemo } from 'react';

const useViewGenerator = (activeTable, metadata, useStronglyTyped, dataAccessType) => {
    const generateView = useMemo(() => {
        if (!activeTable || !metadata[activeTable]) {
            return '<!-- Please select a table to generate the view -->';
        }

        // Get primary keys for links
        const primaryKeys = metadata[activeTable].PrimaryKeys;
        // Parameter string for action links
        const routeParams = primaryKeys.map(pk => `item.${pk}`).join(', ');
        
        return `@model ${useStronglyTyped ? `IEnumerable<${activeTable}>` : 'IEnumerable<dynamic>'}

@{
    ViewData["Title"] = "${activeTable} Management";
    Layout = "_Layout";
}

<div class="container-fluid px-4">
    <div class="card shadow-sm border-0 mb-4">
        <div class="card-header bg-primary bg-gradient text-white">
            <div class="d-flex justify-content-between align-items-center">
                <h4 class="mb-0">
                    <i class="fas fa-table me-2"></i>${activeTable} List
                </h4>
                <a asp-action="Create" class="btn btn-light">
                    <i class="fas fa-plus me-1"></i>Create New
                </a>
            </div>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover" id="${activeTable.toLowerCase()}Table">
                    <thead>
                        <tr class="bg-light">
${metadata[activeTable].Columns.map(column => `                            <th>@Html.DisplayNameFor(model => model.${useStronglyTyped ? column.Name : `["${column.Name}"]`})</th>`).join('\n')}
                            <th style="width: 180px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach (var item in Model)
                        {
                            <tr>
${metadata[activeTable].Columns.map(column => {
    if (column.Type.toLowerCase() === 'bit') {
        return `                                <td>
                                    <span class="badge rounded-pill bg-@(item.${useStronglyTyped ? column.Name : `["${column.Name}"]`} ? "success" : "secondary")">
                                        @(item.${useStronglyTyped ? column.Name : `["${column.Name}"]`} ? "Yes" : "No")
                                    </span>
                                </td>`;
    } else if (column.Type.toLowerCase().includes('date')) {
        return `                                <td>@(item.${useStronglyTyped ? column.Name : `["${column.Name}"]`}?.ToString("yyyy-MM-dd"))</td>`;
    } else if (column.Name.toLowerCase().includes('email')) {
        return `                                <td><a href="mailto:@item.${useStronglyTyped ? column.Name : `["${column.Name}"]`}">@item.${useStronglyTyped ? column.Name : `["${column.Name}"]`}</a></td>`;
    } else if (column.Name.toLowerCase().includes('url') || column.Name.toLowerCase().includes('website')) {
        return `                                <td><a href="@item.${useStronglyTyped ? column.Name : `["${column.Name}"]`}" target="_blank">@item.${useStronglyTyped ? column.Name : `["${column.Name}"]`}</a></td>`;
    } else if (column.Name.toLowerCase().includes('status')) {
        return `                                <td>
                                    @{
                                        var statusClass = item.${useStronglyTyped ? column.Name : `["${column.Name}"]`}?.ToString().ToLower() switch {
                                            "active" => "success",
                                            "pending" => "warning",
                                            "inactive" => "secondary",
                                            "error" => "danger",
                                            _ => "info"
                                        };
                                    }
                                    <span class="badge bg-@statusClass">@item.${useStronglyTyped ? column.Name : `["${column.Name}"]`}</span>
                                </td>`;
    } else {
        return `                                <td>@Html.DisplayFor(modelItem => item.${useStronglyTyped ? column.Name : `["${column.Name}"]`})</td>`;
    }
}).join('\n')}
                                <td>
                                    <div class="btn-group">
                                        <a asp-action="Edit" asp-route-id="@${routeParams}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-edit me-1"></i>Edit
                                        </a>
                                        <a asp-action="Details" asp-route-id="@${routeParams}" class="btn btn-sm btn-outline-info">
                                            <i class="fas fa-info-circle me-1"></i>Details
                                        </a>
                                        <a asp-action="Delete" asp-route-id="@${routeParams}" class="btn btn-sm btn-outline-danger">
                                            <i class="fas fa-trash me-1"></i>Delete
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer">
            <span class="text-muted">Total Records: @Model.Count()</span>
        </div>
    </div>
</div>

@section Scripts {
    <script>
        $(document).ready(function() {
            $('#${activeTable.toLowerCase()}Table').DataTable({
                responsive: true,
                lengthMenu: [10, 25, 50, 100],
                dom: 'Bfrtip',
                buttons: [
                    'copy', 'csv', 'excel', 'pdf', 'print'
                ]
            });
            
            // Enable tooltips
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
        });
    </script>
}`;
    }, [activeTable, metadata, useStronglyTyped]);

    return {
        viewCode: generateView,
    };
}

export default useViewGenerator;