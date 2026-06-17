import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";

function parseInline(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const pattern =
  /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|~~(.+?)~~)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      runs.push(new TextRun({ text: text.slice(last, match.index) }));
    }
    if (match[0].startsWith("**")) {
  runs.push(
    new TextRun({
      text: match[2],
      bold: true,
    })
  );
} else if (match[0].startsWith("*")) {
  runs.push(
    new TextRun({
      text: match[3],
      italics: true,
    })
  );
} else if (match[0].startsWith("`")) {
  runs.push(
    new TextRun({
      text: match[4],
      font: "Courier New",
      size: 18,
    })
  );
} else if (match[0].startsWith("~~")) {
  runs.push(
    new TextRun({
      text: match[5],
      strike: true,
    })
  );
}
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last) }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
}

function buildTable(tableLines: string[]): Table {
  const border = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
  };

  const rows: TableRow[] = [];

  tableLines.forEach((line, rowIndex) => {
    if (/^\|[\s\-:|]+\|$/.test(line.trim())) return;

    const cells = line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

    const tableCells = cells.map(
      (cellText) =>
        new TableCell({
          borders: border,
          children: [
            new Paragraph({
              children: parseInline(cellText),
              ...(rowIndex === 0 && { alignment: AlignmentType.LEFT }),
            }),
          ],
          shading: rowIndex === 0 ? { fill: "f9fafb" } : undefined,
        })
    );

    rows.push(new TableRow({ children: tableCells }));
  });

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

export async function generateDocx(markdown: string) {
  const lines = markdown.split("\n");
  const docChildren: (Paragraph | Table)[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trimStart().startsWith("```")) {
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      codeLines.forEach((codeLine) => {
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: codeLine, font: "Courier New", size: 18 })],
            indent: { left: 720 },
          })
        );
      });
      continue;
    }

    if (line.trimStart().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      docChildren.push(buildTable(tableLines));
      docChildren.push(new Paragraph({ text: "" }));
      continue;
    }

    if (line.startsWith("# ")) {
      docChildren.push(new Paragraph({ children: parseInline(line.replace(/^# /, "")), heading: HeadingLevel.HEADING_1 }));
      i++; continue;
    }
    if (line.startsWith("## ")) {
      docChildren.push(new Paragraph({ children: parseInline(line.replace(/^## /, "")), heading: HeadingLevel.HEADING_2 }));
      i++; continue;
    }
    if (line.startsWith("### ")) {
      docChildren.push(new Paragraph({ children: parseInline(line.replace(/^### /, "")), heading: HeadingLevel.HEADING_3 }));
      i++; continue;
    }
    if (line.startsWith("#### ")) {
  docChildren.push(
    new Paragraph({
      children: parseInline(line.replace(/^#### /, "")),
      heading: HeadingLevel.HEADING_4,
    })
  );
  i++;
  continue;
}

                    if (line.startsWith("##### ")) {
                         docChildren.push(
                             new Paragraph({
                           children: parseInline(line.replace(/^##### /, "")),
                                heading: HeadingLevel.HEADING_5,
                                              })
                                            );
                                      i++;
                               continue;
                             }

           if (line.startsWith("###### ")) {
               docChildren.push(
               new Paragraph({
            children: parseInline(line.replace(/^###### /, "")),
               heading: HeadingLevel.HEADING_6,
              })
             );
             i++;
       continue;
        }

    if (line.startsWith("> ")) {
      docChildren.push(
        new Paragraph({
          children: parseInline(line.replace(/^> /, "")),
          indent: { left: 720 },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: "5E6BFF" } },
        })
      );
      i++; continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      docChildren.push(new Paragraph({ children: parseInline(line.replace(/^[-*] /, "")), bullet: { level: 0 } }));
      i++; continue;
    }

    if (/^\d+\. /.test(line)) {
      docChildren.push(new Paragraph({ children: parseInline(line.replace(/^\d+\. /, "")), numbering: { reference: "default-numbering", level: 0 } }));
      i++; continue;
    }

    if (/^---+$/.test(line.trim())) {
      docChildren.push(new Paragraph({ text: "", border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "e5e7eb" } } }));
      i++; continue;
    }

    if (line.trim() === "") {
      docChildren.push(new Paragraph({ text: "" }));
      i++; continue;
    }

    docChildren.push(new Paragraph({ children: parseInline(line) }));
    i++;
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START }],
        },
      ],
    },
    sections: [{ properties: {}, children: docChildren }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "markdown2.docx");
}