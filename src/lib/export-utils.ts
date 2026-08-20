import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { LeadRecord } from "./schemas";

export const exportToCSV = (leads: LeadRecord[], filename: string) => {
  const headers = ["Nome", "Telefone", "Bairro", "Cidade", "UF", "Website", "E-mail", "E-mail2"];
  const rows = leads.map((l) => [
    l.nome || "",
    l.telefone || "",
    l.bairro || "",
    l.cidade || "",
    l.uf || "",
    l.website || "",
    l.email || "",
    l.email2 || "",
  ]);

  const csvContent = [headers, ...rows]
    .map((e) => e.map(String).join(","))
    .join("\n");

  // Add BOM for UTF-8 correctly in Excel
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
};

export const exportToExcel = (leads: LeadRecord[], filename: string) => {
  const data = leads.map((l) => ({
    Nome: l.nome || "",
    Telefone: l.telefone || "",
    Bairro: l.bairro || "",
    Cidade: l.cidade || "",
    UF: l.uf || "",
    Website: l.website || "",
    "E-mail": l.email || "",
    "E-mail2": l.email2 || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
  
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `${filename}.xlsx`);
};
