import { google } from "googleapis";
import path from "path";
export async function POST(req: Request) {
   console.log("GOOGLE DOCS API HIT");
try {
const { docId } = await req.json();


const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), "google-service-account.json"),
  scopes: [
    "https://www.googleapis.com/auth/documents.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
  ],
});

const docs = google.docs({
  version: "v1",
  auth,
});

const response = await docs.documents.get({
  documentId: docId,
});

const doc = response.data;
console.log("DOCUMENT LOADED");

function rgbToHex(color: any) {
  if (!color?.rgbColor) return null;

  const r = Math.round((color.rgbColor.red || 0) * 255);
  const g = Math.round((color.rgbColor.green || 0) * 255);
  const b = Math.round((color.rgbColor.blue || 0) * 255);

  return `#${[r, g, b]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")}`;
}

function parseTextRun(el: any) {
  const text = (el.textRun?.content || "")
  .replace(/\u000b/g, "")
  .replace(/\r/g, "")
  .replace(/\f/g, "")
  if (!text.trim() && text !== "\n") return "";

  const style = el.textRun?.textStyle || {};

  let content = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

 content = content.replace(
  /(https?:\/\/[^\s<]+)/g,
  '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline;">$1</a>'
);

  if (style.link?.url) {
    content = `<a href="${style.link.url}" target="_blank">${content}</a>`;
  }

  if (style.bold) {
    content = `<strong>${content}</strong>`;
  }

  if (style.italic) {
    content = `<em>${content}</em>`;
  }

  if (style.underline) {
    content = `<u>${content}</u>`;
  }

  let css = "";

  const textColor = rgbToHex(
    style.foregroundColor?.color
  );

  if (textColor) {
    css += `color:${textColor};`;
  }

  const bgColor = rgbToHex(
    style.backgroundColor?.color
  );

  if (bgColor) {
    css += `background-color:${bgColor};`;
  }

  if (css) {
    content = `<span style="${css}">${content}</span>`;
  }

  return content;
}

function getAlignment(paragraph: any) {
  const align =
    paragraph.paragraphStyle?.alignment ||
    "START";

  switch (align) {
    case "CENTER":
      return "center";

    case "END":
      return "right";

    case "JUSTIFIED":
      return "justify";

    default:
      return "left";
  }
}

function parseParagraph(paragraph: any) {
  const style =
    paragraph.paragraphStyle?.namedStyleType || "";

  const alignment = getAlignment(paragraph);

  const content = (paragraph.elements || [])
    .map(parseTextRun)
    .join("");

    console.log("STYLE:", style);
    console.log("FULL CONTENT:", content);
    console.log("--------------------------------");

    console.log(
    "STYLE:",
    style,
    "CONTENT:",
    content.substring(0, 80)
  );


  if (!content.trim()) {
    return "";
  }

  if (paragraph.bullet) {
  console.log("BULLET FOUND:", content);

  return `<li>${content}</li>`;
}
   if (
  content.includes(
    "Hostel Management Software Systems For All Types Of Schools and Colleges"
  ) &&
  content.includes("SHORT SUMMARY:")
) {
  const parts = content.split(
    "Hostel Management Software Systems For All Types Of Schools and Colleges"
  );

  return `
    <p style="text-align:${alignment}">
      ${parts[0]}
    </p>

    <h1 style="text-align:${alignment}">
      Hostel Management Software Systems For All Types Of Schools and Colleges
    </h1>
  `;
}


  switch (style) {
    case "TITLE":
  return `<h1 style="text-align:${alignment}">${content}</h1>`;

   case "SUBTITLE":
  return `<h2 style="text-align:${alignment}">${content}</h2>`;
   case "HEADING_1":
  if (
    content.includes("SHORT SUMMARY:") ||
    content.includes("META DESCRIPTION:")
  ) {
    return `<p style="text-align:${alignment}">${content}</p>`;
  }

  return `<h1 style="text-align:${alignment}">${content}</h1>`;

    case "HEADING_2":
      return `<h2 style="text-align:${alignment}">${content}</h2>`;

    case "HEADING_3":
      return `<h3 style="text-align:${alignment}">${content}</h3>`;

    case "HEADING_4":
      return `<h4 style="text-align:${alignment}">${content}</h4>`;

    case "HEADING_5":
      return `<h5 style="text-align:${alignment}">${content}</h5>`;

    case "HEADING_6":
      return `<h6 style="text-align:${alignment}">${content}</h6>`;

    default:
      return `<p style="text-align:${alignment}">${content}</p>`;
  }
}

function parseTable(table: any) {
  let html = `
    <table style="
      border-collapse:collapse;
      width:100%;
      margin:20px 0;
    ">
  `;

  table.tableRows?.forEach((row: any) => {
    html += "<tr>";

    row.tableCells?.forEach((cell: any) => {
      html += `
        <td style="
          border:1px solid #d1d5db;
          padding:12px;
          vertical-align:top;
        ">
      `;

      cell.content?.forEach((block: any) => {
        if (block.paragraph) {
          html += parseParagraph(block.paragraph);
        }
      });

      html += "</td>";
    });

    html += "</tr>";
  });

  html += "</table>";

  return html;
}

let html = "";
let insideList = false;

for (const block of doc.body?.content || []) {
  if (block.table) {
    if (insideList) {
      html += "</ul>";
      insideList = false;
    }

    html += parseTable(block.table);
    continue;
  }

  if (!block.paragraph) continue;

  if (block.paragraph.bullet) {
    if (!insideList) {
      html += "<ul>";
      insideList = true;
    }

    html += parseParagraph(block.paragraph);
  } else {
    if (insideList) {
      html += "</ul>";
      insideList = false;
    }

    html += parseParagraph(block.paragraph);
  }
}

if (insideList) {
  html += "</ul>";
}

return Response.json({
  html,
});


} catch (error: any) {
console.error(error);


return Response.json(
  {
    error: error.message,
  },
  {
    status: 500,
  }
);


}
}
