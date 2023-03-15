export const suicTemplate = {

Rolodex: `
  <div style="overflow:auto;height:12rem;border:1px solid black;margin:1rem;padding:1rem;">
    [~LOOP~]
      <div style="display:table-row;">
        <div style="display:table-cell;text-align:right;"><b>[~key~]</b></div>
        <div style="display:table-cell;padding-left:1rem;">[~val~]</div>
      </div>
    [~LOOP~]
  </div>
`,

RecordsList: `
  <div style="border:1px solid black;margin:1rem;padding:1rem;">
    [~LOOP~]
      <div style="display:table-row;">
        <div style="display:table-cell;text-align:right;"><b>[~key~]</b></div>
        <div style="display:table-cell;padding-left:1rem;">[~val~]</div>
      </div>
    [~LOOP~]
  </div>
`,

};


