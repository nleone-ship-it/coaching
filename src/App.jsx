import { useState, useRef } from "react";

const PRESET_COLORS = [
  "#FFFF00","#28a745","#4472C4","#CC0000","#E26B0A","#A6A6A6","#9B59B6","#1ABC9C","#2C3E50","#F39C12"
];

function contrastColor(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r*299+g*587+b*114)/1000 > 128 ? "#000" : "#fff";
}

const defaultCategories = [
  { id:1, name:"AGILITY DRILLS\n(EVERY DAY DRILL) – EDD", color:"#FFFF00", drills:["DL Stance","DL Three Point Stance & Get Off","Weave Thru Bags Drill","Ladder Agility","Weave Cone Drill (L Drill aka Figure 8)"] },
  { id:2, name:"RUN TECHNIQUES & RUN READS\n(EVERY DAY DRILL) – EDD", color:"#28a745", drills:["Hand Combat or Punch Progression vs 5-man sled","Plug Gap Sled Work","DL \"Get Skinny & Wedge Yourself\" Drill","Five Man Sled Shoot Hands & Roll Drill","Take on the Proper Blocks & Contain Drill","Option Read Contain Drill"] },
  { id:3, name:"TACKLING DRILLS\n(EVERY DAY DRILL) – EDD", color:"#4472C4", drills:["Form Tackling","1-Man Sled Tackling Drill","Angle Tackling","DL Lateral Step Over and Tackle Drill"] },
  { id:4, name:"SPECIALITIES", color:"#CC0000", drills:["Strip Drill","Rabbit & Hound Drill","Drop Back Contain, Alley, & Pursuit Drill","NFL Combine 3-Bag Pass Rush Drill","NFL Combine Run & Club Drill","NFL Combine 4-Bag Agility Drill","NFL Combine Run The Hula Hoop Drill"] },
  { id:5, name:"PASS RUSH\n(EVERY DAY DRILL) – EDD", color:"#E26B0A", drills:["Jam Drill – Quick Hands","Rip Escape Drill","Swim Escape Drill","Pass Rush Drill w/ 2 Counter Moves","Blitz Influence","Cut Protection Drill","Roll Sprint Out, Contain Drill"] },
];

let nextId = 6;

export default function App() {
  const [view, setView] = useState("edit");
  const [coachName, setCoachName] = useState("COACH THOMPSON");
  const [positionGroup, setPositionGroup] = useState("DEFENSIVE LINE");
  const [categories, setCategories] = useState(defaultCategories);
  const [editingCat, setEditingCat] = useState(null);
  const [saveModal, setSaveModal] = useState(false);
  const [loadModal, setLoadModal] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [loadText, setLoadText] = useState("");
  const [copyMsg, setCopyMsg] = useState("");
  const printIframeRef = useRef(null);

  const addCategory = () => {
    const c = { id: nextId++, name: "NEW CATEGORY", color: "#A6A6A6", drills: [] };
    setCategories(p => [...p, c]);
    setEditingCat(c.id);
  };
  const updateCat = (id, field, val) => setCategories(p => p.map(c => c.id===id ? {...c,[field]:val} : c));
  const deleteCat = id => { setCategories(p => p.filter(c=>c.id!==id)); if(editingCat===id) setEditingCat(null); };
  const addDrill = id => setCategories(p => p.map(c => c.id===id ? {...c, drills:[...c.drills,""]} : c));
  const updateDrill = (id,i,val) => setCategories(p => p.map(c => c.id===id ? {...c, drills:c.drills.map((d,j)=>j===i?val:d)} : c));
  const removeDrill = (id,i) => setCategories(p => p.map(c => c.id===id ? {...c, drills:c.drills.filter((_,j)=>j!==i)} : c));
  const moveCat = (id, dir) => {
    setCategories(p => {
      const idx = p.findIndex(c=>c.id===id), next = idx+dir;
      if(next<0||next>=p.length) return p;
      const arr=[...p]; [arr[idx],arr[next]]=[arr[next],arr[idx]]; return arr;
    });
  };

  const openSave = () => {
    setJsonText(JSON.stringify({coachName,positionGroup,categories}, null, 2));
    setSaveModal(true);
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText).then(()=>{ setCopyMsg("Copied!"); setTimeout(()=>setCopyMsg(""),2000); });
  };
  const handleLoad = () => {
    try {
      const d = JSON.parse(loadText);
      if(d.coachName) setCoachName(d.coachName);
      if(d.positionGroup) setPositionGroup(d.positionGroup);
      if(d.categories) { setCategories(d.categories); nextId = Math.max(...d.categories.map(c=>c.id))+1; }
      setLoadModal(false); setLoadText("");
    } catch { alert("Invalid data. Make sure you pasted the full saved text."); }
  };

  const handlePrint = () => {
    const days = ["MON","TUE","WED","THUR","FRI"];
    const EXTRA = 3;
    const catRows = categories.map(c => `
      <div class="section">
        <table>
          <thead><tr>
            <th class="cat-header" style="background:${c.color};color:${contrastColor(c.color)}">${c.name.replace(/\n/g,"<br/>")}</th>
            ${days.map(d=>`<th class="day-header">${d}</th>`).join("")}
          </tr></thead>
          <tbody>
            ${[...c.drills.filter(Boolean),...Array(EXTRA).fill("")].map((d,i)=>`
              <tr><td class="drill-cell">${d}</td>${days.map(()=>`<td class="day-cell"></td>`).join("")}</tr>
            `).join("")}
          </tbody>
        </table>
      </div>`).join("");

    const summaryHeaders = categories.map(c=>`<th style="background:${c.color};color:${contrastColor(c.color)};text-align:center;font-weight:bold;padding:8px 6px;border:2px solid #333;font-size:12px;white-space:pre-line;text-transform:uppercase">${c.name.replace(/\n/g,"<br/>")}</th>`).join("");
    const summaryDrills = categories.map(c=>`<td style="vertical-align:top;padding:8px 6px;border:2px solid #333;font-size:12px;line-height:1.7">${c.drills.filter(Boolean).map(d=>`<div>${d}</div>`).join("")}</td>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${coachName} Drill Menu</title>
    <style>
      body{font-family:Arial,sans-serif;margin:0;padding:0.5in;font-size:12px}
      h1{text-align:center;font-size:20px;text-transform:uppercase;margin-bottom:28px;letter-spacing:1px}
      .summary-table{width:100%;border-collapse:collapse;margin-bottom:32px}
      .summary-title{background:#A6A6A6;text-align:center;font-weight:bold;font-size:15px;padding:9px;border:2px solid #333;text-transform:uppercase;letter-spacing:1px}
      .section{margin-bottom:24px}
      table{width:100%;border-collapse:collapse}
      .cat-header{text-align:left;font-weight:bold;padding:8px 10px;border:2px solid #333;width:46%;white-space:pre-line;text-transform:uppercase;font-size:12px}
      .day-header{background:#A6A6A6;text-align:center;font-weight:bold;text-decoration:underline;padding:8px 4px;border:2px solid #333;width:10.8%}
      .drill-cell{padding:6px 10px;border:1px solid #bbb}
      .day-cell{border:1px solid #bbb;padding:6px}
      .comments-title{background:#fff;font-weight:bold;font-size:15px;text-align:center;padding:10px;border:2px solid #333;text-transform:uppercase;letter-spacing:1px}
      .comment-label{font-weight:bold;padding:14px 10px;border:1px solid #bbb;vertical-align:top;width:13%}
      .comment-cell{padding:14px 10px;border:1px solid #bbb;height:55px}
      @media print{body{margin:0;padding:0.5in}@page{margin:0.5in}}
    </style></head><body>
    <h1>${coachName} – ${positionGroup} DRILL MENU</h1>
    <table class="summary-table"><tbody>
      <tr><td colspan="${categories.length}" class="summary-title">${positionGroup} DRILL MENU</td></tr>
      <tr>${summaryHeaders}</tr>
      <tr>${summaryDrills}</tr>
    </tbody></table>
    ${catRows}
    <div class="section"><table>
      <tr><td colspan="2" class="comments-title">COMMENTS</td></tr>
      ${["Monday","Tuesday","Wednesday","Thursday","Friday"].map(d=>`<tr><td class="comment-label">${d}</td><td class="comment-cell"></td></tr>`).join("")}
    </table></div>
    </body></html>`;

    // Use iframe method - more reliable than window.open
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    
    // Wait for iframe to load before printing
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // Clean up after printing
      setTimeout(() => document.body.removeChild(iframe), 100);
    };
  };

  const editing = categories.find(c=>c.id===editingCat);
  const days = ["MON","TUE","WED","THUR","FRI"];
  const EXTRA = 3;

  return (
    <div style={{fontFamily:"Arial,sans-serif",minHeight:"100vh",background:"#f0f2f5"}}>
      {/* Top Bar */}
      <div style={{background:"#1a1a2e",color:"#fff",padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <span style={{fontWeight:"bold",fontSize:16}}>🏈 Drill Menu Builder</span>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={()=>setView(v=>v==="edit"?"preview":"edit")}
            style={{background:"#4472C4",color:"#fff",border:"none",borderRadius:6,padding:"7px 16px",cursor:"pointer",fontWeight:"bold"}}>
            {view==="edit"?"👁 Preview":"✏️ Edit"}
          </button>
          <button onClick={openSave}
            style={{background:"#28a745",color:"#fff",border:"none",borderRadius:6,padding:"7px 16px",cursor:"pointer",fontWeight:"bold"}}>
            💾 Save
          </button>
          <button onClick={()=>setLoadModal(true)}
            style={{background:"#E26B0A",color:"#fff",border:"none",borderRadius:6,padding:"7px 16px",cursor:"pointer",fontWeight:"bold"}}>
            📂 Load
          </button>
          <button onClick={handlePrint}
            style={{background:"#CC0000",color:"#fff",border:"none",borderRadius:6,padding:"7px 16px",cursor:"pointer",fontWeight:"bold"}}>
            🖨 Print / PDF
          </button>
        </div>
      </div>

      {/* Save Modal */}
      {saveModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:10,padding:28,width:500,maxWidth:"90vw",boxShadow:"0 4px 24px rgba(0,0,0,0.2)"}}>
            <h3 style={{margin:"0 0 12px"}}>💾 Save Your Drill Menu</h3>
            <p style={{margin:"0 0 10px",fontSize:13,color:"#555"}}>Copy all the text below and paste it into a text file, email, or notes app. To reload later, paste it back using the Load button.</p>
            <textarea value={jsonText} readOnly rows={10}
              style={{width:"100%",fontFamily:"monospace",fontSize:11,border:"1px solid #ccc",borderRadius:6,padding:8,resize:"none",boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:10,marginTop:12}}>
              <button onClick={handleCopy}
                style={{flex:1,padding:"9px",background:"#4472C4",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:"bold"}}>
                {copyMsg||"📋 Copy to Clipboard"}
              </button>
              <button onClick={()=>setSaveModal(false)}
                style={{padding:"9px 20px",background:"#eee",border:"none",borderRadius:6,cursor:"pointer"}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {loadModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#fff",borderRadius:10,padding:28,width:500,maxWidth:"90vw",boxShadow:"0 4px 24px rgba(0,0,0,0.2)"}}>
            <h3 style={{margin:"0 0 12px"}}>📂 Load Your Drill Menu</h3>
            <p style={{margin:"0 0 10px",fontSize:13,color:"#555"}}>Paste your previously saved text below and click Load.</p>
            <textarea value={loadText} onChange={e=>setLoadText(e.target.value)} rows={10} placeholder="Paste your saved data here..."
              style={{width:"100%",fontFamily:"monospace",fontSize:11,border:"1px solid #ccc",borderRadius:6,padding:8,resize:"none",boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:10,marginTop:12}}>
              <button onClick={handleLoad}
                style={{flex:1,padding:"9px",background:"#28a745",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:"bold"}}>
                ✅ Load
              </button>
              <button onClick={()=>{setLoadModal(false);setLoadText("");}}
                style={{padding:"9px 20px",background:"#eee",border:"none",borderRadius:6,cursor:"pointer"}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {view==="edit" ? (
        <div style={{display:"flex",height:"calc(100vh - 56px)"}}>
          {/* Left sidebar */}
          <div style={{width:260,background:"#fff",borderRight:"1px solid #ddd",overflowY:"auto",padding:12}}>
            <div style={{fontWeight:"bold",marginBottom:10,fontSize:13,color:"#333"}}>CATEGORIES</div>
            {categories.map((c,i) => (
              <div key={c.id} onClick={()=>setEditingCat(c.id)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"8px 10px",marginBottom:4,borderRadius:6,cursor:"pointer",
                  background:editingCat===c.id?"#e8f0fe":"#f7f7f7",border:editingCat===c.id?"2px solid #4472C4":"2px solid transparent"}}>
                <div style={{width:14,height:14,borderRadius:3,background:c.color,flexShrink:0,border:"1px solid #ccc"}}/>
                <span style={{flex:1,fontSize:12,fontWeight:"bold",whiteSpace:"pre-line",lineHeight:1.2}}>{c.name}</span>
                <div style={{display:"flex",flexDirection:"column",gap:1}}>
                  <button onClick={e=>{e.stopPropagation();moveCat(c.id,-1);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,padding:"1px 3px"}}>▲</button>
                  <button onClick={e=>{e.stopPropagation();moveCat(c.id,1);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,padding:"1px 3px"}}>▼</button>
                </div>
                <button onClick={e=>{e.stopPropagation();deleteCat(c.id);}}
                  style={{background:"none",border:"none",color:"#c00",cursor:"pointer",fontSize:14,padding:"0 2px"}}>×</button>
              </div>
            ))}
            <button onClick={addCategory}
              style={{width:"100%",marginTop:8,padding:"8px",background:"#4472C4",color:"#fff",border:"none",borderRadius:6,cursor:"pointer",fontWeight:"bold",fontSize:13}}>
              + Add Category
            </button>
          </div>

          {/* Right editor */}
          <div style={{flex:1,overflowY:"auto",padding:24}}>
            <div style={{background:"#fff",borderRadius:8,padding:20,marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.1)"}}>
              <div style={{fontWeight:"bold",fontSize:14,marginBottom:12,color:"#333"}}>DOCUMENT INFO</div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:180}}>
                  <label style={{display:"block",fontSize:12,color:"#666",marginBottom:4}}>Coach Name</label>
                  <input value={coachName} onChange={e=>setCoachName(e.target.value.toUpperCase())}
                    style={{width:"100%",padding:"8px 10px",border:"1px solid #ccc",borderRadius:6,fontSize:14,fontWeight:"bold",boxSizing:"border-box"}}/>
                </div>
                <div style={{flex:1,minWidth:180}}>
                  <label style={{display:"block",fontSize:12,color:"#666",marginBottom:4}}>Position Group</label>
                  <input value={positionGroup} onChange={e=>setPositionGroup(e.target.value.toUpperCase())}
                    style={{width:"100%",padding:"8px 10px",border:"1px solid #ccc",borderRadius:6,fontSize:14,fontWeight:"bold",boxSizing:"border-box"}}/>
                </div>
              </div>
            </div>

            {editing ? (
              <div style={{background:"#fff",borderRadius:8,padding:20,boxShadow:"0 1px 4px rgba(0,0,0,0.1)"}}>
                <div style={{fontWeight:"bold",fontSize:14,marginBottom:16,color:"#333"}}>EDITING: {editing.name.split("\n")[0]}</div>
                <div style={{marginBottom:14}}>
                  <label style={{display:"block",fontSize:12,color:"#666",marginBottom:4}}>Category Name (hit Enter for a second line)</label>
                  <textarea value={editing.name} onChange={e=>updateCat(editing.id,"name",e.target.value)} rows={2}
                    style={{width:"100%",padding:"8px 10px",border:"1px solid #ccc",borderRadius:6,fontSize:14,fontWeight:"bold",resize:"vertical",boxSizing:"border-box"}}/>
                </div>
                <div style={{marginBottom:20}}>
                  <label style={{display:"block",fontSize:12,color:"#666",marginBottom:8}}>Header Color</label>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                    {PRESET_COLORS.map(col=>(
                      <div key={col} onClick={()=>updateCat(editing.id,"color",col)}
                        style={{width:30,height:30,borderRadius:6,background:col,cursor:"pointer",
                          border:editing.color===col?"3px solid #1a1a2e":"2px solid #ccc"}}/>
                    ))}
                    <input type="color" value={editing.color} onChange={e=>updateCat(editing.id,"color",e.target.value)}
                      style={{width:36,height:30,border:"1px solid #ccc",borderRadius:6,cursor:"pointer",padding:1}}/>
                    <span style={{fontSize:11,color:"#888"}}>Custom</span>
                  </div>
                </div>
                <div>
                  <label style={{display:"block",fontSize:12,color:"#666",marginBottom:8}}>Drills</label>
                  {editing.drills.map((d,i)=>(
                    <div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"center"}}>
                      <span style={{color:"#999",fontSize:12,width:18,textAlign:"right"}}>{i+1}.</span>
                      <input value={d} onChange={e=>updateDrill(editing.id,i,e.target.value)}
                        style={{flex:1,padding:"7px 10px",border:"1px solid #ddd",borderRadius:6,fontSize:13}}/>
                      <button onClick={()=>removeDrill(editing.id,i)}
                        style={{background:"#ffeaea",border:"1px solid #f5c6c6",color:"#c00",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:13}}>×</button>
                    </div>
                  ))}
                  <button onClick={()=>addDrill(editing.id)}
                    style={{marginTop:6,padding:"7px 16px",background:"#f0f7ff",border:"1px solid #4472C4",color:"#4472C4",borderRadius:6,cursor:"pointer",fontWeight:"bold",fontSize:13}}>
                    + Add Drill
                  </button>
                </div>
              </div>
            ) : (
              <div style={{textAlign:"center",color:"#aaa",marginTop:60,fontSize:15}}>
                ← Select a category to edit, or add a new one
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Preview */
        <div style={{background:"#fff",maxWidth:900,margin:"0 auto",padding:"30px 40px",fontFamily:"Arial,sans-serif"}}>
          <h1 style={{textAlign:"center",fontSize:22,fontWeight:"bold",textTransform:"uppercase",marginBottom:30,letterSpacing:1}}>
            {coachName} – {positionGroup} DRILL MENU
          </h1>
          <table style={{width:"100%",borderCollapse:"collapse",marginBottom:36,fontSize:13}}>
            <tbody>
              <tr><td colSpan={categories.length} style={{background:"#A6A6A6",textAlign:"center",fontWeight:"bold",fontSize:16,padding:"10px 6px",border:"2px solid #333",textTransform:"uppercase",letterSpacing:1}}>
                {positionGroup} DRILL MENU
              </td></tr>
              <tr>{categories.map(c=>(
                <td key={c.id} style={{background:c.color,color:contrastColor(c.color),fontWeight:"bold",textAlign:"center",padding:"8px 6px",border:"2px solid #333",fontSize:12,whiteSpace:"pre-line",verticalAlign:"middle",textTransform:"uppercase"}}>
                  {c.name}
                </td>
              ))}</tr>
              <tr>{categories.map(c=>(
                <td key={c.id} style={{verticalAlign:"top",padding:"8px 6px",border:"2px solid #333",fontSize:12,lineHeight:1.6}}>
                  {c.drills.filter(Boolean).map((d,i)=><div key={i}>{d}</div>)}
                </td>
              ))}</tr>
            </tbody>
          </table>
          {categories.map(c=>(
            <div key={c.id} style={{marginBottom:28}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr>
                  <th style={{background:c.color,color:contrastColor(c.color),textAlign:"left",fontWeight:"bold",padding:"8px 10px",border:"2px solid #333",width:"46%",whiteSpace:"pre-line",textTransform:"uppercase"}}>{c.name}</th>
                  {days.map(d=><th key={d} style={{background:"#A6A6A6",textAlign:"center",fontWeight:"bold",textDecoration:"underline",padding:"8px 4px",border:"2px solid #333",width:"10.8%"}}>{d}</th>)}
                </tr></thead>
                <tbody>
                  {[...c.drills.filter(Boolean),...Array(EXTRA).fill("")].map((d,i)=>(
                    <tr key={i} style={{background:i%2===0?"#fff":"#f9f9f9"}}>
                      <td style={{padding:"6px 10px",border:"1px solid #bbb"}}>{d}</td>
                      {days.map(day=><td key={day} style={{border:"1px solid #bbb",padding:"6px"}}></td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <tbody>
              <tr><td colSpan={2} style={{fontWeight:"bold",fontSize:16,textAlign:"center",padding:"10px",border:"2px solid #333",textTransform:"uppercase",letterSpacing:1}}>COMMENTS</td></tr>
              {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(day=>(
                <tr key={day}>
                  <td style={{width:"14%",fontWeight:"bold",padding:"14px 10px",border:"1px solid #bbb",verticalAlign:"top"}}>{day}</td>
                  <td style={{padding:"14px 10px",border:"1px solid #bbb",height:60}}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
