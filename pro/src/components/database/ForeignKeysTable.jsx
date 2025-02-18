import { FaLink } from "react-icons/fa";

const ForeignKeysTable = ({ activeTable, metadata }) => {
    if (!metadata[activeTable].ForeignKeys.length) return null;
    
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-teal-100">
        <div className="border-b border-teal-100 bg-teal-50 px-6 py-4">
          <h3 className="font-semibold text-teal-800 text-lg">Foreign Keys</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-teal-100">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">Column</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">References Table</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-teal-700 uppercase tracking-wider">References Column</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-teal-100">
              {metadata[activeTable].ForeignKeys.map((fk, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-teal-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-800">
                    <div className="flex items-center">
                      <FaLink className="text-orange-500 mr-2" />
                      {fk.Column}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600">{fk.ReferenceTable}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-600">{fk.ReferenceColumn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default ForeignKeysTable;  