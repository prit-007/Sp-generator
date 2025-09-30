import { useMemo } from 'react';

const useAddEditFormGenerator = (activeTable, metadata, useStronglyTyped, dataAccessType) => {
    const generateAddEditForm = useMemo(() => {
        if (!activeTable || !metadata[activeTable]) {
            return '<!-- Please select a table to generate the form -->';
        }

        // Get primary keys for hidden inputs
        const primaryKeys = metadata[activeTable].PrimaryKeys;
        
        return `@model ${useStronglyTyped ? activeTable : 'dynamic'}

@{
    var isNew = Model == null;
    ViewData["Title"] = isNew ? "Create New ${activeTable}" : "Edit ${activeTable}";
    Layout = "_Layout";
}

<div class="container-fluid px-4">
    <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-header bg-primary bg-gradient text-white">
                    <h4 class="mb-0">
                        <i class="fas fa-@(isNew ? "plus-circle" : "edit") me-2"></i>@ViewData["Title"]
                    </h4>
                </div>
                <div class="card-body">
                    <form asp-action="@(isNew ? "Create" : "Edit")" method="post" class="needs-validation" novalidate>
                        <div asp-validation-summary="ModelOnly" class="alert alert-danger" role="alert"></div>
                        
                        @* Hidden fields for primary keys in Edit mode *@
                        @if (!isNew)
                        {
${primaryKeys.map(pk => `                            <input type="hidden" asp-for="${pk}" />`).join('\n')}
                        }
                        
                        <div class="row g-4">
${metadata[activeTable].Columns
    // Filter out primary keys that are auto-generated (typically int identity columns)
    .filter(column => !(primaryKeys.includes(column.Name) && column.Type.toLowerCase() === 'int'))
    .map(column => {
        // Don't create form fields for computed columns or timestamp columns
        if (column.IsComputed || column.Type.toLowerCase() === 'timestamp') {
            return '';
        }
        
        let fieldHtml = '';
        const isRequired = !column.IsNullable;
        
        // Create different input types based on data type
        if (column.Type.toLowerCase() === 'bit') {
            fieldHtml = `
                            <div class="col-md-6 mb-3">
                                <div class="form-check form-switch">
                                    <input asp-for="${column.Name}" class="form-check-input" type="checkbox" role="switch" id="${column.Name}" />
                                    <label asp-for="${column.Name}" class="form-check-label"></label>
                                </div>
                                <span asp-validation-for="${column.Name}" class="text-danger"></span>
                            </div>`;
        } else if (column.Type.toLowerCase().includes('date')) {
            fieldHtml = `
                            <div class="col-md-6 mb-3">
                                <div class="form-floating">
                                    <input asp-for="${column.Name}" class="form-control datepicker" id="${column.Name}" ${isRequired ? 'required' : ''} />
                                    <label asp-for="${column.Name}" class="form-label"></label>
                                    <div class="invalid-feedback">Please provide a valid ${column.Name}.</div>
                                </div>
                                <span asp-validation-for="${column.Name}" class="text-danger"></span>
                            </div>`;
        } else if (column.Type.toLowerCase() === 'nvarchar' && column.MaxLength && column.MaxLength > 100) {
            fieldHtml = `
                            <div class="col-md-12 mb-3">
                                <div class="form-floating">
                                    <textarea asp-for="${column.Name}" class="form-control" style="height: 100px" id="${column.Name}" ${isRequired ? 'required' : ''}></textarea>
                                    <label asp-for="${column.Name}" class="form-label"></label>
                                    <div class="invalid-feedback">Please provide a valid ${column.Name}.</div>
                                </div>
                                <span asp-validation-for="${column.Name}" class="text-danger"></span>
                                @if(Model?.${column.Name} != null) {
                                    <div class="form-text text-end">
                                        <span class="char-count">@Model.${column.Name}.Length</span>/${column.MaxLength}
                                    </div>
                                }
                            </div>`;
        } else if (metadata[activeTable].ForeignKeys.some(fk => fk.Column === column.Name)) {
            // Add a dropdown for foreign keys
            const fk = metadata[activeTable].ForeignKeys.find(fk => fk.Column === column.Name);
            fieldHtml = `
                            <div class="col-md-6 mb-3">
                                <div class="form-floating">
                                    <select asp-for="${column.Name}" class="form-select" asp-items="ViewBag.${fk.ReferenceTable}List" id="${column.Name}" ${isRequired ? 'required' : ''}>
                                        <option value="">-- Select ${fk.ReferenceTable} --</option>
                                    </select>
                                    <label asp-for="${column.Name}" class="form-label"></label>
                                    <div class="invalid-feedback">Please select a ${fk.ReferenceTable}.</div>
                                </div>
                                <span asp-validation-for="${column.Name}" class="text-danger"></span>
                            </div>`;
        } else if (column.Name.toLowerCase().includes('email')) {
            fieldHtml = `
                            <div class="col-md-6 mb-3">
                                <div class="form-floating">
                                    <input asp-for="${column.Name}" class="form-control" type="email" id="${column.Name}" ${isRequired ? 'required' : ''} />
                                    <label asp-for="${column.Name}" class="form-label"></label>
                                    <div class="invalid-feedback">Please provide a valid email address.</div>
                                </div>
                                <span asp-validation-for="${column.Name}" class="text-danger"></span>
                            </div>`;
        } else if (column.Name.toLowerCase().includes('phone')) {
            fieldHtml = `
                            <div class="col-md-6 mb-3">
                                <div class="form-floating">
                                    <input asp-for="${column.Name}" class="form-control phone-mask" id="${column.Name}" ${isRequired ? 'required' : ''} />
                                    <label asp-for="${column.Name}" class="form-label"></label>
                                    <div class="invalid-feedback">Please provide a valid phone number.</div>
                                </div>
                                <span asp-validation-for="${column.Name}" class="text-danger"></span>
                            </div>`;
        } else if (column.Name.toLowerCase().includes('password')) {
            fieldHtml = `
                            <div class="col-md-6 mb-3">
                                <div class="form-floating">
                                    <input asp-for="${column.Name}" class="form-control" type="password" id="${column.Name}" ${isRequired ? 'required' : ''} />
                                    <label asp-for="${column.Name}" class="form-label"></label>
                                    <div class="invalid-feedback">Please provide a valid password.</div>
                                </div>
                                <span asp-validation-for="${column.Name}" class="text-danger"></span>
                            </div>`;
        } else if (column.Type.toLowerCase() === 'int' || column.Type.toLowerCase() === 'decimal' || column.Type.toLowerCase() === 'money') {
            fieldHtml = `
                            <div class="col-md-6 mb-3">
                                <div class="form-floating">
                                    <input asp-for="${column.Name}" class="form-control" type="number" step="${column.Type.toLowerCase() === 'int' ? '1' : '0.01'}" id="${column.Name}" ${isRequired ? 'required' : ''} />
                                    <label asp-for="${column.Name}" class="form-label"></label>
                                    <div class="invalid-feedback">Please provide a valid number.</div>
                                </div>
                                <span asp-validation-for="${column.Name}" class="text-danger"></span>
                            </div>`;
        } else {
            fieldHtml = `
                            <div class="col-md-6 mb-3">
                                <div class="form-floating">
                                    <input asp-for="${column.Name}" class="form-control" id="${column.Name}" ${isRequired ? 'required' : ''} />
                                    <label asp-for="${column.Name}" class="form-label"></label>
                                    <div class="invalid-feedback">Please provide a valid ${column.Name}.</div>
                                </div>
                                <span asp-validation-for="${column.Name}" class="text-danger"></span>
                            </div>`;
        }
        
        return fieldHtml;
    }).join('\n')}
                        </div>

                        <div class="form-group d-flex justify-content-between mt-4">
                            <a asp-action="Index" class="btn btn-outline-secondary">
                                <i class="fas fa-arrow-left me-1"></i>Back to List
                            </a>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

@section Scripts {
    @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
    <script>
        $(document).ready(function() {
            // Date picker initialization
            $('.datepicker').datepicker({
                format: 'yyyy-mm-dd',
                autoclose: true,
                todayHighlight: true,
                todayBtn: "linked"
            });

            // Phone mask initialization
            $('.phone-mask').inputmask('(999) 999-9999');

            // Character counter for textareas
            $('textarea').on('input', function() {
                const maxLength = $(this).attr('maxlength');
                const currentLength = $(this).val().length;
                $(this).closest('.mb-3').find('.char-count').text(currentLength);
                
                // Add visual feedback
                if (currentLength > maxLength * 0.9) {
                    $(this).closest('.mb-3').find('.form-text').addClass('text-danger');
                } else {
                    $(this).closest('.mb-3').find('.form-text').removeClass('text-danger');
                }
            });

            // Bootstrap 5 form validation
            (function () {
                'use strict'

                // Fetch all the forms we want to apply custom Bootstrap validation styles to
                var forms = document.querySelectorAll('.needs-validation')

                // Loop over them and prevent submission
                Array.prototype.slice.call(forms)
                    .forEach(function (form) {
                        form.addEventListener('submit', function (event) {
                            if (!form.checkValidity()) {
                                event.preventDefault()
                                event.stopPropagation()
                            }

                            form.classList.add('was-validated')
                        }, false)
                    })
            })()
        });
    </script>
}`;
    }, [activeTable, metadata, useStronglyTyped, dataAccessType]);

    return {
        formCode: generateAddEditForm,
    };
}

export default useAddEditFormGenerator;
