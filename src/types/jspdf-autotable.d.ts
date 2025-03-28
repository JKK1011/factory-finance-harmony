
declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface jsPDFAPI extends jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: any;
  }

  function autoTable(doc: jsPDF, options: any): void;
  export default autoTable;
}
