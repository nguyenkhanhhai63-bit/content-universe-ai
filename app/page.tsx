"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Hook={id:string;theme:string;text:string};
type Formula={id:string;name:string;category:string;template:string};
type Story={id:string;title:string;theme:string;status:"draft"|"posted";content:string;created:string};

const defaults={
 hooks:[
  {id:"h1",theme:"Công việc",text:"Đang gọi video với đối tác nước ngoài, điện thoại anh khách đứng hình. Sếp quay sang nói: “Mai còn mang cái máy này đi làm thì nghỉ luôn đi!”"},
  {id:"h2",theme:"Bị coi thường",text:"Đi cà phê với hội bạn, chị khách vừa đặt điện thoại lên bàn thì có đứa cười: “Android cỏ mà cũng đem ra khoe hả?”"},
  {id:"h3",theme:"Gia đình",text:"Mẹ vừa bước vào shop đã nói lớn: “Tài chính hơn bốn triệu thôi, tư vấn sao cho nó học được chứ đừng dụ chơi game nha!”"}
 ] as Hook[],
 formulas:[
  {id:"f1",name:"Căng thẳng rồi bẻ lái",category:"Kể chuyện",template:`HOOK
{{hook}}

DIỄN BIẾN
[surprised] Hả??? {{character}} vừa ngại vừa bực vì {{conflict}} trong lúc {{context}}.

[whispering] Nói nhỏ nè... Sau chuyện đó, {{character}} ghé Siêu Di Động để tìm máy phù hợp hơn.

CAO TRÀO
[gasping] Trời đất ơi... Cầm thử vài mẫu mới thấy chiếc máy cũ đúng là nên nghỉ hưu từ lâu.

TWIST
[realization] Ra là vậy... {{twist}}.

KẾT
[playful] Dữ thần nha... {{ending}}.`},
  {id:"f2",name:"Hiểu lầm rồi mua luôn",category:"Hiểu lầm",template:`HOOK
{{hook}}

MÂU THUẪN
{{character}} tới kiểm tra vì {{conflict}}.

ĐỐI CHẤT
Nhân viên mở máy test trực tiếp, giải thích rõ từng vấn đề.

TWIST
{{twist}}.

KẾT
{{ending}}.`}
 ] as Formula[],
 stories:[] as Story[],
 style:`Bạn là TikToker chuyên kể chuyện công nghệ cho Siêu Di Động.
- Viết giống người thật đang kể một chuyện vừa xảy ra.
- Không viết kiểu MC, quảng cáo hoặc review khô.
- Hook phải rõ ai, ở đâu và chuyện gì xảy ra.
- Không dùng: chốt đơn, siêu phẩm, xuống tiền, múc, cấu hình khủng.
- Không chê khách nghèo.
- Có thể dùng [surprised], [whispering], [gasping], [realization], [playful].
- Không tự bịa thông số máy.
- Sửa đoạn ghép máy móc, lặp ý hoặc thiếu nguyên nhân.`
};

const KEY="cu_v6_local";

export default function Home(){
 const [page,setPage]=useState("dashboard");
 const [hooks,setHooks]=useState<Hook[]>(defaults.hooks);
 const [formulas,setFormulas]=useState<Formula[]>(defaults.formulas);
 const [stories,setStories]=useState<Story[]>([]);
 const [style,setStyle]=useState(defaults.style);
 const [formulaId,setFormulaId]=useState("f1");
 const [theme,setTheme]=useState("Công việc");
 const [character,setCharacter]=useState("anh khách");
 const [context,setContext]=useState("đang gọi video với đối tác nước ngoài tại công ty");
 const [conflict,setConflict]=useState("điện thoại đứng hình đúng lúc đối tác hỏi báo giá");
 const [twist,setTwist]=useState("sếp không đuổi việc mà hỗ trợ tiền đổi máy");
 const [ending,setEnding]=useState("hôm sau khách ký được hợp đồng");
 const [result,setResult]=useState("");
 const [title,setTitle]=useState("");
 const [reviewInput,setReviewInput]=useState("");
 const [reviewResult,setReviewResult]=useState("");
 const [status,setStatus]=useState("");
 const [search,setSearch]=useState("");
 const [filter,setFilter]=useState("all");
 const [hookForm,setHookForm]=useState<Hook|null>(null);
 const [formulaForm,setFormulaForm]=useState<Formula|null>(null);
 const supabase=useMemo(()=>createClient(),[]);

 useEffect(()=>{const d=localStorage.getItem(KEY);if(d){try{const x=JSON.parse(d);setHooks(x.hooks||defaults.hooks);setFormulas(x.formulas||defaults.formulas);setStories(x.stories||[]);setStyle(x.style||defaults.style)}catch{}}},[]);
 useEffect(()=>{localStorage.setItem(KEY,JSON.stringify({hooks,formulas,stories,style}))},[hooks,formulas,stories,style]);

 const info={theme,character,context,conflict,twist,ending};
 const chosenHook=hooks.find(h=>h.theme===theme)?.text||hooks[0]?.text||"";
 const apply=(t:string)=>t.replace(/\{\{(\w+)\}\}/g,(_,k:any)=>({hook:chosenHook,theme,character,context,conflict,twist,ending} as any)[k]||"");
 const localDraft=()=>{const f=formulas.find(x=>x.id===formulaId)||formulas[0];setResult(apply(f.template));setTitle(`${theme} – ${character}`);setStatus("Đã tạo bản nháp miễn phí.")};
 async function callAI(mode:string,input=""){setStatus("AI đang xử lý...");try{const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode,input,info,style})});const d=await r.json();if(!r.ok)throw new Error(d.error);if(mode==="review"||mode==="rewrite")setReviewResult(d.text);else setResult(d.text);setStatus("Hoàn tất.")}catch(e:any){setStatus(e.message||"Lỗi AI.")}}
 async function saveStory(){if(!result.trim())return;const s:Story={id:crypto.randomUUID(),title:title||"Kịch bản chưa đặt tên",theme,status:"draft",content:result,created:new Date().toISOString()};setStories(x=>[s,...x]);if(supabase){await supabase.from("stories").insert({title:s.title,theme:s.theme,status:s.status,content:s.content})}setStatus("Đã lưu kịch bản.")}
 function copy(t:string){navigator.clipboard?.writeText(t).catch(()=>{});alert("Đã sao chép.");}

 const nav=[["dashboard","Tổng quan"],["writer","Tạo kịch bản"],["review","AI đọc lại"],["hooks","Kho Hook"],["formulas","Kho Công thức"],["stories","Kho Kịch bản"],["universe","Content Universe"],["settings","Thiết lập"]];
 return <div className="shell">
  <aside className="sidebar"><div className="brand">CONTENT UNIVERSE ⭐</div><div className="sub">Siêu Di Động – V6</div><div className="nav">{nav.map(n=><button key={n[0]} className={page===n[0]?"active":""} onClick={()=>setPage(n[0])}>{n[1]}</button>)}</div></aside>
  <main className="main">
   <div className="top"><h1>{nav.find(n=>n[0]===page)?.[1]}</h1><div className="toolbar"><button className="btn" onClick={()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify({hooks,formulas,stories,style},null,2)],{type:"application/json"}));a.download="content-universe-v6-data.json";a.click()}}>Xuất dữ liệu</button><button className="btn yellow" onClick={()=>setPage("writer")}>+ Kịch bản mới</button></div></div>

   {page==="dashboard"&&<><div className="grid4"><div className="stat"><span className="muted">Tổng kịch bản</span><strong>{stories.length}</strong></div><div className="stat"><span className="muted">Chưa đăng</span><strong>{stories.filter(s=>s.status==="draft").length}</strong></div><div className="stat"><span className="muted">Đã đăng</span><strong>{stories.filter(s=>s.status==="posted").length}</strong></div><div className="stat"><span className="muted">Hook</span><strong>{hooks.length}</strong></div></div><div className="grid2" style={{marginTop:16}}><div className="panel"><div className="head"><h3>Chủ đề</h3></div>{["Công việc","Bị coi thường","Tình yêu","Gia đình","Game"].map(t=><div className="row" key={t}><b>{t}</b><span>{stories.filter(s=>s.theme===t).length} kịch bản</span></div>)}</div><div className="panel"><div className="head"><h3>Gần đây</h3></div>{stories.slice(0,5).map(s=><div className="row" key={s.id}><div><b>{s.title}</b><div className="muted">{s.theme}</div></div><button className="btn" onClick={()=>{setResult(s.content);setTitle(s.title);setPage("writer")}}>Mở</button></div>)}</div></div></>}

   {page==="writer"&&<div className="grid2"><div className="panel">
    <div className="field"><label>Công thức</label><select value={formulaId} onChange={e=>setFormulaId(e.target.value)}>{formulas.map(f=><option key={f.id} value={f.id}>{f.category} – {f.name}</option>)}</select></div>
    <div className="field"><label>Chủ đề</label><select value={theme} onChange={e=>setTheme(e.target.value)}>{["Công việc","Bị coi thường","Tình yêu","Gia đình","Học sinh – sinh viên","Game","Tiền bạc","Hiểu lầm shop"].map(x=><option key={x}>{x}</option>)}</select></div>
    {[["Nhân vật",character,setCharacter],["Bối cảnh",context,setContext],["Mâu thuẫn",conflict,setConflict],["Twist",twist,setTwist],["Kết thúc",ending,setEnding]].map((x:any)=><div className="field" key={x[0]}><label>{x[0]}</label><input value={x[1]} onChange={e=>x[2](e.target.value)}/></div>)}
    <div className="toolbar"><button className="btn primary" onClick={localDraft}>Tạo bản nháp miễn phí</button><button className="btn green" onClick={()=>callAI("create")}>AI Writer</button><button className="btn" onClick={()=>callAI("hooks")}>20 Hook AI</button></div><div className={status.includes("Lỗi")?"error":"ok"}>{status}</div>
   </div><div className="panel"><div className="head"><h3>Kịch bản</h3><div className="toolbar"><button className="btn" onClick={()=>copy(result)}>Sao chép</button><button className="btn primary" onClick={saveStory}>Lưu</button></div></div><input className="search" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Tiêu đề"/><textarea className="big" value={result} onChange={e=>setResult(e.target.value)} style={{marginTop:10}}/></div></div>}

   {page==="review"&&<div className="grid2"><div className="panel"><textarea className="big" value={reviewInput} onChange={e=>setReviewInput(e.target.value)} placeholder="Dán kịch bản..."/><div className="toolbar" style={{marginTop:10}}><button className="btn primary" onClick={()=>callAI("review",reviewInput)}>AI Analyst</button><button className="btn green" onClick={()=>callAI("rewrite",reviewInput)}>AI Editor</button></div><div>{status}</div></div><div className="panel"><div className="head"><h3>Kết quả</h3><button className="btn" onClick={()=>copy(reviewResult)}>Sao chép</button></div><textarea className="big" value={reviewResult} onChange={e=>setReviewResult(e.target.value)}/></div></div>}

   {page==="hooks"&&<div className="panel"><div className="head"><h3>Kho Hook</h3><button className="btn primary" onClick={()=>setHookForm({id:"",theme:"",text:""})}>+ Thêm Hook</button></div><input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm hook..."/><div className="grid3" style={{marginTop:12}}>{hooks.filter(h=>(h.theme+" "+h.text).toLowerCase().includes(search.toLowerCase())).map(h=><div className="card" key={h.id}><span className="pill">{h.theme}</span><p>{h.text}</p><div className="toolbar"><button className="btn" onClick={()=>setHookForm(h)}>Sửa</button><button className="btn" onClick={()=>copy(h.text)}>Sao chép</button><button className="btn red" onClick={()=>setHooks(x=>x.filter(y=>y.id!==h.id))}>Xóa</button></div></div>)}</div></div>}

   {page==="formulas"&&<div className="panel"><div className="head"><h3>Kho Công thức</h3><button className="btn primary" onClick={()=>setFormulaForm({id:"",name:"",category:"",template:""})}>+ Thêm Công thức</button></div><div className="grid3">{formulas.map(f=><div className="card" key={f.id}><span className="pill">{f.category}</span><h3>{f.name}</h3><p>{f.template.slice(0,160)}...</p><div className="toolbar"><button className="btn" onClick={()=>setFormulaForm(f)}>Sửa</button><button className="btn" onClick={()=>setFormulas(x=>[...x,{...f,id:crypto.randomUUID(),name:f.name+" – Bản sao"}])}>Nhân bản</button><button className="btn red" onClick={()=>formulas.length>1&&setFormulas(x=>x.filter(y=>y.id!==f.id))}>Xóa</button></div></div>)}</div></div>}

   {page==="stories"&&<div className="panel"><div className="head"><h3>Kho Kịch bản</h3><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tất cả</option><option value="draft">Chưa đăng</option><option value="posted">Đã đăng</option></select></div><input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm kịch bản..."/><div className="list" style={{marginTop:12}}>{stories.filter(s=>(filter==="all"||s.status===filter)&&(s.title+" "+s.content).toLowerCase().includes(search.toLowerCase())).map(s=><div className="row" key={s.id}><div><b>{s.title}</b><div className="muted">{s.theme} • {s.status==="posted"?"Đã đăng":"Chưa đăng"}</div></div><div className="toolbar"><button className="btn" onClick={()=>{setResult(s.content);setTitle(s.title);setPage("writer")}}>Mở</button><button className="btn green" onClick={()=>setStories(x=>x.map(y=>y.id===s.id?{...y,status:y.status==="draft"?"posted":"draft"}:y))}>Đổi trạng thái</button><button className="btn red" onClick={()=>setStories(x=>x.filter(y=>y.id!==s.id))}>Xóa</button></div></div>)}</div></div>}

   {page==="universe"&&<div className="grid3">{[["💼","Công việc"],["😒","Bị coi thường"],["❤️","Tình yêu"],["👨‍👩‍👧","Gia đình"],["🎓","Học sinh"],["🎮","Game"],["💰","Tiền bạc"],["😡","Hiểu lầm shop"]].map(u=><div className="card" key={u[1]}><h3>{u[0]} {u[1]}</h3><p>{hooks.filter(h=>h.theme===u[1]).length} hook • {stories.filter(s=>s.theme===u[1]).length} kịch bản</p></div>)}</div>}

   {page==="settings"&&<div className="panel"><div className="head"><h3>Phong cách Siêu Di Động</h3></div><textarea className="big" value={style} onChange={e=>setStyle(e.target.value)}/><div className="note">Tự lưu trong trình duyệt. Khi Supabase được cấu hình, kịch bản mới cũng được lưu online.</div></div>}
  </main>

  {hookForm&&<div className="modal show"><div className="modalbox"><div className="head"><h3>Hook</h3><button className="btn" onClick={()=>setHookForm(null)}>Đóng</button></div><div className="field"><label>Chủ đề</label><input value={hookForm.theme} onChange={e=>setHookForm({...hookForm,theme:e.target.value})}/></div><div className="field"><label>Nội dung</label><textarea className="mid" value={hookForm.text} onChange={e=>setHookForm({...hookForm,text:e.target.value})}/></div><button className="btn primary" onClick={()=>{setHooks(x=>hookForm.id?x.map(h=>h.id===hookForm.id?hookForm:h):[...x,{...hookForm,id:crypto.randomUUID()}]);setHookForm(null)}}>Lưu</button></div></div>}

  {formulaForm&&<div className="modal show"><div className="modalbox"><div className="head"><h3>Công thức</h3><button className="btn" onClick={()=>setFormulaForm(null)}>Đóng</button></div><div className="field"><label>Tên</label><input value={formulaForm.name} onChange={e=>setFormulaForm({...formulaForm,name:e.target.value})}/></div><div className="field"><label>Nhóm</label><input value={formulaForm.category} onChange={e=>setFormulaForm({...formulaForm,category:e.target.value})}/></div><div className="field"><label>Mẫu</label><textarea className="big" value={formulaForm.template} onChange={e=>setFormulaForm({...formulaForm,template:e.target.value})}/></div><button className="btn primary" onClick={()=>{setFormulas(x=>formulaForm.id?x.map(f=>f.id===formulaForm.id?formulaForm:f):[...x,{...formulaForm,id:crypto.randomUUID()}]);setFormulaForm(null)}}>Lưu</button></div></div>}
 </div>;
}
