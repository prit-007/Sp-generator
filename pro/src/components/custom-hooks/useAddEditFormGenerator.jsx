import { useMemo } from 'react';
const useAddEditFormGenerator  = (activeTable, metadata, useStronglyTyped, dataAccessType) => {
    const generateAddEditForm = useMemo(() => {
            // Get primary keys for hidden inputs
            const primaryKeys = metadata[activeTable].PrimaryKeys;
            
            return `@model ${useStronglyTyped ? activeTable : 'dynamic'}
        
        @{
            ViewData["Title"] = Model == null ? "Create ${activeTable}" : "Edit ${activeTable}";
            Layout = "_Layout";
        }
        
        <h1>@ViewData["Title"]</h1>
        
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">@(Model == null ? "Add new" : "Edit") ${activeTable}</h5>
                    </div>
                    <div class="card-body">
                        <form asp-action="@(Model == null ? "Create" : "Edit")">
                            <div asp-validation-summary="ModelOnly" class="text-danger"></div>
                            
                            @* Hidden fields for primary keys in Edit mode *@
                            @if (Model != null)
                            {
        ${primaryKeys.map(pk => `                        <input type="hidden" asp-for="${pk}" />`).join('\n')}
                            }
                            
                            <div class="row">
        ${metadata[activeTable].Columns
          // Filter out primary keys that are auto-generated (typically int identity columns)
          .filter(column => !(primaryKeys.includes(column.Name) && column.Type.toLowerCase() === 'int'))
          .map(column => {
            // Don't create form fields for computed columns or timestamp columns
            if (column.IsComputed || column.Type.toLowerCase() === 'timestamp') {
              return '';
            }
            
            let fieldHtml = '';
            
            // Create different input types based on data type
            if (column.Type.toLowerCase() === 'bit') {
              fieldHtml = `
                                <div class="form-group col-md-6 mb-3">
                                    <div class="form-check">
                                        <input asp-for="${column.Name}" class="form-check-input" />
                                        <label asp-for="${column.Name}" class="form-check-label"></label>
                                    </div>
                                    <span asp-validation-for="${column.Name}" class="text-danger"></span>
                                </div>`;
            } else if (column.Type.toLowerCase().includes('date')) {
              fieldHtml = `
                                <div class="form-group col-md-6 mb-3">
                                    <label asp-for="${column.Name}" class="control-label"></label>
                                    <input asp-for="${column.Name}" class="form-control datepicker" />
                                    <span asp-validation-for="${column.Name}" class="text-danger"></span>
                                </div>`;
            } else if (column.Type.toLowerCase() === 'nvarchar' && column.MaxLength && column.MaxLength > 100) {
              fieldHtml = `
                                <div class="form-group col-md-12 mb-3">
                                    <label asp-for="${column.Name}" class="control-label"></label>
                                    <textarea asp-for="${column.Name}" class="form-control" rows="3"></textarea>
                                    <span asp-validation-for="${column.Name}" class="text-danger"></span>
                                </div>`;
            } else if (metadata[activeTable].ForeignKeys.some(fk => fk.Column === column.Name)) {
              // Add a dropdown for foreign keys
              const fk = metadata[activeTable].ForeignKeys.find(fk => fk.Column === column.Name);
              fieldHtml = `
                                <div class="form-group col-md-6 mb-3">
                                    <label asp-for="${column.Name}" class="control-label"></label>
                                    <select asp-for="${column.Name}" class="form-control" asp-items="ViewBag.${fk.ReferenceTable}List"></select>
                                    <span asp-validation-for="${column.Name}" class="text-danger"></span>
                                </div>`;
            } else {
              fieldHtml = `
                                <div class="form-group col-md-6 mb-3">
                                    <label asp-for="${column.Name}" class="control-label"></label>
                                    <input asp-for="${column.Name}" class="form-control" />
                                    <span asp-validation-for="${column.Name}" class="text-danger"></span>
                                </div>`;
            }
            
            return fieldHtml;
          }).join('\n')}
                            </div>
        
                            <div class="form-group mt-4">
                                <button type="submit" class="btn btn-primary">Save</button>
                                <a asp-action="Index" class="btn btn-secondary">Back to List</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        @section Scripts {
            @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
            <script>
                $(document).ready(function() {
                    $('.datepicker').datepicker({
                        format: 'yyyy-mm-dd',
                        autoclose: true
                    });
                });
            </script>
        }`;

      }, [activeTable, metadata]);
    return {
        formCode: generateAddEditForm,
 };
}
export default useAddEditFormGenerator;
