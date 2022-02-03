export class Table {
  render(json) {
    const results = json.parts;
    if(!results || !results.length) {
      console.log("No results!");
      return document.createElement('SPAN');
    }
    let table = document.createElement('TABLE');
    let columnHeaders = Object.keys(results[0]);
    let headerRow = document.createElement('TR');
    for(let c of columnHeaders){
      let cell = document.createElement('TH');
      cell.innerHTML = c;
      cell.style.border="1px solid black";
      cell.style.padding="0.5em";
      cell.style.background=json.unselBackground;
      cell.style.color=json.unselColor;
      headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);
    for(let row of results){
      let rowElement = document.createElement('TR');
      for(let col of columnHeaders){
        let cell = document.createElement('TD');
        cell.innerHTML = row[col];
        cell.style.border="1px solid black";
        cell.style.padding="0.5em";
        cell.style.backgroundColor=json.background;
        cell.style.color=json.color;
        rowElement.appendChild(cell);
      }
      table.appendChild(rowElement);
    }
    table.style.borderCollapse="collapse";
    return table;
  }
}
// ENDS
