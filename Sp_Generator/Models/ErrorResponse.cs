namespace Sp_Generator.Models
{
    public class ErrorResponse
    {
        public ErrorResponse()
        {
            Error = string.Empty;
            Message = string.Empty;
            Details = string.Empty;
        }

        public int StatusCode { get; set; }
        public string Error { get; set; }
        public string Message { get; set; }
        public string Details { get; set; }
    }
}